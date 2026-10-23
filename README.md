# Bounty #7 — Blog Publishing System

This folder contains a self-contained, dependency-free React component for the Agent Midas Blog Publishing System bounty.

It provides:

- Markdown/MDX-style editing with an in-place safe preview
- Draft, publish-now, and scheduled-release states
- Slug, excerpt, tags, SEO title, and meta description controls
- A searchable post list with status and release dates
- Lightweight analytics for views, reads, and shares
- Accessible labels, status announcements, keyboard-focus states, and a mobile-first dark/gold layout
- No new npm dependencies

## Integration

Place `BlogPublishingSystem.tsx` in the existing Next.js frontend and render it from the publishing route:

```tsx
import BlogPublishingSystem from './BlogPublishingSystem';

export default function BlogPage() {
  return <BlogPublishingSystem />;
}
```

The `initialPosts` prop supplies persisted posts and `onChange` lets the host application save changes to its existing API or database. The component intentionally keeps persistence at the integration boundary because the public bounty repository contains the contribution program documentation, not the production application source tree.

## Validation checklist

1. Render the component at the host app's blog route.
2. Create a post, add tags, edit Markdown, and save it as a draft.
3. Publish a post and confirm it appears in the post table and analytics tab.
4. Pick a future date, schedule the post, and verify the scheduled status and release date.
5. Test keyboard navigation and a 375px viewport.
