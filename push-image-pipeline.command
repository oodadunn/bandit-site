#!/bin/bash
cd "$(dirname "$0")"

# Clean up stale lock file if present
rm -f .git/index.lock

echo "=== Refreshing git index ==="
git update-index --refresh
git diff --stat

echo ""
echo "=== Staging image pipeline files ==="
git add --force supabase/migrations/20260418_image_gen.sql
git add --force lib/imageGen.ts
git add --force app/api/admin/generate-post-image/route.ts
git add --force app/api/admin/bootstrap-references/route.ts
git add --force app/api/admin/blog-posts/route.ts
git add --force app/api/approve-post/route.ts
git add --force app/admin/blog/page.tsx
git add --force app/blog/page.tsx
git add --force "app/blog/[slug]/page.tsx"
git add --force public/reference/bandit-mascot-1k.png
git add --force public/reference/bandit-baler-1k.png

echo ""
echo "=== Staged changes ==="
git diff --cached --stat

echo ""
echo "=== Committing ==="
git commit -m "feat: Pixar-style image gen pipeline (Gemini 2.5 Flash Image)

Adds end-to-end image generation for blog posts:
- supabase/migrations/20260418_image_gen.sql: image_gen_log,
  image_gen_config (kill switch + budget caps), blog-images +
  reference storage buckets with public read RLS.
- lib/imageGen.ts: shared generator. Builds prompts from the visual
  style bible, attaches mascot+baler refs to every Gemini call,
  uploads result to Supabase Storage, updates blog_posts.image_url.
- /api/admin/generate-post-image: manual button + auto-publish entry.
  Cookie auth for browser, x-autogen-secret header for s2s.
- /api/admin/bootstrap-references: one-click upload of public/reference
  PNGs into Supabase Storage reference bucket.
- /api/admin/blog-posts: admin-gated post list for the new admin UI.
- /admin/blog: lean list view with Generate / Regenerate buttons +
  Bootstrap brand references action.
- approve-post: fires fire-and-forget auto image gen on publish if
  the post does not yet have an image.
- blog list + detail pages: removed dead source.unsplash.com fallback
  and the per-category Unsplash map. Both pages now read only
  post.image_url; thumbnail and hero use the same URL.
- public/reference: 1024px / ~1MB downscales of the brand reference
  art (mascot + baler) for fast Gemini API calls.

Requires env vars in Vercel: GEMINI_API_KEY (already set),
SUPABASE_SERVICE_ROLE_KEY (already set), AUTOGEN_SECRET (NEW —
random 32-char string for the auto-publish hook).

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"

if [ $? -ne 0 ]; then
  echo "ERROR: Commit failed."
  echo "Press any key to exit..."
  read -n 1
  exit 1
fi

echo ""
echo "=== Pulling and rebasing on top of origin ==="
git pull --rebase origin main
if [ $? -ne 0 ]; then
  echo "ERROR: Rebase failed. Run 'git rebase --abort' to undo."
  echo "Press any key to exit..."
  read -n 1
  exit 1
fi

echo ""
echo "=== Pushing ==="
git push origin main

echo ""
echo "=== Done ==="
echo ""
echo "Next steps:"
echo "  1. Wait ~60s for Vercel to deploy."
echo "  2. Go to Supabase SQL editor and run the migration:"
echo "       supabase/migrations/20260418_image_gen.sql"
echo "  3. Add AUTOGEN_SECRET to Vercel env vars (any random 32-char string)."
echo "  4. Visit https://banditrecycling.com/admin/blog"
echo "  5. Click 'Bootstrap brand references' (one time)."
echo "  6. Click 'Generate' on 3 posts (one Maintenance, one Equipment, one"
echo "     Industry Tips) and review."
echo ""
echo "Press any key to exit..."
read -n 1
