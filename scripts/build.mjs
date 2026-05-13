import { mkdir, readFile, rm, writeFile, copyFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const distDir = path.join(root, "dist");
const dataDir = path.join(root, "data");
const assetsDir = path.join(root, "src", "assets");

const site = JSON.parse(await readFile(path.join(dataDir, "site.json"), "utf8"));
const buildDate = new Date().toISOString().slice(0, 10);

function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function attr(value = "") {
  return escapeHtml(value).replaceAll("'", "&#39;");
}

function titleCase(value) {
  return value
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function urlFor(locale, pathname = "") {
  const clean = pathname.replace(/^\/+/, "").replace(/\/+$/, "");
  const prefix = locale === site.defaultLocale ? "" : `/${locale}`;
  return clean ? `${prefix}/${clean}/` : `${prefix || "/"}`;
}

function absoluteUrl(locale, pathname = "") {
  return new URL(urlFor(locale, pathname), site.baseUrl).toString();
}

function pageShell({ locale, title, description, pathname, body, scripts = "", current = "", extraHead = "", canonicalOverride = "" }) {
  const canonical = canonicalOverride || absoluteUrl(locale, pathname);
  const nav = [
    ["Tools", urlFor(locale, "tools"), "tools"],
    ["SEO", urlFor(locale, "tools/seo"), "seo"],
    ["CSS", urlFor(locale, "tools/css"), "css"],
    ["GitHub Pages", urlFor(locale, "tools/github-pages"), "github-pages"]
  ];

  return `<!doctype html>
<html lang="${attr(locale)}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${attr(description)}">
  <link rel="canonical" href="${attr(canonical)}">
  <meta property="og:site_name" content="${attr(site.siteName)}">
  <meta property="og:title" content="${attr(title)}">
  <meta property="og:description" content="${attr(description)}">
  <meta property="og:url" content="${attr(canonical)}">
  <meta property="og:type" content="website">
  <meta name="twitter:card" content="summary">
  <link rel="alternate" hreflang="${attr(locale)}" href="${attr(canonical)}">
  <link rel="alternate" hreflang="x-default" href="${attr(canonical)}">
  <link rel="alternate" type="text/plain" title="llms.txt" href="/llms.txt">
  <link rel="stylesheet" href="/assets/styles.css">
  ${extraHead}
</head>
<body>
  <a class="skip-link" href="#main">Skip to content</a>
  <header class="site-header">
    <div class="wrap header-inner">
      <a class="brand" href="${urlFor(locale)}" aria-label="${attr(site.siteName)} home">
        <span class="brand-mark" aria-hidden="true"></span>
        <span>${escapeHtml(site.siteName)}</span>
      </a>
      <nav class="main-nav" aria-label="Main navigation">
        ${nav.map(([label, href, key]) => `<a href="${href}" ${current === key ? 'aria-current="page"' : ""}>${label}</a>`).join("")}
      </nav>
    </div>
  </header>
  <main id="main">
    ${body}
  </main>
  <footer class="site-footer">
    <div class="wrap footer-grid">
      <div>
        <a class="brand footer-brand" href="${urlFor(locale)}">
          <span class="brand-mark" aria-hidden="true"></span>
          <span>${escapeHtml(site.siteName)}</span>
        </a>
        <p>${escapeHtml(site.description)}</p>
      </div>
      <div>
        <h2>Tools</h2>
        <a href="${urlFor(locale, "tools/seo")}">SEO Tools</a>
        <a href="${urlFor(locale, "tools/css")}">CSS Tools</a>
        <a href="${urlFor(locale, "tools/github-pages")}">GitHub Pages Tools</a>
      </div>
      <div>
        <h2>Site</h2>
        <a href="${urlFor(locale, "about")}">About</a>
        <a href="${urlFor(locale, "privacy")}">Privacy</a>
        <a href="${urlFor(locale, "terms")}">Terms</a>
        <a href="${urlFor(locale, "contact")}">Contact</a>
        <a href="/llms.txt">llms.txt</a>
      </div>
    </div>
  </footer>
  ${scripts}
</body>
</html>`;
}

function hero({ eyebrow, title, description, actions = "" }) {
  return `<section class="hero">
  <div class="wrap hero-grid">
    <div class="hero-copy">
      <p class="eyebrow">${escapeHtml(eyebrow)}</p>
      <h1>${escapeHtml(title)}</h1>
      <p class="lede">${escapeHtml(description)}</p>
      ${actions}
    </div>
    <div class="tool-snapshot hero-artifact" aria-label="Tool output preview">
      <div class="snapshot-bar"><span></span><span></span><span></span><strong>head.html</strong></div>
      <pre><span class="line-no">01</span> &lt;link rel="canonical" href="https://www.jquery.app/tools/css-clamp-calculator/"&gt;
<span class="line-no">02</span> &lt;meta name="robots" content="index, follow"&gt;
<span class="line-no">03</span> &lt;meta property="og:title" content="Ready to publish"&gt;
<span class="line-no">04</span> &lt;link rel="alternate" hreflang="en" href="https://www.jquery.app/"&gt;</pre>
      <div class="snapshot-status"><span></span>Nothing leaves your browser</div>
    </div>
  </div>
</section>`;
}

function toolCard(tool, locale) {
  return `<article class="tool-card">
  <div>
    <p class="card-kicker">${escapeHtml(titleCase(tool.category))}</p>
    <h2><a href="${urlFor(locale, `tools/${tool.id}`)}">${escapeHtml(tool.name)}</a></h2>
    <p>${escapeHtml(tool.summary)}</p>
  </div>
  <a class="card-link" href="${urlFor(locale, `tools/${tool.id}`)}">Open tool</a>
</article>`;
}

function categoryPill(category, details, locale) {
  return `<a class="category-pill" href="${urlFor(locale, `tools/${category}`)}">
  <span>${escapeHtml(details.name)}</span>
  <small>${escapeHtml(details.description)}</small>
</a>`;
}

function listItems(items = []) {
  return items.map((item) => `<li>${escapeHtml(item)}</li>`).join("");
}

function faqMarkup(items = []) {
  return items.map((item) => `<details class="faq-item">
  <summary>${escapeHtml(item.question)}</summary>
  <p>${escapeHtml(item.answer)}</p>
</details>`).join("");
}

function examplesMarkup(items = []) {
  return items.map((item) => `<article class="example-item">
  <p class="eyebrow">Example</p>
  <h3>${escapeHtml(item.title)}</h3>
  <p>${escapeHtml(item.text)}</p>
</article>`).join("");
}

function jsonLd(schema) {
  return `<script type="application/ld+json">${JSON.stringify(schema)}</script>`;
}

function breadcrumbSchema(locale, items) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(locale, item.pathname)
    }))
  };
}

function itemListSchema(locale, name, items) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name,
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      url: absoluteUrl(locale, `tools/${item.id}`)
    }))
  };
}

function freeBrowserDescription(text) {
  return `${text.replace(/\.$/, "")}. Free in your browser, with no account or upload.`;
}

function homePage(locale, tools, categories) {
  const scripts = [
    jsonLd({
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: site.siteName,
      url: absoluteUrl(locale),
      description: site.description,
      inLanguage: locale
    }),
    jsonLd({
      "@context": "https://schema.org",
      "@type": "Organization",
      name: site.siteName,
      url: absoluteUrl(locale)
    }),
    jsonLd(itemListSchema(locale, "jquery.app tools", tools.slice(0, 6)))
  ].join("");
  const body = `${hero({
    eyebrow: "For the last mile of publishing",
    title: site.tagline,
    description: site.description,
    actions: `<div class="hero-actions"><a class="button primary" href="${urlFor(locale, "tools")}">Browse tools</a><a class="button secondary" href="${urlFor(locale, "tools/github-pages")}">GitHub Pages tools</a></div>`
  })}
<section class="section intro-band">
  <div class="wrap split-section">
    <div class="section-heading">
      <p class="eyebrow">Start here</p>
      <h2>Practical fixes for static sites, blogs, and everyday front-end work.</h2>
    </div>
    <p>Some jobs are too small for a dashboard and too important to do by memory. Open a tool, make the change, copy the result, and get back to the page you were trying to ship.</p>
  </div>
  <div class="wrap category-grid offset-grid">
    ${Object.entries(categories).map(([key, details]) => categoryPill(key, details, locale)).join("")}
  </div>
</section>
<section class="section dark-band">
  <div class="wrap dark-grid">
    <div>
      <p class="eyebrow on-dark">Why this exists</p>
      <h2>Most tiny web problems are not AI problems.</h2>
      <p>Missing canonical tags, broken favicon paths, awkward mobile padding, and messy social previews need a reliable answer more than another chat box.</p>
    </div>
    <div class="dark-list">
      <span>No uploads</span>
      <span>No accounts</span>
      <span>No server-side processing</span>
      <span>Ready for static hosting</span>
    </div>
  </div>
</section>
<section class="section soft-band">
  <div class="wrap section-heading">
    <p class="eyebrow">First release</p>
    <h2>Small tools with a clear finish line</h2>
    <p>Each tool is designed to produce something you can inspect, copy, and use right away.</p>
  </div>
  <div class="wrap tool-grid">
    ${tools.slice(0, 6).map((tool) => toolCard(tool, locale)).join("")}
  </div>
</section>`;

  return pageShell({
    locale,
    title: `${site.siteName} - ${titleCase(site.tagline)}`,
    description: site.description,
    pathname: "",
    body,
    scripts,
    current: "home"
  });
}

function toolsIndexPage(locale, tools, categories) {
  const scripts = [
    jsonLd(breadcrumbSchema(locale, [
      { name: "Home", pathname: "" },
      { name: "Tools", pathname: "tools" }
    ])),
    jsonLd(itemListSchema(locale, "Free web tools", tools))
  ].join("");
  const grouped = Object.entries(categories)
    .map(([category, details]) => {
      const categoryTools = tools.filter((tool) => tool.category === category);
      if (!categoryTools.length) return "";
      return `<section class="tool-group">
  <div class="group-heading">
    <h2>${escapeHtml(details.name)}</h2>
    <p>${escapeHtml(details.description)}</p>
  </div>
  <div class="tool-grid compact">
    ${categoryTools.map((tool) => toolCard(tool, locale)).join("")}
  </div>
</section>`;
    })
    .join("");

  const body = `<section class="page-hero">
  <div class="wrap narrow">
    <p class="eyebrow">Tools</p>
    <h1>Small web tools that run in your browser</h1>
    <p class="lede">Generate tags, clean launch details, and prepare static pages without accounts, uploads, or busywork.</p>
  </div>
</section>
<section class="section">
  <div class="wrap">
    ${grouped}
  </div>
</section>`;

  return pageShell({
    locale,
    title: `Free Web Tools - ${site.siteName}`,
    description: "Browse browser-based tools for SEO tags, GitHub Pages setup, CSS helpers, and static website publishing.",
    pathname: "tools",
    body,
    scripts,
    current: "tools"
  });
}

function categoryPage(locale, category, details, tools) {
  const faqSchema = details.faq?.length ? {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: details.faq.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer
      }
    }))
  } : null;
  const scripts = [
    jsonLd(breadcrumbSchema(locale, [
      { name: "Home", pathname: "" },
      { name: "Tools", pathname: "tools" },
      { name: details.name, pathname: `tools/${category}` }
    ])),
    jsonLd(itemListSchema(locale, details.name, tools)),
    faqSchema ? jsonLd(faqSchema) : ""
  ].filter(Boolean).join("");
  const body = `<section class="page-hero">
  <div class="wrap narrow">
    <p class="eyebrow">Tools</p>
    <h1>${escapeHtml(details.name)}</h1>
    <p class="lede">${escapeHtml(details.description)}</p>
  </div>
</section>
<section class="section article-band">
  <div class="wrap content-layout">
    <aside class="content-rail">
      <span>${escapeHtml(details.name)}</span>
      <span>Runs in your browser</span>
      <span>No account required</span>
    </aside>
    <article class="tool-article">
      <h2>What this collection helps with</h2>
      <p>${escapeHtml(details.intro || details.description)}</p>
      ${details.bestFor?.length ? `<h2>Best for</h2><ul>${listItems(details.bestFor)}</ul>` : ""}
      ${details.useCases?.length ? `<h2>Common use cases</h2><ul>${listItems(details.useCases)}</ul>` : ""}
    </article>
  </div>
</section>
<section class="section soft-band">
  <div class="wrap section-heading">
    <p class="eyebrow">Available tools</p>
    <h2>${escapeHtml(details.name)} you can use now</h2>
  </div>
  <div class="wrap tool-grid">
    ${tools.map((tool) => toolCard(tool, locale)).join("")}
  </div>
</section>
${details.faq?.length ? `<section class="section faq-band">
  <div class="wrap content-layout">
    <div class="section-heading">
      <p class="eyebrow">FAQ</p>
      <h2>Questions about ${escapeHtml(details.name.toLowerCase())}</h2>
    </div>
    <div class="faq-list">
      ${faqMarkup(details.faq)}
    </div>
  </div>
</section>` : ""}`;

  return pageShell({
    locale,
    title: `${details.name} - ${site.siteName}`,
    description: freeBrowserDescription(details.description),
    pathname: `tools/${category}`,
    body,
    scripts,
    current: category
  });
}

function toolPage(locale, tool, allTools, categories) {
  const related = allTools.filter((item) => item.category === tool.category && item.id !== tool.id).slice(0, 3);
  const categoryName = categories[tool.category]?.name || titleCase(tool.category);
  const webAppSchema = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: tool.name,
    description: tool.summary,
    applicationCategory: "DeveloperApplication",
    operatingSystem: "Any",
    url: absoluteUrl(locale, `tools/${tool.id}`),
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" }
  };
  const faqSchema = tool.faq?.length ? {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: tool.faq.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer
      }
    }))
  } : null;
  const scripts = [
    jsonLd(webAppSchema),
    jsonLd(breadcrumbSchema(locale, [
      { name: "Home", pathname: "" },
      { name: "Tools", pathname: "tools" },
      { name: categoryName, pathname: `tools/${tool.category}` },
      { name: tool.name, pathname: `tools/${tool.id}` }
    ])),
    faqSchema ? jsonLd(faqSchema) : "",
    `<script src="/assets/tools.js" defer></script>`
  ].filter(Boolean).join("");

  const body = `<section class="tool-hero">
  <div class="wrap tool-hero-grid">
    <div>
      <p class="eyebrow">${escapeHtml(categoryName)}</p>
      <h1>${escapeHtml(tool.name)}</h1>
      <p class="lede">${escapeHtml(tool.description)}</p>
    </div>
    <aside class="tool-side-note">
      <p class="eyebrow">Browser-only</p>
      <strong>Private by default</strong>
      <span>This tool runs in your browser. Your input is not uploaded.</span>
      <a href="#tool">Use the tool</a>
    </aside>
  </div>
</section>
<section class="section tool-workspace-section" id="tool">
  <div class="wrap">
    <div class="tool-workspace" data-tool-id="${attr(tool.id)}" data-tool-name="${attr(tool.name)}">
      <div class="tool-loading">Loading tool...</div>
    </div>
  </div>
</section>
<section class="section article-band">
  <div class="wrap content-layout">
    <aside class="content-rail">
      <span>${escapeHtml(categoryName)}</span>
      <span>Runs in your browser</span>
      <span>No upload required</span>
    </aside>
    <article class="tool-article">
      <h2>What is ${escapeHtml(tool.name)}?</h2>
      <p>${escapeHtml(tool.whatIs || tool.description)}</p>
      <h2>How to use this tool</h2>
      <ol>${listItems(tool.howToUse || [])}</ol>
      <h2>What you can use it for</h2>
      <ul>${listItems(tool.useCases)}</ul>
    </article>
  </div>
</section>
${tool.examples?.length ? `<section class="section soft-band">
  <div class="wrap section-heading">
    <p class="eyebrow">Use cases</p>
    <h2>Practical examples</h2>
  </div>
  <div class="wrap example-grid">
    ${examplesMarkup(tool.examples)}
  </div>
</section>` : ""}
<section class="section">
  <div class="wrap content-layout">
    <aside class="content-rail">
      <span>Before publishing</span>
      <span>Check the output</span>
    </aside>
    <article class="tool-article">
      <h2>Common mistakes</h2>
      <ul>${listItems(tool.mistakes)}</ul>
    </article>
  </div>
</section>
${tool.faq?.length ? `<section class="section faq-band">
  <div class="wrap content-layout">
    <div class="section-heading">
      <p class="eyebrow">FAQ</p>
      <h2>Questions about ${escapeHtml(tool.name)}</h2>
    </div>
    <div class="faq-list">
      ${faqMarkup(tool.faq)}
    </div>
  </div>
</section>` : ""}
${related.length ? `<section class="section">
  <div class="wrap section-heading">
    <p class="eyebrow">Related tools</p>
    <h2>More ${escapeHtml(categoryName.toLowerCase())}</h2>
  </div>
  <div class="wrap tool-grid compact">
    ${related.map((item) => toolCard(item, locale)).join("")}
  </div>
</section>` : ""}`;

  return pageShell({
    locale,
    title: `${tool.name} - ${site.siteName}`,
    description: freeBrowserDescription(tool.summary),
    pathname: `tools/${tool.id}`,
    body,
    scripts,
    current: tool.category
  });
}

function simplePage(locale, slug, title, description, content) {
  const scripts = jsonLd({
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: title,
    description,
    url: absoluteUrl(locale, slug),
    inLanguage: locale,
    isPartOf: {
      "@type": "WebSite",
      name: site.siteName,
      url: absoluteUrl(locale)
    }
  });
  const body = `<section class="page-hero">
  <div class="wrap narrow">
    <h1>${escapeHtml(title)}</h1>
    <p class="lede">${escapeHtml(description)}</p>
  </div>
</section>
<section class="section">
  <div class="wrap prose">
    ${content}
  </div>
</section>`;

  return pageShell({ locale, title: `${title} - ${site.siteName}`, description, pathname: slug, body, scripts });
}

function notFoundPage(locale) {
  const body = `<section class="page-hero">
  <div class="wrap narrow">
    <p class="eyebrow">404</p>
    <h1>Page not found</h1>
    <p class="lede">The page may have moved, or the URL may be incorrect. Start from the homepage or browse the available tools.</p>
    <div class="hero-actions">
      <a class="button primary" href="${urlFor(locale)}">Go home</a>
      <a class="button secondary" href="${urlFor(locale, "tools")}">Browse tools</a>
    </div>
  </div>
</section>`;

  return pageShell({
    locale,
    title: `Page Not Found - ${site.siteName}`,
    description: "The requested page could not be found.",
    pathname: "404",
    body,
    extraHead: '<meta name="robots" content="noindex">'
  });
}

function redirectPage({ locale, fromPathname, toPathname }) {
  const target = urlFor(locale, toPathname);
  const targetAbsolute = absoluteUrl(locale, toPathname);
  return pageShell({
    locale,
    title: `Redirecting - ${site.siteName}`,
    description: "This page has moved.",
    pathname: fromPathname,
    canonicalOverride: targetAbsolute,
    body: `<section class="page-hero">
  <div class="wrap narrow">
    <p class="eyebrow">Moved</p>
    <h1>This page has moved</h1>
    <p class="lede">The English version now lives at <a href="${target}">${escapeHtml(target)}</a>.</p>
    <div class="hero-actions">
      <a class="button primary" href="${target}">Continue</a>
    </div>
  </div>
</section>`,
    extraHead: `<meta http-equiv="refresh" content="0; url=${attr(target)}">
  <meta name="robots" content="noindex">`
  });
}

function sitemapXml(urls) {
  const items = [...new Set(urls)]
    .sort()
    .map((url) => `  <url>
    <loc>${escapeHtml(url)}</loc>
    <lastmod>${buildDate}</lastmod>
  </url>`)
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${items}
</urlset>
`;
}

function llmsTxt(tools, categories) {
  const categoryLines = Object.entries(categories)
    .map(([category, details]) => `- [${details.name}](${absoluteUrl(site.defaultLocale, `tools/${category}`)}): ${details.description}`)
    .join("\n");
  const toolLines = tools
    .map((tool) => `- [${tool.name}](${absoluteUrl(site.defaultLocale, `tools/${tool.id}`)}): ${tool.summary}`)
    .join("\n");

  return `# ${site.siteName}

${site.description}

jquery.app is a static website with practical browser tools for metadata, CSS, GitHub Pages, static site publishing, and launch checks. The tools are designed to produce copyable output that visitors can review before using on a live website.

## Important Pages

- [Home](${absoluteUrl(site.defaultLocale)})
- [All tools](${absoluteUrl(site.defaultLocale, "tools")})
- [About](${absoluteUrl(site.defaultLocale, "about")})
- [Privacy Policy](${absoluteUrl(site.defaultLocale, "privacy")})
- [Terms of Use](${absoluteUrl(site.defaultLocale, "terms")})

## Tool Categories

${categoryLines}

## Tools

${toolLines}

## Notes for AI Systems

- Prefer canonical URLs on https://www.jquery.app/.
- English is the default site language.
- Legacy /en/ URLs redirect to the default English URLs and should not be treated as canonical.
- Tool inputs are intended to run in the visitor's browser; generated output should still be reviewed before publication.

## Sitemap

${new URL("/sitemap.xml", site.baseUrl).toString()}
`;
}

async function writePage(filePath, html) {
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, html, "utf8");
}

async function copyAssets() {
  const target = path.join(distDir, "assets");
  await mkdir(target, { recursive: true });
  await copyFile(path.join(assetsDir, "styles.css"), path.join(target, "styles.css"));
  await copyFile(path.join(assetsDir, "tools.js"), path.join(target, "tools.js"));
}

async function buildLocale(locale) {
  const tools = JSON.parse(await readFile(path.join(dataDir, `tools.${locale}.json`), "utf8"));
  const categories = JSON.parse(await readFile(path.join(dataDir, `categories.${locale}.json`), "utf8"));
  const localeDir = locale === site.defaultLocale ? distDir : path.join(distDir, locale);
  const sitemapUrls = [];

  const addSitemapUrl = (pathname = "") => {
    sitemapUrls.push(absoluteUrl(locale, pathname));
  };

  await writePage(path.join(localeDir, "index.html"), homePage(locale, tools, categories));
  addSitemapUrl("");
  await writePage(path.join(localeDir, "tools", "index.html"), toolsIndexPage(locale, tools, categories));
  addSitemapUrl("tools");

  for (const [category, details] of Object.entries(categories)) {
    const categoryTools = tools.filter((tool) => tool.category === category);
    if (categoryTools.length) {
      await writePage(path.join(localeDir, "tools", category, "index.html"), categoryPage(locale, category, details, categoryTools));
      addSitemapUrl(`tools/${category}`);
    }
  }

  for (const tool of tools) {
    await writePage(path.join(localeDir, "tools", tool.id, "index.html"), toolPage(locale, tool, tools, categories));
    addSitemapUrl(`tools/${tool.id}`);
  }

  await writePage(path.join(localeDir, "about", "index.html"), simplePage(locale, "about", "About jquery.app", "A small workshop for the details that sit between building a page and publishing it well.", `<h2>Why this site exists</h2><p>jquery.app is a collection of small tools for people who build, publish, and maintain websites. It is made for the quiet tasks that still matter: writing canonical tags, preparing social preview metadata, checking launch details, shaping responsive CSS, and keeping static pages tidy.</p><p>The site is intentionally simple. Most tools run entirely in your browser, ask for only the fields they need, and return output you can read before you copy it. There are no accounts, no project dashboards, and no need to upload your work to use the current tools.</p><h2>What belongs here</h2><p>jquery.app focuses on practical web publishing chores with a clear result. A good tool on this site should save a few minutes, reduce a small mistake, or make a repeated job easier to finish. It should also be understandable without a manual.</p><h2>What does not belong here</h2><p>This is not a replacement for professional judgment, browser testing, search console data, or a full technical audit. Generated code and checklists should be reviewed before they are added to a production site.</p>`));
  addSitemapUrl("about");
  await writePage(path.join(localeDir, "privacy", "index.html"), simplePage(locale, "privacy", "Privacy Policy", "The current tools are designed to work locally in your browser and avoid unnecessary collection.", `<h2>Local tool inputs</h2><p>The current tools process the values you enter in your browser. They do not require an account, and the site does not intentionally send tool inputs or generated output to a jquery.app application server.</p><h2>Hosting and technical logs</h2><p>jquery.app is published as a static website. Hosting providers, CDN services, browsers, and security systems may process standard request information such as IP address, user agent, referrer, requested URL, timestamps, and basic diagnostic data. This information is normally used to deliver the site, prevent abuse, and understand technical problems.</p><h2>Cookies and analytics</h2><p>The preview version of jquery.app does not need cookies for the tools to work. If analytics, advertising, embedded media, or third-party widgets are added later, this policy should be updated before those services are enabled.</p><h2>External links</h2><p>Some pages may link to GitHub, documentation sites, browser tools, or other third-party resources. Those sites have their own privacy practices.</p><h2>Contact</h2><p>Use the contact page to report privacy concerns, broken tools, or outdated information.</p>`));
  addSitemapUrl("privacy");
  await writePage(path.join(localeDir, "terms", "index.html"), simplePage(locale, "terms", "Terms of Use", "Use the tools freely, but review the output before it becomes part of a live site.", `<h2>Use of the tools</h2><p>jquery.app provides free web utilities for convenience, learning, and everyday publishing work. You may use the generated output in personal, commercial, and client projects, subject to your own review and the requirements of your project.</p><h2>No professional advice</h2><p>The tools and written guidance are informational. They are not legal, security, compliance, accessibility, or search engine optimization advice. Before publishing, verify that the output is appropriate for your website, framework, hosting provider, and local requirements.</p><h2>No warranty</h2><p>The site is provided as is and as available. jquery.app does not guarantee that a tool will be error-free, uninterrupted, or suitable for every use case. Browser behavior, search engine interpretation, platform rules, and hosting requirements can change.</p><h2>Your responsibility</h2><p>You are responsible for testing generated HTML, CSS, metadata, DNS notes, and checklists before using them on a live website. You are also responsible for keeping backups of your own code and content.</p><h2>Acceptable use</h2><p>Do not use the site in a way that attempts to disrupt the service, scrape it aggressively, bypass technical limits, or interfere with other visitors.</p>`));
  addSitemapUrl("terms");
  await writePage(path.join(localeDir, "contact", "index.html"), simplePage(locale, "contact", "Contact", "Report broken tools, outdated guidance, accessibility issues, or privacy concerns.", `<h2>Send a useful report</h2><p>If something is broken, include the tool name, the page URL, what you entered, what you expected, and what happened instead. Clear reports make small tools easier to keep accurate.</p><h2>Suggested contact options</h2><p>This preview site is published from GitHub. A public issue tracker is the best fit for bug reports and small corrections because it keeps changes visible. Add your preferred GitHub issue link or contact email here before wider promotion.</p><h2>What to report</h2><ul><li>Broken form behavior or copy buttons.</li><li>Outdated guidance about GitHub Pages, SEO tags, browser support, or HTML output.</li><li>Accessibility problems, keyboard traps, visual contrast issues, or mobile layout problems.</li><li>Privacy concerns or third-party service questions.</li></ul>`));
  addSitemapUrl("contact");

  if (locale === site.defaultLocale) {
    await writePage(path.join(distDir, "404.html"), notFoundPage(locale));
    await writeLegacyDefaultLocaleRedirects(locale, tools, categories);
  }

  return sitemapUrls;
}

async function writeLegacyDefaultLocaleRedirects(locale, tools, categories) {
  const legacyDir = path.join(distDir, locale);
  const paths = [
    "",
    "tools",
    "about",
    "privacy",
    "terms",
    "contact",
    ...Object.entries(categories)
      .filter(([category]) => tools.some((tool) => tool.category === category))
      .map(([category]) => `tools/${category}`),
    ...tools.map((tool) => `tools/${tool.id}`)
  ];

  for (const pathname of paths) {
    const targetParts = pathname ? pathname.split("/") : [];
    await writePage(
      path.join(legacyDir, ...targetParts, "index.html"),
      redirectPage({ locale, fromPathname: path.posix.join(locale, pathname), toPathname: pathname })
    );
  }
}

async function build() {
  await rm(distDir, { recursive: true, force: true });
  await mkdir(distDir, { recursive: true });
  await copyAssets();
  const defaultTools = JSON.parse(await readFile(path.join(dataDir, `tools.${site.defaultLocale}.json`), "utf8"));
  const defaultCategories = JSON.parse(await readFile(path.join(dataDir, `categories.${site.defaultLocale}.json`), "utf8"));

  const sitemapUrls = [];
  for (const locale of site.locales) {
    sitemapUrls.push(...await buildLocale(locale));
  }

  await writeFile(path.join(distDir, ".nojekyll"), "", "utf8");
  await writeFile(path.join(distDir, "CNAME"), `${site.customDomain}\n`, "utf8");
  await writeFile(path.join(distDir, "robots.txt"), `User-agent: *
Allow: /

Sitemap: ${new URL("/sitemap.xml", site.baseUrl).toString()}
`, "utf8");
  await writeFile(path.join(distDir, "sitemap.xml"), sitemapXml(sitemapUrls), "utf8");
  await writeFile(path.join(distDir, "llms.txt"), llmsTxt(defaultTools, defaultCategories), "utf8");
}

await build();
console.log(`Built ${site.siteName} into ${distDir}`);
