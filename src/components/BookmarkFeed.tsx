'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

interface Bookmark {
  id: number;
  title: string;
  url: string;
  country: string;
}

const PAGE_SIZE = 10;

export default function BookmarkFeed() {
  const [items, setItems] = useState<Bookmark[]>([]);
  const [cursor, setCursor] = useState<number | null>(null);
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const loadMore = useCallback(async () => {
    if (loading || done) {
      return;
    }
    setLoading(true);
    const params = new URLSearchParams();
    params.set('limit', String(PAGE_SIZE));
    if (cursor !== null) {
      params.set('cursor', String(cursor));
    }
    const res = await fetch(`/api/bookmarks?${params.toString()}`);
    const data = (await res.json()) as {
      items: Bookmark[];
      nextCursor: number | null;
    };
    setItems((prev) => [...prev, ...data.items]);
    setCursor(data.nextCursor);
    if (data.nextCursor === null) {
      setDone(true);
    }
    setLoading(false);
  }, [cursor, done, loading]);

  // Initial load.
  useEffect(() => {
    void loadMore();
  }, []);

  // IntersectionObserver: fire loadMore when the sentinel scrolls into view.
  useEffect(() => {
    if (!sentinelRef.current) {
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          void loadMore();
        }
      },
      { rootMargin: '100px' },
    );
    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [loadMore]);

  return (
    <div data-testid="bookmark-feed">
      <ul
        data-testid="bookmark-list"
        data-count={items.length}
        style={{ listStyle: 'none', padding: 0 }}
      >
        {items.map((b) => (
          <li
            key={b.id}
            className="card"
            data-testid={`bookmark-${b.id}`}
            data-bookmark-country={b.country}
          >
            <strong data-testid={`bookmark-title-${b.id}`}>{b.title}</strong>
            <div style={{ fontSize: 12, color: '#666' }}>{b.url}</div>
            <div style={{ fontSize: 11, color: '#888' }}>
              from{' '}
              <span data-testid={`bookmark-country-${b.id}`}>{b.country}</span>
            </div>
          </li>
        ))}
      </ul>
      {items.length > 0 && !done && (
        <div
          ref={sentinelRef}
          className="sentinel"
          data-testid="feed-sentinel"
        />
      )}
      {loading && (
        <div className="feed-loader" data-testid="feed-loading">
          Loading…
        </div>
      )}
      {done && (
        <div className="feed-loader" data-testid="feed-end">
          End of feed.
        </div>
      )}
    </div>
  );
}
