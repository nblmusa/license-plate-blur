import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { authenticator } from 'otplib';

export async function POST(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { code, session } = await request.json();

    if (!code || !session?.email || !session?.userId || !session?.hashedPassword) {
      return NextResponse.json(
        { error: 'Invalid request - missing required fields' },
        { status: 400 }
      );
    }

    // Get user's 2FA settings
    let { data: settings, error: settingsError } = await supabase
      .from('user_settings')
      .select('two_factor_enabled, two_factor_secret')
      .eq('user_id', session.userId)
      .single();

    // console.log('settings', settings);
    // console.log('session.userId', session.userId)
    // console.log('settingsError', settingsError)
// return NextResponse.json({ success: true });

    // If no settings exist, create default settings
    if (settingsError && settingsError.code === 'PGRST116') {
      const { data: newSettings, error: createError } = await supabase
        .from('user_settings')
        .insert([{
          user_id: session.userId,
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
      console.error('Failed to get 2FA settings:', settingsError);
      return NextResponse.json(
        { error: 'Failed to verify 2FA settings' },
        { status: 500 }
      );
    }

    if (!settings?.two_factor_enabled || !settings?.two_factor_secret) {
      console.error('2FA is not properly configured:', { 
        enabled: settings?.two_factor_enabled,
        hasSecret: !!settings?.two_factor_secret 
      });
      return NextResponse.json(
        { error: '2FA is not properly configured' },
        { status: 400 }
      );
    }

    // Verify the code
    const isValid = authenticator.verify({
      token: code,
      secret: settings.two_factor_secret
    });

    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid verification code' },
        { status: 400 }
      );
    }

    // If code is valid, sign in the user
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: session.email,
      password: session.hashedPassword
    });

    if (signInError) {
      console.error('Failed to sign in after 2FA:', signInError);
      return NextResponse.json(
        { error: 'Failed to complete sign in' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('2FA verification error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 