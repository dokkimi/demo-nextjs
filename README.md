# Dokkimi + Next.js Demo

A Next.js 15 app with Google OAuth, PostgreSQL, and an infinite-scroll bookmark feed — fully tested with [Dokkimi](https://github.com/dokkimi/dokkimi) integration tests that run in CI via GitHub Actions.

## What's in the app

**BookmarkHub** is a small full-stack Next.js app with:

- **Google OAuth sign-in** (authorization code flow)
- **PostgreSQL** for users and bookmarks
- **Infinite-scroll feed** with cursor-based pagination
- **Country dropdown** with ~200 options and inner scrolling
- **Bookmark creation** form (authenticated)

## What Dokkimi tests

The `.dokkimi/` folder defines 6 integration tests that exercise the app end-to-end in an isolated Kubernetes namespace:

| Test | What it covers |
|------|---------------|
| `oauth-login` | Full OAuth redirect chain through 3 mocked Google endpoints, lands on dashboard with correct user identity |
| `auth-failures` | Bare callback without code/state returns 400; unauthenticated POST returns 401 |
| `logout-flow` | Sign in, sign out, verify session is cleared (dashboard redirects to login) |
| `create-bookmark` | Sign in, open form, scroll dropdown to Zimbabwe, submit, verify DB row via `dbQuery` |
| `infinite-scroll` | Load first page (10 items), scroll sentinel into view, verify second page fires and renders 20 items |
| `oauth-token-failure` | Token exchange returns 401 — error banner renders, userinfo never fires, no session leaks |

Each test uses **mocked external services** (Google OAuth endpoints) so no real credentials are needed. The interceptor sidecar catches outbound requests to `accounts.google.com`, `oauth2.googleapis.com`, and `www.googleapis.com` and serves canned responses.

### Visual regression testing

Several tests include `screenshot` + `match: true` steps that capture UI baselines. On first run, Dokkimi stores the screenshots. On subsequent runs, it diffs against the stored baselines to catch visual regressions. Baseline images live in `.dokkimi/baselines/`.

## Project structure

```
.dokkimi/
├── config.yaml                  # Dokkimi version pin
├── init-files/init.sql          # DB seed: users + 25 bookmarks
├── shared/                      # Reusable service/mock definitions
│   ├── nextjs-demo.yaml         # SERVICE: the Next.js app
│   ├── postgres.yaml            # DATABASE: PostgreSQL with seed data
│   ├── mock-google-authorize.yaml
│   ├── mock-google-token.yaml
│   ├── mock-google-userinfo.yaml
│   └── login-flow.yaml          # Reusable UI step sequence for OAuth sign-in
├── baselines/                   # Visual regression baseline images
└── definitions/                 # Test definitions
    ├── oauth-login.yaml
    ├── auth-failures.yaml
    ├── logout-flow.yaml
    ├── create-bookmark.yaml
    ├── infinite-scroll.yaml
    └── oauth-token-failure.yaml
src/                             # Next.js 15 app source
Dockerfile                       # Multi-stage build → standalone output
```

## Running locally

### Prerequisites

- [Docker](https://docs.docker.com/get-docker/)
- [Dokkimi CLI](https://github.com/dokkimi/dokkimi) (`brew install dokkimi/tap/dokkimi` or `curl -fsSL https://get.dokkimi.com | sh`)
- A local Kubernetes cluster (Docker Desktop's built-in K8s, k3s, minikube, etc.)

### Steps

```bash
# 1. Build the app image
docker build -t nextjs-demo:latest .

# 2. Run all tests
dokkimi run .dokkimi

# 3. Or run a single test definition
dokkimi run .dokkimi/definitions/oauth-login.yaml
```

## Running in CI (GitHub Actions)

This repo includes a GitHub Actions workflow at `.github/workflows/dokkimi.yml` that:

1. Builds the `nextjs-demo:latest` Docker image
2. Uses the [`dokkimi/dokkimi-action`](https://github.com/dokkimi/dokkimi-action) GitHub Action, which handles k3s setup, CLI installation, test execution, and cleanup

```yaml
- name: Run Dokkimi tests
  uses: dokkimi/dokkimi-action@v1
  with:
    tests: .dokkimi
```

## How the mocks work

Dokkimi deploys an interceptor sidecar alongside each service. The interceptor catches all outbound HTTP traffic from the pod and matches it against configured mocks:

1. **Browser → `accounts.google.com`** — the authorize mock 302s back to `/api/auth/callback` with a fixed code
2. **Server → `oauth2.googleapis.com`** — the token mock returns a canned access token
3. **Server → `www.googleapis.com`** — the userinfo mock returns a deterministic user profile

This lets you test the real OAuth flow in your app code without real Google credentials or network access.

## License

MIT
