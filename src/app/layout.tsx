import type { ReactNode } from 'react';
import './globals.css';

export const metadata = {
  title: 'BookmarkHub',
  description: 'Dokkimi demo: Next.js + OAuth + infinite scroll + dropdown',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <header data-testid="app-header">
          <a href="/" data-testid="nav-home">
            BookmarkHub
          </a>
          <nav>
            <a href="/dashboard" data-testid="nav-dashboard">
              Dashboard
            </a>
            <a href="/bookmarks/new" data-testid="nav-new-bookmark">
              New
            </a>
            <a href="/login" data-testid="nav-login">
              Sign in
            </a>
          </nav>
        </header>
        <main>{children}</main>
      </body>
    </html>
  );
}
