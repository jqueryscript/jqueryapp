# jquery.app SEO and UX Implementation Brief

Date: 2026-06-03  
Audience: AI agent or developer implementing the audit recommendations

## Working Rule

Do not redesign the whole site first. Fix crawl, trust, language, metadata, and accessibility issues in priority order. Preserve the current static architecture unless a change is required to fix a documented issue.

## Phase 1: Critical Trust and Crawl Fixes

### 1. Add social preview images

Files to inspect:

- `scripts/build.mjs`
- `src/assets/`
- `dist/index.html`

Tasks:

1. Create `src/assets/social/`.
2. Add 1200x630 images for every referenced `og:image`.
3. Update `copyAssets()` so `src/assets/social` is copied to `dist/assets/social`.
4. Add a build validation step that parses generated HTML and fails if any `og:image` file is missing.

Required image files:

- `og-home.png`
- `og-tools.png`
- `og-seo.png`
- `og-html.png`
- `og-css.png`
- `og-assets.png`
- `og-github-pages.png`
- `og-github-pages-workflow.png`
- `og-blog-publisher.png`
- `og-beginner-css.png`
- `og-multilingual-site.png`

Acceptance criteria:

- `dist/assets/social` exists after build.
- Every generated `og:image` URL maps to an existing file.
- Homepage, tools index, categories, collections, and tool pages all keep valid `og:image` tags.

### 2. Decide multilingual indexing strategy

Files to inspect:

- `data/site.json`
- `data/locales.json`
- `scripts/build.mjs`

Recommended first implementation:

Temporarily remove non-English pages from indexable output until the body content is fully localized.

Options:

- Remove non-English locales from `site.locales`.
- Or generate non-English pages with `<meta name="robots" content="noindex">` and exclude them from sitemap.
- Or build only locales that pass a completeness check.

Add a completeness check:

- Each localized tool must have localized `whatIs`, `quickAnswer`, `howToUse`, `useCases`, `examples`, `mistakes`, `faq`, `limitations`, and `verificationSteps`.
- If a localized tool lacks those fields, it must not be indexable.

Acceptance criteria:

- Sitemap contains only fully ready indexable URLs.
- No indexed page declares one language while most body content is another language.
- Hreflang tags are generated only for valid language alternates.

### 3. Fix noindex page language links

Files to inspect:

- `scripts/build.mjs`

Tasks:

1. When `skipAlternates` is true, remove the offcanvas language block too.
2. Confirm `/en/*` redirect pages no longer link to `/de/en/*`, `/fr/en/*`, etc.
3. Confirm `404.html` no longer links to `/de/404/`, `/fr/404/`, etc. unless those pages exist.

Acceptance criteria:

- No non-social broken internal links appear in noindex redirect or 404 pages.

## Phase 2: Metadata and Structured Data

### 4. Add metadata quality checks

Add a script or extend `scripts/audit-content.mjs`.

Check:

- Missing title
- Missing description
- Missing canonical
- Title longer than about 65 characters
- Description shorter than about 80 characters
- Description longer than about 165 characters
- Duplicate titles in the same locale
- Duplicate descriptions in the same locale
- Missing `og:image` file
- More than one H1 on indexable pages
- Missing JSON-LD on indexable pages

Acceptance criteria:

- `npm run build` or a new audit command reports metadata failures clearly.
- The build should fail for missing files or missing required metadata.

### 5. Add per-page SEO fields

Files to inspect:

- `data/tools.en.json`
- `data/categories.en.json`
- `data/collections.en.json`
- `scripts/build.mjs`

Add optional fields:

- `seoTitle`
- `seoDescription`
- `datePublished`
- `dateModified`
- `lastReviewed`
- `sourceLinks`

Use them in generated pages.

Acceptance criteria:

- High-value tools can override generic title/description templates.
- Long descriptions no longer come from blindly appending the same suffix.

### 6. Improve structured data

Files to inspect:

- `scripts/build.mjs`

Tasks:

1. Add `inLanguage` to `WebApplication`, `FAQPage`, `BreadcrumbList`, `ItemList`, and `WebPage` where appropriate.
2. Add `isAccessibleForFree: true` to tool schema.
3. Add `dateModified` after date data exists.
4. Add Organization `logo`, `sameAs`, and `contactPoint` only if accurate.
5. Keep structured data aligned with visible content.

Acceptance criteria:

- JSON-LD validates syntactically after build.
- FAQ schema is not generated for pages where FAQ content is not language-matched.

## Phase 3: AI Search and Entity Signals

### 7. Clean and strengthen `llms.txt`

Files to inspect:

- `scripts/build.mjs`
- `dist/llms.txt`

Tasks:

1. Remove duplicate `## Tool Categories`.
2. Add:
   - `## Site Identity`
   - `## Best Pages for AI Answers`
   - `## Canonical Language`
   - `## Maintenance Notes`
3. Add last-updated date.
4. Include the strongest 10-20 pages before the full catalog.

Acceptance criteria:

- `llms.txt` has no duplicate section headings.
- The first 80 lines clearly describe what the site is and which pages AI systems should prefer.

### 8. Clarify the `jquery.app` entity

Files to inspect:

- `data/site.json`
- `scripts/build.mjs`
- `README.md`
- generated About page

Tasks:

1. Add clearer independent identity text.
2. Add non-affiliation wording if the site is not officially affiliated with jQuery.
3. Add accurate `sameAs` links where available.
4. Add stronger Organization schema fields.

Acceptance criteria:

- Homepage, About page, README, Organization schema, and `llms.txt` consistently describe the same entity.
- A user does not need to guess whether this is an official jQuery property.

### 9. Add trust and freshness signals

Files to inspect:

- `data/tools.en.json`
- `scripts/build.mjs`

Tasks:

1. Add visible “Last reviewed” or “Updated” text to tool pages.
2. Add a short editorial/review note.
3. Add source links for web platform and SEO tools.
4. Add an editorial policy page.

Acceptance criteria:

- Every high-value tool page shows a visible freshness signal.
- Technical claims can point to official documentation or standards where appropriate.

## Phase 4: UX and Accessibility

### 10. Fix focus states

Files to inspect:

- `src/assets/styles.css`

Add a consistent `:focus-visible` rule for:

- `a`
- `button`
- `.button`
- `.card-link`
- `.copy-button`
- `.hamburger`
- `.language-menu summary`
- `.chip`
- form controls

Acceptance criteria:

- Keyboard users can see focus location across navigation, cards, filters, forms, copy buttons, and mobile menu.

### 11. Improve offcanvas menu semantics

Files to inspect:

- `scripts/build.mjs`
- `src/assets/styles.css`

Tasks:

1. Add an internal close button.
2. Use `height: 100dvh` with a fallback.
3. Either implement focus trap or remove `role="dialog"`.
4. Return focus to the hamburger after close.

Acceptance criteria:

- Mobile menu works predictably by keyboard.
- Escape closes the menu.
- Focus does not disappear behind the panel.

### 12. Improve filters

Files to inspect:

- `src/assets/tool-directory-filter.js`
- `src/assets/category-filter.js`
- `data/tools.en.json`

Tasks:

1. Add labels to search inputs.
2. Add no-results UI with a clear button.
3. Add `type="button"` to generated chip buttons.
4. Add tags for all tools or hide tag filters until coverage is useful.

Acceptance criteria:

- Search filters are accessible.
- Users who get zero results can recover easily.

### 13. Fix CSS variables and contrast

Files to inspect:

- `src/assets/styles.css`

Tasks:

1. Define or replace `--near-black`.
2. Define or replace `--border`.
3. Use darker accent colors for small text links.
4. Add contrast checks for common color pairs.

Acceptance criteria:

- No undefined CSS custom properties remain.
- Small text links pass practical contrast thresholds.

## Phase 5: AdSense Preparation

Do this only after Phases 1-4.

Tasks:

1. Update Privacy Policy before ads go live.
2. Add reserved ad containers to prevent layout shift.
3. Avoid ads in:
   - hero section
   - inside tool forms
   - between form and output
   - near copy buttons
4. Test CLS after ads are added.
5. Keep tool pages useful without forcing ad interaction.

Recommended placements:

- Homepage: after intro/category area.
- Tool page: after tool workspace or after first explanatory block.
- Category page: between grid and guide content.
- Collection page: after workflow steps.

## Suggested Implementation Order

1. Social image assets and build validation.
2. Multilingual noindex/removal or complete localization gating.
3. Noindex-page broken language links.
4. Metadata audit script.
5. `llms.txt` cleanup.
6. Entity/About/Organization improvements.
7. Date/source/editorial signals.
8. UX accessibility fixes.
9. AdSense preparation.

