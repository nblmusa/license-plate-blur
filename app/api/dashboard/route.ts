import { NextResponse } from 'next/server';
import crypto from 'crypto';
import supabaseServer from "@/lib/supabase-server"; 

function generateApiKey() {
  return `lpm_${crypto.randomBytes(32).toString('hex')}`;
}

export async function GET() {
  try {
    const supabase = supabaseServer();
    
    // Check authentication
    const { data: { session }, error: authError } = await supabase.auth.getSession();
    if (authError || !session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;

    // Get or create user stats
    let { data: stats, error: statsError } = await supabase
      .from('user_stats')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (statsError) {
      if (statsError.code === 'PGRST116') {
        // Create default stats if they don't exist
        const { data: newStats, error: createStatsError } = await supabase
          .from('user_stats')
          .insert([{
            user_id: userId,
            images_processed: 0,
            monthly_quota: 100,
            detected_plates: 0
          }])
          .select()
          .single();

        if (createStatsError) {
          throw createStatsError;
        }
        stats = newStats;
      } else {
        throw statsError;
      }
    }

    // Get recent activity
    const { data: recentActivity, error: activityError } = await supabase
      .from('processed_images')
      .select('*')
      .eq('user_id', userId)
      .order('processed_at', { ascending: false })
      .limit(6);

    if (activityError) {
      throw activityError;
    }

    // Get or create API key
    let { data: apiKeys, error: keyError } = await supabase
      .from('api_keys')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(1);

    if (keyError || !apiKeys?.length) {
      // Create a new API key if none exists
      const newKey = generateApiKey();
      const { data: newApiKey, error: createKeyError } = await supabase
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

      if (createKeyError) {
        throw createKeyError;
      }
      apiKeys = [newApiKey];
    }

    return NextResponse.json({
      stats,
      recentActivity: recentActivity || [],
      apiKey: apiKeys[0]
    });
  } catch (error) {
    console.error('Dashboard API Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    );
  }
} 