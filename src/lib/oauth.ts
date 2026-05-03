/**
 * OAuth 2.0 client (authorization code flow) wired to the real Google
 * OAuth URLs. In a Dokkimi test environment the namespace's interceptor
 * catches calls to accounts.google.com / oauth2.googleapis.com /
 * www.googleapis.com and serves the configured MOCK responses, so app
 * code stays prod-shaped while tests stay deterministic.
 *
 * State CSRF validation is intentionally relaxed in this demo (the URL
 * state is accepted as long as it's present) because Dokkimi MOCKs cannot
 * dynamically echo the random state parameter back into the redirect
 * Location. A real production deployment would compare the cookie state
 * against the URL state.
 */

const AUTHORIZE_URL = 'https://accounts.google.com/o/oauth2/v2/auth';
const TOKEN_URL = 'https://oauth2.googleapis.com/token';
const USERINFO_URL = 'https://www.googleapis.com/oauth2/v3/userinfo';

const CLIENT_ID = process.env.OAUTH_CLIENT_ID ?? 'demo-client-id';
const CLIENT_SECRET = process.env.OAUTH_CLIENT_SECRET ?? 'demo-client-secret';
const REDIRECT_URI =
  process.env.OAUTH_REDIRECT_URI ?? 'http://nextjs-demo/api/auth/callback';

export function buildAuthorizeUrl(state: string): string {
  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    redirect_uri: REDIRECT_URI,
    response_type: 'code',
    scope: 'openid email profile',
    state,
  });
  return `${AUTHORIZE_URL}?${params.toString()}`;
}

export interface TokenResponse {
  access_token: string;
  id_token?: string;
  token_type: string;
  expires_in: number;
}

export async function exchangeCodeForToken(
  code: string,
): Promise<TokenResponse> {
  const body = new URLSearchParams({
    code,
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
    redirect_uri: REDIRECT_URI,
    grant_type: 'authorization_code',
  });
  const res = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`token exchange failed: ${res.status} ${text}`);
  }
  return (await res.json()) as TokenResponse;
}

export interface UserInfo {
  sub: string;
  email: string;
  name: string;
  picture?: string;
}

export async function fetchUserInfo(accessToken: string): Promise<UserInfo> {
  const res = await fetch(USERINFO_URL, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`userinfo failed: ${res.status} ${text}`);
  }
  return (await res.json()) as UserInfo;
}
