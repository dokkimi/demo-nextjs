interface Props {
  searchParams: Promise<{ error?: string }>;
}

export default async function LoginPage({ searchParams }: Props) {
  const params = await searchParams;
  const showError = params.error === 'oauth_failed';

  return (
    <div data-testid="login-page" className="card">
      <h1>Sign in</h1>
      {showError && (
        <p
          data-testid="oauth-error"
          style={{ color: '#b91c1c', fontWeight: 500 }}
        >
          Sign-in failed. Please try again.
        </p>
      )}
      <p>Use your Google account to continue.</p>
      <form action="/api/auth/login" method="get">
        <button
          type="submit"
          className="primary"
          data-testid="login-google-button"
        >
          Sign in with Google
        </button>
      </form>
    </div>
  );
}
