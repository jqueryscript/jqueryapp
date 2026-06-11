# jquery.app Audit Evidence

Date: 2026-06-03  
Project path: `J:\网站\jqueryapp`

## Build

Command run:

```powershell
npm run build
```

Result:

```text
Built jquery.app into J:\网站\jqueryapp\dist
```

## Site Configuration

Source: `data/site.json`

```json
{
  "baseUrl": "https://www.jquery.app",
  "customDomain": "www.jquery.app",
  "defaultLocale": "en",
  "locales": ["en", "de", "fr", "es", "ja", "nl"],
  "siteName": "jquery.app",
  "tagline": "You might not need AI for every web task",
  "description": "Solve everyday HTML, CSS, SEO, mobile UI and publishing tasks with fast browser tools. No uploads, accounts, or AI token costs."
}
```

## Generated Output Counts

Generated HTML files:

```text
968
```

Sitemap URLs:

```text
828
```

Noindex pages:

```text
139
```

Meta-refresh pages:

```text
138
```

Locale/page distribution in generated HTML:

| Locale bucket | HTML files |
|---|---:|
| root/default English | 140 |
| `en` legacy redirects | 138 |
| `de` | 138 |
| `es` | 138 |
| `fr` | 138 |
| `ja` | 138 |
| `nl` | 138 |

Interpretation:

- 828 canonical URLs are generated for sitemap.
- 138 legacy `/en/` pages are generated as noindex redirect pages.
- 404 and verification files explain the remaining root/default files.

## Robots.txt

Generated `dist/robots.txt`:

```text
User-agent: *
Allow: /

Sitemap: https://www.jquery.app/sitemap.xml
```

Interpretation:

- No accidental blocking was found in local output.
- AI crawlers are not explicitly blocked.
- Live server headers and CDN-level bot rules were not verified.

## llms.txt

Generated file:

```text
dist/llms.txt
```

Character count:

```text
29910
```

Detected section headings:

```text
Core Workflows
Tool Categories
Important Pages
Tool Categories
Tools
Notes for AI Systems
Sitemap
```

Issue:

- `Tool Categories` appears twice.

## Metadata and Head Tags

Sample pages:

| File | Title | Canonical | Hreflang count | JSON-LD types |
|---|---|---|---:|---|
| `index.html` | Small No-AI Web Tools for Developers & Designers \| jquery.app | `https://www.jquery.app/` | 7 | WebSite, Organization, ItemList |
| `tools/index.html` | Free Web Tools - jquery.app | `https://www.jquery.app/tools/` | 7 | BreadcrumbList, ItemList |
| `tools/seo/index.html` | Free SEO Tools - jquery.app | `https://www.jquery.app/tools/seo/` | 7 | BreadcrumbList, ItemList, FAQPage |
| `tools/css-clamp-calculator/index.html` | Free CSS Clamp Calculator - jquery.app | `https://www.jquery.app/tools/css-clamp-calculator/` | 7 | WebApplication, BreadcrumbList, FAQPage |
| `collections/blog-publisher/index.html` | Free Blog Publisher Toolkit - jquery.app | `https://www.jquery.app/collections/blog-publisher/` | 7 | BreadcrumbList, ItemList, FAQPage |
| `en/tools/css-clamp-calculator/index.html` | Redirecting - jquery.app | `https://www.jquery.app/tools/css-clamp-calculator/` | 0 | none |

Missing title/description/canonical:

- `google9d00cdf8df0ddc4e.html`

Interpretation:

- The Google verification file is not a normal HTML page, so missing metadata there is not an SEO problem.
- Indexable pages generally have title, description, canonical, H1, and structured data.

## Sitemap Coverage

Result:

```text
missingFromSitemapCount: 0
sitemapNotFilesCount: 0
```

Interpretation:

- All canonical indexable URLs found in generated HTML are covered by `sitemap.xml`.
- Every URL in sitemap maps to a generated file.

## Missing Assets

Missing `og:image` references:

```text
804
```

Examples:

```text
/assets/social/og-home.png
/assets/social/og-tools.png
/assets/social/og-seo.png
/assets/social/og-html.png
/assets/social/og-css.png
/assets/social/og-assets.png
/assets/social/og-github-pages.png
/assets/social/og-blog-publisher.png
/assets/social/og-multilingual-site.png
```

Local checks:

```text
Test-Path dist\assets\social: False
Test-Path src\assets\social: False
```

## Internal Links

Indexable pages:

```text
checkedIndexableRefs: 135864
missingIndexableNonSocialCount: 0
```

All pages including noindex redirects and 404:

```text
missingInternalNonSocialCount: 697
```

Examples from noindex pages:

```text
en/about/index.html -> /de/en/about/
en/about/index.html -> /fr/en/about/
en/about/index.html -> /es/en/about/
en/about/index.html -> /ja/en/about/
en/about/index.html -> /nl/en/about/
404.html -> /de/404/
404.html -> /fr/404/
```

Interpretation:

- Indexable pages are clean after excluding missing social images.
- Broken non-social internal links are generated mainly by language links on noindex redirect pages and 404.

## Content Depth

Source script:

```text
scripts/audit-content.mjs
```

Result:

```text
Content depth score distribution:
Score 5: 12 tools
Score 6: 105 tools
Score 7: 6 tools
Thin tools (score <= 2): 0
Medium tools (score 3-4): 0
Rich tools (score >= 5): 123
```

Tool counts by category:

| Category | Count |
|---|---:|
| SEO | 22 |
| HTML | 44 |
| CSS | 38 |
| GitHub Pages | 14 |
| Assets | 5 |
| Total | 123 |

Missing English data fields:

| Field | Missing count |
|---|---:|
| `whatIs` | 0 |
| `quickAnswer` | 0 |
| `limitations` | 0 |
| `verificationSteps` | 0 |
| `faq` | 0 |
| `examples` | 0 |
| `mistakes` | 0 |
| `howToUse` | 0 |
| `useCases` | 0 |
| `keywords` | 0 |
| `comparison` | 117 |
| `tags` | 89 |

Interpretation:

- English tool pages are not thin.
- Tags and comparison blocks are the main optional content gaps.

## Multilingual Completeness

Localized override counts:

| Locale | Tool overrides | Missing overrides | Name localized | Summary localized |
|---|---:|---:|---:|---:|
| `de` | 118 | 5 | 87 | 118 |
| `fr` | 118 | 5 | 118 | 118 |
| `es` | 118 | 5 | 118 | 118 |
| `ja` | 118 | 5 | 118 | 118 |
| `nl` | 118 | 5 | 50 | 118 |

Missing override IDs in all non-English locales:

```text
css-carousel-generator
css-scroll-state-query-generator
customizable-select-generator
html-invoker-command-generator
view-transition-builder
```

Deep body fields localized in non-English tool pages:

| Field | Localized count per non-English locale |
|---|---:|
| `whatIs` | 0 |
| `quickAnswer` | 0 |
| `howToUse` | 0 |
| `useCases` | 0 |
| `examples` | 0 |
| `mistakes` | 0 |
| `faq` | 0 |
| `limitations` | 0 |
| `verificationSteps` | 0 |

Interpretation:

- Non-English tool pages are not full translations.
- This is the highest-risk content quality issue.

## Structured Data Counts

JSON-LD types in generated output:

| Type | Count |
|---|---:|
| `WebApplication` | 738 |
| `BreadcrumbList` | 798 |
| `FAQPage` | 792 |
| `ItemList` | 66 |
| `WebPage` | 24 |
| `WebSite` | 6 |
| `Organization` | 6 |

Indexable pages without JSON-LD:

```text
google9d00cdf8df0ddc4e.html
```

Interpretation:

- Structured data coverage is strong for real pages.
- The verification file can be ignored.

## Metadata Examples

Long English descriptions:

```text
tools/custom-highlight-api-generator/index.html: 294
tools/contenteditable-plaintext-only-generator/index.html: 247
tools/css-shape-function-generator/index.html: 246
tools/css-scope-rule-builder/index.html: 238
tools/css-text-indent-hanging-builder/index.html: 222
tools/css-contrast-color-function-generator/index.html: 219
```

Long localized titles:

```text
es/index.html: 80
fr/index.html: 69
nl/index.html: 68
es/tools/service-worker-module-template-generator/index.html: 68
fr/tools/html-script-loading-strategy-builder/index.html: 70
```

Duplicate non-English descriptions from missing localization:

```text
css-carousel-generator
css-scroll-state-query-generator
customizable-select-generator
html-invoker-command-generator
view-transition-builder
```

## CSS and UX Evidence

Undefined CSS variables:

```text
--border
--near-black
```

Occurrences:

```text
src/assets/styles.css:1067  color: var(--near-black);
src/assets/styles.css:1101  border-top: 1px solid var(--border);
src/assets/styles.css:1296  color: var(--near-black);
src/assets/styles.css:1298  border-bottom: 1px solid var(--border);
```

Contrast examples:

| Foreground | Background | Ratio |
|---|---|---:|
| `--body` | `--canvas` | 10.34 |
| `--muted` | `--canvas` | 5.13 |
| `--muted` | `--surface-card` | 4.48 |
| `--primary-active` | `--canvas` | 4.80 |
| `--primary` | `--canvas` | 3.11 |
| `--primary-active` | `--surface-card` | 4.19 |
| `--on-dark-soft` | `--surface-dark` | 6.62 |

Potential UX/accessibility issues:

- Search filters use placeholder text without visible labels.
- No-results filter state is weak.
- Offcanvas uses `height: 100vh`.
- Offcanvas has dialog role but no focus trap.
- Broader link/button focus styles are not consistent.

## Live Verification Limitations

Attempted live checks:

```text
https://www.jquery.app/
https://www.jquery.app/robots.txt
https://www.jquery.app/llms.txt
https://www.jquery.app/assets/social/og-home.png
https://www.jquery.app/sitemap.xml
```

Result:

```text
Unable to connect to remote server
```

Escalated live network requests did not complete before the approval deadline.

Needs later verification:

- HTTPS status
- HTTP to HTTPS redirect
- apex to www redirect
- actual live status for `/assets/social/*.png`
- actual live `robots.txt`
- actual live `sitemap.xml`
- response headers
- caching headers
- compression
- Core Web Vitals
- Google indexed URL count
- GSC indexing and performance reports

