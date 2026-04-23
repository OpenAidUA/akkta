import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/shared/superbase/server';

export async function POST() {
  try {
    const supabase = await createSupabaseServerClient();
    // This will clear server-side cookies via the server client helper
    await supabase.auth.signOut();

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('Signout error:', err);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
