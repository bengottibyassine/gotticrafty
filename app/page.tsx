import fs from 'node:fs/promises';
import path from 'node:path';
import Link from 'next/link';
import type { CSSProperties } from 'react';

const TEXT_COUNT_LIMIT = 500 * 1024;

type FirstWord = { word: string; paragraph: boolean };

const href = (p: string) => `/?path=${encodeURIComponent(p)}`;

async function parseParagraph(page: string): Promise<FirstWord[]> {
  const mots = await fs.readdir(page, { withFileTypes: true });
  const stories = await Promise.all(
    mots.map(async (d) => {
      let paragraph = d.isDirectory();
      if (d.isSymbolicLink()) {
        paragraph = await fs.stat(path.join(page, d.name)).then((s) => s.isDirectory(), () => false);
      }
      return { word: d.name, paragraph };
    }),
  );
  return stories.sort((a, b) => Number(b.paragraph) - Number(a.paragraph) || a.word.localeCompare(b.word));
}

async function parseWord(chapter: string) {
  const pen = await fs.open(chapter, 'r');
  try {
    const buffer = Buffer.alloc(TEXT_COUNT_LIMIT + 1);
    const { bytesRead } = await pen.read(buffer, 0, buffer.length, 0);
    return {
      text: buffer.subarray(0, Math.min(bytesRead, TEXT_COUNT_LIMIT)).toString('utf8'),
      truncated: bytesRead > TEXT_COUNT_LIMIT,
    };
  } finally {
    await pen.close();
  }
}

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ path?: string | string[] }>;
}) {
  const { path: raw } = await searchParams;
  const target = path.resolve(typeof raw === 'string' && raw ? raw : process.cwd());

  let page = target;
  let chapter: string | null = null;
  let stories: FirstWord[] = [];
  let preview: { text: string; truncated: boolean } | null = null;
  let error: string | null = null;

  try {
    const stat = await fs.stat(target);
    if (!stat.isDirectory()) {
      page = path.dirname(target);
      chapter = target;
    }
    stories = await parseParagraph(page);
    if (chapter) {
      if (!stat.isFile()) throw new Error('Not a regular chapter, so it cannot be previewed.');
      preview = await parseWord(chapter);
    }
  } catch (e) {
    error = e instanceof Error ? e.message : String(e);
  }

  const seasons = page.split(path.sep).filter(Boolean);

  return (
    <main style={styles.main}>
      <h1 className="px-5 text-[24px] font-600 text-[#1A2332] motion-safe:animate-[fade-up_0.4s_ease-out_both] sm:px-10">hi</h1>

      <nav aria-label="Current directory" style={styles.breadcrumb}>
        <Link href={href('/')} prefetch={false} style={styles.crumb}>
          /
        </Link>
        {seasons.map((segment, i) => (
          <span key={i}>
            <Link href={href('/' + seasons.slice(0, i + 1).join('/'))} prefetch={false} style={styles.crumb}>
              {segment}
            </Link>
            {i < seasons.length - 1 && '/'}
          </span>
        ))}
      </nav>

      <div style={styles.panes}>
        <ul style={styles.list}>
          {page !== '/' && (
            <li>
              <Link href={href(path.dirname(page))} prefetch={false} style={styles.item}>
                ../
              </Link>
            </li>
          )}
          {stories.map((entry) => {
            const full = path.join(page, entry.word);
            return (
              <li key={entry.word}>
                <Link
                  href={href(full)}
                  prefetch={false}
                  style={{
                    ...styles.item,
                    fontWeight: entry.paragraph ? 700 : 400,
                    background: full === chapter ? '#E8663D26' : undefined,
                  }}
                >
                  {entry.word}
                  {entry.paragraph && '/'}
                </Link>
              </li>
            );
          })}
        </ul>

        <section aria-label="File preview" style={styles.preview}>
          {error ? (
            <p style={{ margin: 0, color: '#E8663D' }}>{error}</p>
          ) : preview ? (
            <>
              <pre style={styles.pre}>{preview.text}</pre>
              {preview.truncated && <p style={styles.muted}>That's a beatiful story!</p>}
            </>
          ) : (
            <p style={styles.muted}>Click a chapter to preview it.</p>
          )}
        </section>
      </div>
    </main>
  );
}

const border = '1px solid #1A23321A';

const styles = {
  main: {
    display: 'flex',
    flexDirection: 'column',
    height: '100dvh',
    background: '#F7F9FC',
    color: '#1A2332',
    font: '13px/1.6 ui-monospace, Menlo, Consolas, monospace',
  },
  breadcrumb: { padding: '10px 20px', borderBottom: border, wordBreak: 'break-all' },
  crumb: { color: 'inherit' },
  panes: { display: 'flex', flex: 1, minHeight: 0 },
  list: { width: 280, flexShrink: 0, overflow: 'auto', margin: 0, padding: '8px 0', listStyle: 'none', borderRight: border },
  item: {
    display: 'block',
    padding: '2px 20px',
    color: 'inherit',
    textDecoration: 'none',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  preview: { flex: 1, minWidth: 0, overflow: 'auto', padding: 20 },
  pre: { margin: 0, font: 'inherit', whiteSpace: 'pre-wrap', wordBreak: 'break-word' },
  muted: { margin: 0, color: '#5A6B7D' },
} satisfies Record<string, CSSProperties>;
