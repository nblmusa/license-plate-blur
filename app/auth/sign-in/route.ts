import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const formData = await request.formData();
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // First sign in to get the user ID
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Check if user has 2FA enabled
    let { data: settings, error: settingsError } = await supabase
      .from('user_settings')
      .select('two_factor_enabled, two_factor_secret')
      .eq('user_id', data.user.id)
      .single();

    // If no settings exist, create default settings
    if (settingsError && settingsError.code === 'PGRST116') {
      const { data: newSettings, error: createError } = await supabase
        .from('user_settings')
        .insert([{
          user_id: data.user.id,
          two_factor_enabled: false,
          two_factor_secret: null,
          settings: {},
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (createError) {
        console.error('Failed to create user settings:', createError);
        return NextResponse.json(
          { error: 'Failed to initialize user settings' },
          { status: 500 }
        );
      }

      settings = newSettings;
      settingsError = null;
    } else if (settingsError) {
      console.error('Failed to check 2FA settings:', settingsError);
      return NextResponse.json(
        { error: 'Failed to check 2FA settings' },
        { status: 500 }
      );
    }

    // If 2FA is enabled and properly configured
    if (settings?.two_factor_enabled && settings?.two_factor_secret) {
      // Sign out immediately - we'll sign in after 2FA verification
      await supabase.auth.signOut();
      
      return NextResponse.json({
        requires2FA: true,
        tempSession: {
          email,
          userId: data.user.id,
          hashedPassword: password
        }
      });
    }

    // If 2FA is enabled but not properly configured, we should not allow login
    if (settings?.two_factor_enabled && !settings?.two_factor_secret) {
      await supabase.auth.signOut();
      return NextResponse.json(
        { error: '2FA is enabled but not properly configured' },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Sign in error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 