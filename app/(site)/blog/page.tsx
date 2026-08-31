'use client';

import Link from 'next/link';
import PageHero from '@/components/site/PageHero';
import BlogAmbience from '@/components/site/BlogAmbience';
import { POSTS, type Post } from '@/components/site/posts';
import { COVERS } from '@/components/site/covers';
import { Reveal } from '@/components/site/primitives';

function Card({ post, big = false }: { post: Post; big?: boolean }) {
  return (
    <Link href={`/blog/${post.slug}`} className={`me-post-card${big ? ' me-post-card-big' : ''}`}>
      <div
        className="me-post-cover"
        aria-hidden="true"
        dangerouslySetInnerHTML={{ __html: COVERS[post.cover] ?? '' }}
      />
      <div className="me-post-card-body">
        <span className="me-label me-post-kicker">{post.kicker}</span>
        <h2 className="me-post-card-h">{post.title}</h2>
        <p className="me-post-card-x">{post.excerpt}</p>
        <span className="me-label me-post-card-meta">
          {post.dateLabel} · {post.mins} min read
        </span>
      </div>
    </Link>
  );
}

export default function BlogIndex() {
  const byDate = [...POSTS].sort((a, b) => (a.date < b.date ? 1 : -1));
  const [lead, ...others] = byDate;
  const featured = others.filter((p) => p.featured);
  const rest = others.filter((p) => !p.featured);

  return (
    <div className="me-read">
      <BlogAmbience />

      <div className="me-read-body">
        <PageHero
          eyebrow="Blog"
          title="What we learned, and what it cost us."
          lede="Working notes from building a flood decision engine where the data is thin. Every figure carries the same label it carries everywhere else on this site."
        />

        <section className="me-band" style={{ paddingBottom: 0 }}>
          <div className="me-wrap">
            <Reveal>
              <Card post={lead} big />
            </Reveal>

            {featured.length > 0 && (
              <div className="me-post-grid" style={{ marginTop: 'clamp(1.5rem, 3vw, 2.5rem)' }}>
                {featured.map((p, i) => (
                  <Reveal key={p.slug} delay={i * 80}>
                    <Card post={p} />
                  </Reveal>
                ))}
              </div>
            )}
          </div>
        </section>

        <section className="me-band">
          <div className="me-wrap">
            <Reveal>
              <p className="me-label" style={{ marginBottom: '1.5rem' }}>
                More
              </p>
            </Reveal>
            <div className="me-post-grid">
              {rest.map((p, i) => (
                <Reveal key={p.slug} delay={i * 80}>
                  <Card post={p} />
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
