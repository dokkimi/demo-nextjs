import BookmarkFeed from '@/components/BookmarkFeed';

export const dynamic = 'force-dynamic';

export default function Home() {
  return (
    <div data-testid="home-page">
      <h1>Recent Bookmarks</h1>
      <p>Scroll to load more.</p>
      <BookmarkFeed />
    </div>
  );
}
