import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import crypto from 'crypto';
import supabaseServer from "@/lib/supabase-server"; 

// Generate a secure API key
function generateApiKey() {
  return `lpm_${crypto.randomBytes(32).toString('hex')}`;
}

export async function POST() {
  try {
    const supabase = supabaseServer();
    
    // Check authentication
    const { data: { session }, error: authError } = await supabase.auth.getSession();
    if (authError || !session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;

    // Deactivate existing API keys
    await supabase
      .from('api_keys')
      .update({ is_active: false })
      .eq('user_id', userId);

    // Generate and insert new API key
    const newKey = generateApiKey();
    const { data: apiKey, error: keyError } = await supabase
      .from('api_keys')
      .insert([{
        user_id: userId,
        key: newKey,
        name: 'Default API Key',
        expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year expiry
        is_active: true
      }])
      .select()
      .single();

    if (keyError) {
      throw keyError;
    }

    return NextResponse.json({ apiKey });
  } catch (error) {
    console.error('API Key Generation Error:', error);
    return NextResponse.json(
      { error: 'Failed to generate API key' },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  try {
    const supabase = supabaseServer();
    
    // Check authentication
    const { data: { session }, error: authError } = await supabase.auth.getSession();
    if (authError || !session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;

    // Deactivate all API keys
    const { error: keyError } = await supabase
      .from('api_keys')
      .update({ is_active: false })
      .eq('user_id', userId);

    if (keyError) {
      throw keyError;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('API Key Deletion Error:', error);
    return NextResponse.json(
      { error: 'Failed to delete API key' },
      { status: 500 }
    );
  }
} 