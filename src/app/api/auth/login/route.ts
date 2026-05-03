import crypto from 'crypto';
import { NextResponse } from 'next/server';
import { buildAuthorizeUrl } from '@/lib/oauth';

export const dynamic = 'force-dynamic';

export async function GET() {
  const state = crypto.randomBytes(16).toString('hex');
  const url = buildAuthorizeUrl(state);
  // Browser follows the redirect to https://accounts.google.com/... — in the
  // Dokkimi namespace the interceptor catches that hostname and serves the
  // configured MOCK, which 302s back to /api/auth/callback with a code.
  const res = NextResponse.redirect(url);
  res.cookies.set('oauth_state', state, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 600,
  });
  return res;
}
