import { NextResponse, type NextRequest } from 'next/server';
import { createBookmark, listBookmarks } from '@/lib/db';
import { getSession } from '@/lib/session';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const cursor = req.nextUrl.searchParams.get('cursor');
  const country = req.nextUrl.searchParams.get('country') ?? undefined;
  const limit = Number(req.nextUrl.searchParams.get('limit') ?? '10');

  const result = await listBookmarks({
    cursor: cursor ? Number(cursor) : undefined,
    country,
    limit: Math.min(Math.max(limit, 1), 50),
  });
  return NextResponse.json(result);
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const contentType = req.headers.get('content-type') ?? '';
  let title: string;
  let url: string;
  let country: string;
  if (contentType.includes('application/json')) {
    const body = (await req.json()) as Record<string, unknown>;
    title = String(body.title ?? '');
    url = String(body.url ?? '');
    country = String(body.country ?? '');
  } else {
    const form = await req.formData();
    title = String(form.get('title') ?? '');
    url = String(form.get('url') ?? '');
    country = String(form.get('country') ?? '');
  }

  if (!title || !url || !country) {
    return NextResponse.json(
      { error: 'title, url, and country are required' },
      { status: 400 },
    );
  }

  const bookmark = await createBookmark({
    userId: session.userId,
    title,
    url,
    country,
  });

  // Browser-form POSTs expect a redirect; JSON callers want the row back.
  if (contentType.includes('application/json')) {
    return NextResponse.json(bookmark, { status: 201 });
  }
  return NextResponse.redirect(new URL('/', req.url), 303);
}
