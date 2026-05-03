import { redirect } from 'next/navigation';
import CountryDropdown from '@/components/CountryDropdown';
import { getSession } from '@/lib/session';

export const dynamic = 'force-dynamic';

export default async function NewBookmarkPage() {
  const session = await getSession();
  if (!session) {
    redirect('/login');
  }

  return (
    <div data-testid="new-bookmark-page" className="card">
      <h1>New bookmark</h1>
      <form
        action="/api/bookmarks"
        method="post"
        data-testid="new-bookmark-form"
      >
        <div className="field">
          <label htmlFor="bm-title">Title</label>
          <input
            id="bm-title"
            type="text"
            name="title"
            data-testid="bookmark-title-input"
            required
          />
        </div>
        <div className="field">
          <label htmlFor="bm-url">URL</label>
          <input
            id="bm-url"
            type="url"
            name="url"
            data-testid="bookmark-url-input"
            required
          />
        </div>
        <div className="field">
          <label>Country</label>
          <CountryDropdown name="country" />
        </div>
        <button type="submit" className="primary" data-testid="bookmark-submit">
          Save bookmark
        </button>
      </form>
    </div>
  );
}
