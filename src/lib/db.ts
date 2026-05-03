import { Pool } from 'pg';

declare global {
  var __pgPool: Pool | undefined;
}

const pool =
  global.__pgPool ??
  new Pool({
    connectionString:
      process.env.DATABASE_URL ??
      'postgresql://dokkimi:dokkimi@postgres-db:5432/dokkimi',
    max: 5,
  });

if (process.env.NODE_ENV !== 'production') {
  global.__pgPool = pool;
}

export interface DbUser {
  id: number;
  email: string;
  name: string;
  oauth_sub: string;
}

export interface DbBookmark {
  id: number;
  user_id: number;
  title: string;
  url: string;
  country: string;
  created_at: string;
}

export async function upsertUser(
  oauthSub: string,
  email: string,
  name: string,
): Promise<DbUser> {
  const { rows } = await pool.query<DbUser>(
    `INSERT INTO users (oauth_sub, email, name)
     VALUES ($1, $2, $3)
     ON CONFLICT (oauth_sub) DO UPDATE SET email = EXCLUDED.email, name = EXCLUDED.name
     RETURNING id, email, name, oauth_sub`,
    [oauthSub, email, name],
  );
  return rows[0];
}

export async function listBookmarks(opts: {
  cursor?: number;
  country?: string;
  limit: number;
}): Promise<{ items: DbBookmark[]; nextCursor: number | null }> {
  const params: unknown[] = [];
  const where: string[] = [];
  if (opts.cursor !== undefined) {
    params.push(opts.cursor);
    where.push(`id < $${params.length}`);
  }
  if (opts.country) {
    params.push(opts.country);
    where.push(`country = $${params.length}`);
  }
  params.push(opts.limit + 1);
  const limitParam = params.length;
  const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
  const sql = `SELECT id, user_id, title, url, country, created_at
               FROM bookmarks ${whereSql}
               ORDER BY id DESC
               LIMIT $${limitParam}`;
  const { rows } = await pool.query<DbBookmark>(sql, params);
  const hasMore = rows.length > opts.limit;
  const items = hasMore ? rows.slice(0, opts.limit) : rows;
  return {
    items,
    nextCursor: hasMore ? items[items.length - 1].id : null,
  };
}

export async function createBookmark(input: {
  userId: number;
  title: string;
  url: string;
  country: string;
}): Promise<DbBookmark> {
  const { rows } = await pool.query<DbBookmark>(
    `INSERT INTO bookmarks (user_id, title, url, country)
     VALUES ($1, $2, $3, $4)
     RETURNING id, user_id, title, url, country, created_at`,
    [input.userId, input.title, input.url, input.country],
  );
  return rows[0];
}
