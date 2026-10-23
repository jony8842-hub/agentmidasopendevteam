'use client';

import { useMemo, useState, type FormEvent, type ReactNode } from 'react';

export type BlogPostStatus = 'draft' | 'published' | 'scheduled';

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  tags: string[];
  status: BlogPostStatus;
  publishedAt: string | null;
  scheduledFor: string | null;
  seoTitle: string;
  seoDescription: string;
  views: number;
  reads: number;
  shares: number;
}

export interface BlogPublishingSystemProps {
  initialPosts?: BlogPost[];
  onChange?: (posts: BlogPost[]) => void;
}

const seedPosts: BlogPost[] = [
  {
    id: 'post-agent-workflows',
    title: 'A calmer way to ship agent workflows',
    slug: 'calmer-agent-workflows',
    excerpt: 'Three practical habits that make small automation projects easier to operate.',
    content:
      '# A calmer way to ship agent workflows\n\nSmall automations become dependable when their inputs, outputs, and failure paths are visible. Start with a narrow contract, add an executable check, and document the handoff.\n\n## Make the next step obvious\n\nA good run should leave a useful artifact behind. That makes a workflow easier to review and safer to extend.',
    tags: ['automation', 'engineering'],
    status: 'published',
    publishedAt: '2026-10-19T14:00:00.000Z',
    scheduledFor: null,
    seoTitle: 'A calmer way to ship agent workflows',
    seoDescription: 'Practical habits for dependable, reviewable agent automations.',
    views: 1840,
    reads: 1126,
    shares: 74,
  },
  {
    id: 'post-source-backed-research',
    title: 'What source-backed research changes',
    slug: 'what-source-backed-research-changes',
    excerpt: 'A compact method for making market research easier to verify and reuse.',
    content:
      '## Start with an observation date\n\nA research note is more useful when every important claim has a source, an observation date, and a clear confidence level.\n\n> Evidence is part of the deliverable, not an appendix.\n\nUse a comparison table to keep the decision visible.',
    tags: ['research', 'strategy'],
    status: 'scheduled',
    publishedAt: null,
    scheduledFor: '2026-10-27T15:30:00.000Z',
    seoTitle: 'What source-backed research changes',
    seoDescription: 'A practical method for verifiable, reusable market research.',
    views: 0,
    reads: 0,
    shares: 0,
  },
];

function slugify(value: string) {
  return value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'untitled-post';
}

function readingMinutes(content: string) {
  const words = content.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 220));
}

function formatDate(value: string | null) {
  if (!value) return 'Not scheduled';
  return new Intl.DateTimeFormat('en', { dateStyle: 'medium', timeStyle: 'short' }).format(
    new Date(value),
  );
}

function statusLabel(status: BlogPostStatus) {
  return status === 'published' ? 'Published' : status === 'scheduled' ? 'Scheduled' : 'Draft';
}

function renderMarkdown(content: string): ReactNode {
  return content.split('\n').map((line, index) => {
    const key = `${index}-${line}`;
    if (line.startsWith('# ')) {
      return (
        <h2 key={key} className="mt-5 text-2xl font-semibold text-[#F5F5F5] first:mt-0">
          {line.slice(2)}
        </h2>
      );
    }
    if (line.startsWith('## ')) {
      return (
        <h3 key={key} className="mt-5 text-xl font-semibold text-[#F5F5F5] first:mt-0">
          {line.slice(3)}
        </h3>
      );
    }
    if (line.startsWith('> ')) {
      return (
        <blockquote key={key} className="my-3 border-l-2 border-[#D4AF37] pl-4 text-[#E8C547]">
          {line.slice(2)}
        </blockquote>
      );
    }
    if (!line.trim()) return <div key={key} className="h-2" aria-hidden="true" />;
    return (
      <p key={key} className="mt-3 leading-7 text-[#C4C4C4]">
        {line}
      </p>
    );
  });
}

function emptyDraft(): Omit<BlogPost, 'id' | 'views' | 'reads' | 'shares'> {
  return {
    title: '',
    slug: '',
    excerpt: '',
    content: '# New post\n\nStart writing in Markdown…',
    tags: [],
    status: 'draft',
    publishedAt: null,
    scheduledFor: null,
    seoTitle: '',
    seoDescription: '',
  };
}

export function BlogPublishingSystem({
  initialPosts = seedPosts,
  onChange,
}: BlogPublishingSystemProps) {
  const [posts, setPosts] = useState<BlogPost[]>(initialPosts);
  const [activeTab, setActiveTab] = useState<'editor' | 'posts' | 'analytics'>('editor');
  const [activeId, setActiveId] = useState<string | null>(initialPosts[0]?.id ?? null);
  const [query, setQuery] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [savedNotice, setSavedNotice] = useState('');
  const [draft, setDraft] = useState<Omit<BlogPost, 'id' | 'views' | 'reads' | 'shares'>>(
    initialPosts[0] ? { ...initialPosts[0], tags: [...initialPosts[0].tags] } : emptyDraft(),
  );

  const activePost = activeId ? posts.find((post) => post.id === activeId) ?? null : null;
  const filteredPosts = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return posts;
    return posts.filter((post) => `${post.title} ${post.excerpt} ${post.tags.join(' ')}`.toLowerCase().includes(needle));
  }, [posts, query]);
  const totals = useMemo(
    () =>
      posts.reduce(
        (sum, post) => ({ views: sum.views + post.views, reads: sum.reads + post.reads, shares: sum.shares + post.shares }),
        { views: 0, reads: 0, shares: 0 },
      ),
    [posts],
  );

  const updatePosts = (nextPosts: BlogPost[]) => {
    setPosts(nextPosts);
    onChange?.(nextPosts);
  };

  const selectPost = (post: BlogPost) => {
    setActiveId(post.id);
    setDraft({ ...post, tags: [...post.tags] });
    setSavedNotice('');
    setActiveTab('editor');
  };

  const startNewPost = () => {
    setActiveId(null);
    setDraft(emptyDraft());
    setSavedNotice('');
    setActiveTab('editor');
  };

  const saveDraft = (
    event?: FormEvent,
    override?: Omit<BlogPost, 'id' | 'views' | 'reads' | 'shares'>,
  ) => {
    event?.preventDefault();
    const source = override ?? draft;
    const title = source.title.trim() || 'Untitled post';
    const post: BlogPost = {
      ...source,
      id: activeId ?? `post-${Date.now()}`,
      title,
      slug: source.slug.trim() || slugify(title),
      seoTitle: source.seoTitle.trim() || title,
      seoDescription: source.seoDescription.trim() || source.excerpt.trim(),
      views: activePost?.views ?? 0,
      reads: activePost?.reads ?? 0,
      shares: activePost?.shares ?? 0,
    };
    const next = activeId ? posts.map((item) => (item.id === activeId ? post : item)) : [post, ...posts];
    setActiveId(post.id);
    setDraft({ ...post, tags: [...post.tags] });
    updatePosts(next);
    setSavedNotice('Draft saved');
  };

  const publishNow = () => {
    const publishedAt = new Date().toISOString();
    const nextDraft = { ...draft, status: 'published' as const, publishedAt, scheduledFor: null };
    setDraft(nextDraft);
    window.setTimeout(() => saveDraft(undefined, nextDraft), 0);
    setSavedNotice('Published');
  };

  const schedulePost = () => {
    if (!draft.scheduledFor) {
      setSavedNotice('Choose a date and time first');
      return;
    }
    const nextDraft = { ...draft, status: 'scheduled' as const, publishedAt: null };
    setDraft(nextDraft);
    window.setTimeout(() => saveDraft(undefined, nextDraft), 0);
    setSavedNotice('Post scheduled');
  };

  const addTag = () => {
    const tag = tagInput.trim().toLowerCase().replace(/\s+/g, '-');
    if (!tag || draft.tags.includes(tag)) return;
    setDraft((current) => ({ ...current, tags: [...current.tags, tag] }));
    setTagInput('');
  };

  return (
    <section className="min-h-screen bg-[#0A0A0A] px-4 py-8 text-[#F5F5F5] sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#D4AF37]">Publisher</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">Blog publishing system</h1>
            <p className="mt-2 max-w-2xl text-[#9CA3AF]">Write in Markdown, prepare search metadata, schedule a release, and see the signals that matter.</p>
          </div>
          <button type="button" onClick={startNewPost} className="rounded-xl bg-[#D4AF37] px-4 py-3 text-sm font-semibold text-[#0A0A0A] hover:bg-[#E8C547] focus:outline-none focus:ring-2 focus:ring-[#D4AF37]">New post</button>
        </header>

        <nav aria-label="Publisher sections" className="mb-6 flex flex-wrap gap-2 border-b border-[#2A2A2A] pb-3">
          {(['editor', 'posts', 'analytics'] as const).map((tab) => (
            <button key={tab} type="button" onClick={() => setActiveTab(tab)} aria-current={activeTab === tab ? 'page' : undefined} className={`rounded-lg px-4 py-2 text-sm font-medium capitalize focus:outline-none focus:ring-2 focus:ring-[#D4AF37] ${activeTab === tab ? 'bg-[#D4AF37] text-[#0A0A0A]' : 'text-[#9CA3AF] hover:bg-[#141414] hover:text-[#F5F5F5]'}`}>{tab}</button>
          ))}
        </nav>

        {activeTab === 'editor' && (
          <form onSubmit={saveDraft} className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(300px,0.72fr)]">
            <div className="space-y-5">
              <div className="rounded-2xl border border-[#2A2A2A] bg-[#0D0D0D] p-5">
                <label htmlFor="blog-title" className="text-sm font-medium">Title</label>
                <input id="blog-title" value={draft.title} onChange={(event) => setDraft({ ...draft, title: event.target.value })} placeholder="A useful, specific headline" className="mt-2 w-full rounded-xl border border-[#2A2A2A] bg-[#0A0A0A] px-4 py-3 text-xl font-semibold outline-none placeholder:text-[#6B7280] focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/30" />
                <label htmlFor="blog-slug" className="mt-4 block text-sm font-medium">Slug</label>
                <input id="blog-slug" value={draft.slug} onChange={(event) => setDraft({ ...draft, slug: event.target.value })} placeholder="headline-as-a-url" className="mt-2 w-full rounded-xl border border-[#2A2A2A] bg-[#0A0A0A] px-4 py-2.5 text-sm outline-none placeholder:text-[#6B7280] focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/30" />
                <label htmlFor="blog-excerpt" className="mt-4 block text-sm font-medium">Excerpt</label>
                <textarea id="blog-excerpt" value={draft.excerpt} onChange={(event) => setDraft({ ...draft, excerpt: event.target.value })} rows={2} placeholder="A short summary for cards and search results" className="mt-2 w-full resize-y rounded-xl border border-[#2A2A2A] bg-[#0A0A0A] px-4 py-3 text-sm leading-6 outline-none placeholder:text-[#6B7280] focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/30" />
              </div>
              <div className="rounded-2xl border border-[#2A2A2A] bg-[#0D0D0D] p-5">
                <div className="flex items-center justify-between gap-3"><label htmlFor="blog-content" className="text-sm font-medium">Markdown / MDX body</label><span className="text-xs text-[#9CA3AF]">{readingMinutes(draft.content)} min read</span></div>
                <textarea id="blog-content" value={draft.content} onChange={(event) => setDraft({ ...draft, content: event.target.value })} rows={18} spellCheck className="mt-2 w-full resize-y rounded-xl border border-[#2A2A2A] bg-[#0A0A0A] px-4 py-3 font-mono text-sm leading-6 outline-none focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/30" />
              </div>
            </div>

            <aside className="space-y-5">
              <div className="rounded-2xl border border-[#2A2A2A] bg-[#0D0D0D] p-5">
                <h2 className="text-sm font-semibold uppercase tracking-wide text-[#D4AF37]">Release</h2>
                <div className="mt-4 grid gap-2"><button type="button" onClick={publishNow} className="rounded-xl bg-[#D4AF37] px-4 py-2.5 text-sm font-semibold text-[#0A0A0A] hover:bg-[#E8C547] focus:outline-none focus:ring-2 focus:ring-[#D4AF37]">Publish now</button><button type="button" onClick={schedulePost} className="rounded-xl border border-[#D4AF37] px-4 py-2.5 text-sm font-semibold text-[#E8C547] hover:bg-[#141414] focus:outline-none focus:ring-2 focus:ring-[#D4AF37]">Schedule post</button><button type="submit" className="rounded-xl border border-[#2A2A2A] px-4 py-2.5 text-sm font-semibold text-[#F5F5F5] hover:bg-[#141414] focus:outline-none focus:ring-2 focus:ring-[#D4AF37]">Save draft</button></div>
                <label htmlFor="blog-schedule" className="mt-4 block text-sm font-medium">Scheduled date and time</label>
                <input id="blog-schedule" type="datetime-local" value={draft.scheduledFor ? draft.scheduledFor.slice(0, 16) : ''} onChange={(event) => setDraft({ ...draft, scheduledFor: event.target.value ? new Date(event.target.value).toISOString() : null })} className="mt-2 w-full rounded-xl border border-[#2A2A2A] bg-[#0A0A0A] px-3 py-2.5 text-sm outline-none focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/30" />
                {savedNotice && <p role="status" className="mt-3 text-sm text-[#E8C547]">{savedNotice}</p>}
              </div>
              <div className="rounded-2xl border border-[#2A2A2A] bg-[#0D0D0D] p-5">
                <h2 className="text-sm font-semibold uppercase tracking-wide text-[#D4AF37]">SEO</h2>
                <label htmlFor="seo-title" className="mt-4 block text-sm font-medium">Search title <span className="text-[#9CA3AF]">({draft.seoTitle.length}/60)</span></label>
                <input id="seo-title" maxLength={60} value={draft.seoTitle} onChange={(event) => setDraft({ ...draft, seoTitle: event.target.value })} placeholder={draft.title || 'Search result title'} className="mt-2 w-full rounded-xl border border-[#2A2A2A] bg-[#0A0A0A] px-3 py-2.5 text-sm outline-none focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/30" />
                <label htmlFor="seo-description" className="mt-4 block text-sm font-medium">Meta description <span className="text-[#9CA3AF]">({draft.seoDescription.length}/160)</span></label>
                <textarea id="seo-description" maxLength={160} value={draft.seoDescription} onChange={(event) => setDraft({ ...draft, seoDescription: event.target.value })} rows={3} placeholder="A concise description for search engines" className="mt-2 w-full resize-y rounded-xl border border-[#2A2A2A] bg-[#0A0A0A] px-3 py-2.5 text-sm leading-6 outline-none focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/30" />
              </div>
              <div className="rounded-2xl border border-[#2A2A2A] bg-[#0D0D0D] p-5"><h2 className="text-sm font-semibold uppercase tracking-wide text-[#D4AF37]">Tags</h2><div className="mt-3 flex flex-wrap gap-2">{draft.tags.map((tag) => <button key={tag} type="button" onClick={() => setDraft({ ...draft, tags: draft.tags.filter((item) => item !== tag) })} className="rounded-full border border-[#D4AF37] px-3 py-1 text-xs text-[#E8C547] hover:bg-[#141414]" aria-label={`Remove ${tag}`}>{tag} ×</button>)}</div><div className="mt-3 flex gap-2"><input value={tagInput} onChange={(event) => setTagInput(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') { event.preventDefault(); addTag(); } }} placeholder="Add a tag" className="min-w-0 flex-1 rounded-xl border border-[#2A2A2A] bg-[#0A0A0A] px-3 py-2 text-sm outline-none focus:border-[#D4AF37]" /><button type="button" onClick={addTag} className="rounded-xl border border-[#2A2A2A] px-3 py-2 text-sm hover:bg-[#141414]">Add</button></div></div>
            </aside>

            <div className="rounded-2xl border border-[#2A2A2A] bg-[#0D0D0D] p-5 lg:col-start-2"><h2 className="text-sm font-semibold uppercase tracking-wide text-[#D4AF37]">Preview</h2><article className="mt-4">{renderMarkdown(draft.content)}</article></div>
          </form>
        )}

        {activeTab === 'posts' && (
          <div className="rounded-2xl border border-[#2A2A2A] bg-[#0D0D0D] p-5"><div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center"><div><h2 className="text-xl font-semibold">All posts</h2><p className="mt-1 text-sm text-[#9CA3AF]">Draft, schedule, and revisit published work from one place.</p></div><input aria-label="Search posts" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search posts" className="rounded-xl border border-[#2A2A2A] bg-[#0A0A0A] px-3 py-2 text-sm outline-none focus:border-[#D4AF37]" /></div><div className="mt-5 overflow-x-auto"><table className="w-full min-w-[620px] text-left text-sm"><thead className="border-b border-[#2A2A2A] text-xs uppercase tracking-wide text-[#9CA3AF]"><tr><th className="px-3 py-3">Post</th><th className="px-3 py-3">Status</th><th className="px-3 py-3">Date</th><th className="px-3 py-3 text-right">Views</th></tr></thead><tbody>{filteredPosts.map((post) => <tr key={post.id} className="border-b border-[#2A2A2A] last:border-0"><td className="px-3 py-4"><button type="button" onClick={() => selectPost(post)} className="font-medium text-[#F5F5F5] underline-offset-4 hover:text-[#E8C547] hover:underline">{post.title}</button><p className="mt-1 text-xs text-[#9CA3AF]">/{post.slug}</p></td><td className="px-3 py-4"><span className={`rounded-full px-2.5 py-1 text-xs ${post.status === 'published' ? 'bg-emerald-950 text-emerald-300' : post.status === 'scheduled' ? 'bg-blue-950 text-blue-300' : 'bg-[#141414] text-[#C4C4C4]'}`}>{statusLabel(post.status)}</span></td><td className="px-3 py-4 text-[#9CA3AF]">{formatDate(post.publishedAt ?? post.scheduledFor)}</td><td className="px-3 py-4 text-right text-[#C4C4C4]">{post.views.toLocaleString()}</td></tr>)}</tbody></table>{filteredPosts.length === 0 && <p className="py-10 text-center text-sm text-[#9CA3AF]">No posts match that search.</p>}</div></div>
        )}

        {activeTab === 'analytics' && (
          <div className="space-y-5"><div className="grid gap-4 sm:grid-cols-3">{[['Views', totals.views], ['Reads', totals.reads], ['Shares', totals.shares]].map(([label, value]) => <div key={label} className="rounded-2xl border border-[#2A2A2A] bg-[#0D0D0D] p-5"><p className="text-sm text-[#9CA3AF]">{label}</p><p className="mt-2 text-3xl font-semibold text-[#E8C547]">{Number(value).toLocaleString()}</p></div>)}</div><div className="rounded-2xl border border-[#2A2A2A] bg-[#0D0D0D] p-5"><h2 className="text-xl font-semibold">Post performance</h2><p className="mt-1 text-sm text-[#9CA3AF]">A compact view of the content that is earning attention.</p><div className="mt-5 space-y-4">{posts.filter((post) => post.status === 'published').sort((a, b) => b.views - a.views).map((post) => <div key={post.id}><div className="flex justify-between gap-3 text-sm"><span className="font-medium">{post.title}</span><span className="text-[#9CA3AF]">{post.views.toLocaleString()} views</span></div><div className="mt-2 h-2 overflow-hidden rounded-full bg-[#141414]"><div className="h-full rounded-full bg-[#D4AF37]" style={{ width: `${Math.min(100, Math.max(4, (post.views / Math.max(1, totals.views)) * 100))}%` }} /></div><p className="mt-1 text-xs text-[#9CA3AF]">{post.reads.toLocaleString()} reads · {post.shares.toLocaleString()} shares</p></div>)}</div></div></div>
        )}
      </div>
    </section>
  );
}

export default BlogPublishingSystem;
