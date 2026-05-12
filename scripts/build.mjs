import { mkdir, readFile, rm, writeFile, copyFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const distDir = path.join(root, "dist");
const dataDir = path.join(root, "data");
const assetsDir = path.join(root, "src", "assets");

const site = JSON.parse(await readFile(path.join(dataDir, "site.json"), "utf8"));

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
  return clean ? `/${locale}/${clean}/` : `/${locale}/`;
}

function absoluteUrl(locale, pathname = "") {
  return new URL(urlFor(locale, pathname), site.baseUrl).toString();
}

function pageShell({ locale, title, description, pathname, body, scripts = "", current = "", extraHead = "" }) {
  const canonical = absoluteUrl(locale, pathname);
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
      <pre><span class="line-no">01</span> &lt;link rel="canonical" href="https://site.test/page/"&gt;
<span class="line-no">02</span> &lt;meta name="robots" content="index, follow"&gt;
<span class="line-no">03</span> &lt;link rel="alternate" hreflang="en" href="..."&gt;
<span class="line-no">04</span> &lt;meta property="og:title" content="..."&gt;</pre>
      <div class="snapshot-status"><span></span>Runs locally in the browser</div>
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

function homePage(locale, tools, categories) {
  const body = `${hero({
    eyebrow: "Client-side web tools",
    title: site.tagline,
    description: site.description,
    actions: `<div class="hero-actions"><a class="button primary" href="${urlFor(locale, "tools")}">Browse tools</a><a class="button secondary" href="${urlFor(locale, "tools/github-pages")}">GitHub Pages tools</a></div>`
  })}
<section class="section intro-band">
  <div class="wrap split-section">
    <div class="section-heading">
      <p class="eyebrow">Start here</p>
      <h2>Practical fixes for static sites, blogs, and beginner front-end work.</h2>
    </div>
    <p>jquery.app is built for small jobs that should not require a login, a server, or a long tutorial. Pick the job, enter the values, copy the result, and paste it into your page.</p>
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
      <p>Missing canonical tags, broken favicon paths, unsafe mobile padding, and messy social previews need a reliable tool that gives a clean answer fast.</p>
    </div>
    <div class="dark-list">
      <span>No uploads</span>
      <span>No accounts</span>
      <span>No server-side processing</span>
      <span>Static hosting friendly</span>
    </div>
  </div>
</section>
<section class="section soft-band">
  <div class="wrap section-heading">
    <p class="eyebrow">First release</p>
    <h2>Fast fixes for static websites</h2>
    <p>These tools run in your browser. Text you enter stays on your device.</p>
  </div>
  <div class="wrap tool-grid">
    ${tools.slice(0, 6).map((tool) => toolCard(tool, locale)).join("")}
  </div>
</section>`;

  return pageShell({
    locale,
    title: `${site.siteName} - ${site.tagline}`,
    description: site.description,
    pathname: "",
    body,
    current: "home"
  });
}

function toolsIndexPage(locale, tools, categories) {
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
    <p class="lede">Generate tags, clean launch details, and prepare static pages without accounts, uploads, or server-side processing.</p>
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
    description: "Browse client-side tools for SEO tags, GitHub Pages setup, CSS helpers, and static website publishing.",
    pathname: "tools",
    body,
    current: "tools"
  });
}

function categoryPage(locale, category, details, tools) {
  const body = `<section class="page-hero">
  <div class="wrap narrow">
    <p class="eyebrow">Tools</p>
    <h1>${escapeHtml(details.name)}</h1>
    <p class="lede">${escapeHtml(details.description)}</p>
  </div>
</section>
<section class="section soft-band">
  <div class="wrap tool-grid">
    ${tools.map((tool) => toolCard(tool, locale)).join("")}
  </div>
</section>`;

  return pageShell({
    locale,
    title: `${details.name} - ${site.siteName}`,
    description: details.description,
    pathname: `tools/${category}`,
    body,
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
    `<script type="application/ld+json">${JSON.stringify(webAppSchema)}</script>`,
    faqSchema ? `<script type="application/ld+json">${JSON.stringify(faqSchema)}</script>` : "",
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
      <span>Client-side tool</span>
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
    description: tool.summary,
    pathname: `tools/${tool.id}`,
    body,
    scripts,
    current: tool.category
  });
}

function simplePage(locale, slug, title, description, content) {
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

  return pageShell({ locale, title: `${title} - ${site.siteName}`, description, pathname: slug, body });
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

function sitemapXml(urls) {
  const items = [...new Set(urls)]
    .sort()
    .map((url) => `  <url>
    <loc>${escapeHtml(url)}</loc>
  </url>`)
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${items}
</urlset>
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
  const localeDir = path.join(distDir, locale);
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

  await writePage(path.join(localeDir, "about", "index.html"), simplePage(locale, "about", "About", "jquery.app is a client-side tool site for small web publishing tasks.", `<p>jquery.app provides small browser-based tools for beginner web developers, static site owners, bloggers, and people who maintain simple websites. The site focuses on practical fixes: metadata, HTML head tags, GitHub Pages setup, responsive CSS values, favicon markup, and other tasks that should be quick to solve.</p><p>The tools are designed for static hosting. They run in the browser, avoid account creation, and keep inputs on the user's device unless a future tool clearly states otherwise.</p>`));
  addSitemapUrl("about");
  await writePage(path.join(localeDir, "privacy", "index.html"), simplePage(locale, "privacy", "Privacy", "jquery.app tools are designed to process inputs locally in your browser.", `<p>Tool inputs are processed in the browser. The current tools do not require accounts, do not upload form values to a server, and do not store generated output on jquery.app servers.</p><p>Because the site is hosted as static files, normal hosting, CDN, browser, and security logs may still record standard request information such as requested URLs, user agent, referrer, and IP address. If analytics or advertising tools are added later, this policy should be updated before those tools are enabled.</p>`));
  addSitemapUrl("privacy");
  await writePage(path.join(localeDir, "terms", "index.html"), simplePage(locale, "terms", "Terms", "Use jquery.app tools as free informational utilities and review generated output before publishing it.", `<p>jquery.app provides free tools for convenience and educational use. Generated output should be reviewed before it is added to a live website, repository, CMS, or production workflow.</p><p>The tools are provided without warranties. You are responsible for checking whether generated HTML, CSS, SEO tags, DNS notes, and publishing checklists are appropriate for your site and hosting setup.</p>`));
  addSitemapUrl("terms");
  await writePage(path.join(localeDir, "contact", "index.html"), simplePage(locale, "contact", "Contact", "Contact information for jquery.app will be connected before the full public launch.", `<p>This preview release is prepared for GitHub Pages deployment. Add a working contact email, repository issue link, or contact form destination before wider promotion.</p><p>A public tool site should give users a clear way to report broken tools, outdated guidance, accessibility issues, and privacy concerns.</p>`));
  addSitemapUrl("contact");

  if (locale === site.defaultLocale) {
    await writePage(path.join(distDir, "index.html"), homePage(locale, tools, categories));
    await writePage(path.join(distDir, "404.html"), notFoundPage(locale));
  }

  return sitemapUrls;
}

async function build() {
  await rm(distDir, { recursive: true, force: true });
  await mkdir(distDir, { recursive: true });
  await copyAssets();

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
}

await build();
console.log(`Built ${site.siteName} into ${distDir}`);
