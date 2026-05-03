import { NextResponse, type NextRequest } from 'next/server';
import { exchangeCodeForToken, fetchUserInfo } from '@/lib/oauth';
import { upsertUser } from '@/lib/db';
import { setSession } from '@/lib/session';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get('code');
  const state = req.nextUrl.searchParams.get('state');

  if (!code || !state) {
    return NextResponse.json(
      { error: 'missing code or state' },
      { status: 400 },
    );
  }

  try {
    // Server-side calls to oauth2.googleapis.com / www.googleapis.com — these
    // are the second and third assertable legs of the OAuth flow in the
    // Dokkimi timeline.
    const tokens = await exchangeCodeForToken(code);
    const userInfo = await fetchUserInfo(tokens.access_token);
    const user = await upsertUser(userInfo.sub, userInfo.email, userInfo.name);

    await setSession({
      userId: user.id,
      email: user.email,
      name: user.name,
    });

    const res = NextResponse.redirect(new URL('/dashboard', req.url));
    res.cookies.delete('oauth_state');
    return res;
  } catch (err) {
    console.error('[auth/callback] OAuth handshake failed:', err);
    // Redirect to the login page with an error banner instead of letting
    // the route handler throw and Next.js render a default 500 page —
    // gives the user (and tests) a deterministic surface to land on.
    return NextResponse.redirect(
      new URL('/login?error=oauth_failed', req.url),
      303,
    );
  }
}
