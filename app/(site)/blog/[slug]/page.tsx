import Link from 'next/link';
import { notFound } from 'next/navigation';
import BlogAmbience from '@/components/site/BlogAmbience';
import { POSTS, getPost } from '@/components/site/posts';

/* A server component so every post prerenders. The layout above it is a client
   component, which is fine: this arrives as its children. */

export function generateStaticParams() {
  return POSTS.map((p) => ({ slug: p.slug }));
}

/* params is a promise in this Next version, so both of these await it. */
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return {};
  return { title: `${post.title} · ModelEarth`, description: post.excerpt };
}

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();

  const idx = POSTS.findIndex((p) => p.slug === post.slug);
  const next = POSTS[idx + 1];

  return (
    <div className="me-read">
      <BlogAmbience />

      <article className="me-read-body me-sheet-wrap">
        {/* the text rides on a sheet, so the ambience stays around the page
            rather than under the words */}
        <div className="me-sheet">
        <header className="me-post-head">
          <div className="me-measure">
            <Link href="/blog" className="me-label me-post-back">
              ← All posts
            </Link>
            <p className="me-eyebrow" style={{ marginTop: '1.75rem' }}>
              {post.kicker}
            </p>
            <h1 className="me-display me-post-title">{post.title}</h1>
            <p className="me-label me-post-meta">
              {post.dateLabel} · {post.mins} min read · Swayam Debata
            </p>
          </div>
        </header>

        <div className="me-measure me-prose">
          {post.body.map((b, i) => {
            if (b.t === 'h') return <h2 key={i}>{b.x}</h2>;
            if (b.t === 'quote') return <blockquote key={i}>{b.x}</blockquote>;
            if (b.t === 'note')
              return (
                <p key={i} className="me-prose-note">
                  {b.x}
                </p>
              );
            if (b.t === 'list')
              return (
                <ul key={i}>
                  {b.x.map((li) => (
                    <li key={li}>{li}</li>
                  ))}
                </ul>
              );
            return <p key={i}>{b.x}</p>;
          })}
        </div>

        <footer className="me-measure me-post-foot">
          {next && (
            <Link href={`/blog/${next.slug}`} className="me-post-next">
              <span className="me-label">Next</span>
              <span className="me-post-next-h">{next.title}</span>
            </Link>
          )}
          <p className="me-label me-post-adv">
            Advisory only. Does not override IMD, CWC or OSDMA warnings.
          </p>
        </footer>
        </div>
      </article>
    </div>
  );
}
