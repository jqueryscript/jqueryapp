import { mkdir, readFile, rm, writeFile, copyFile, readdir } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const distDir = path.join(root, "dist");
const dataDir = path.join(root, "data");
const assetsDir = path.join(root, "src", "assets");

const site = JSON.parse(await readFile(path.join(dataDir, "site.json"), "utf8"));
const locales = JSON.parse(await readFile(path.join(dataDir, "locales.json"), "utf8"));
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

function localePack(locale) {
  return locales[locale] || locales[site.defaultLocale];
}

function localeSite(locale) {
  return localePack(locale).site || locales[site.defaultLocale].site;
}

function ui(locale, key) {
  return localePack(locale).ui?.[key] || locales[site.defaultLocale].ui[key] || key;
}

function uiText(locale, key, fallback) {
  return localePack(locale).ui?.[key] || locales[site.defaultLocale].ui[key] || fallback;
}

function template(locale, key, values = {}) {
  return ui(locale, key).replace(/\{(\w+)\}/g, (_, name) => values[name] ?? "");
}

function fillTemplate(value, values = {}) {
  return String(value || "").replace(/\{(\w+)\}/g, (_, name) => values[name] ?? "");
}

function urlFor(locale, pathname = "") {
  const clean = pathname.replace(/^\/+/, "").replace(/\/+$/, "");
  const prefix = locale === site.defaultLocale ? "" : `/${locale}`;
  return clean ? `${prefix}/${clean}/` : (prefix ? `${prefix}/` : "/");
}

function absoluteUrl(locale, pathname = "") {
  return new URL(urlFor(locale, pathname), site.baseUrl).toString();
}

function buildNavTools(allTools) {
  const map = {};
  for (const t of allTools) {
    if (!map[t.category]) map[t.category] = [];
    if (map[t.category].length < 10) map[t.category].push(t);
  }
  return map;
}

function pageShell({ locale, title, description, pathname, body, scripts = "", current = "", extraHead = "", canonicalOverride = "", skipAlternates = false, image = "", navTools = null }) {
  const canonical = canonicalOverride || absoluteUrl(locale, pathname);
  const lang = localePack(locale);
  const defaultCanonical = absoluteUrl(site.defaultLocale, pathname);
  // Nav icons — inline SVG from Lucide (24x24, stroke-width 2)
  const navIcons = {
    tools: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>`,
    seo: `<svg width="18" height="18" viewBox="0 0 24 24"><path d="M21 12a9 9 0 0 1-9 9m9-9a9 9 0 0 0-9-9m9 9H3m9 9a9 9 0 0 1-9-9m9 9c1.66 0 3-4.03 3-9s-1.34-9-3-9m0 18c-1.66 0-3-4.03-3-9s1.34-9 3-9m-9 9a9 9 0 0 1 9-9" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
    html: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m18 16 4-4-4-4"/><path d="m6 8-4 4 4 4"/><path d="m14.5 4-5 16"/></svg>`,
    css: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2l9 4-2 14-7 4-7-4-2-14z"/><path d="M12 2v20"/><path d="m7 7 5-1 5 1"/><path d="m7 12 5 1 5-1"/></svg>`,
    assets: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.09-3.09a2 2 0 0 0-2.82 0L9 18"/></svg>`,
    "github-pages": `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.4 5.4 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65A3.7 3.7 0 0 1 8 18c-1.15.1-2.18-.4-3-1.5 0 0-1.5-2-3.5-1.5"/></svg>`
  };

  const navItems = [
    [uiText(locale, "allTools", "All Tools"), urlFor(locale, "tools"), "tools"],
    [ui(locale, "seo"), urlFor(locale, "tools/seo"), "seo"],
    [ui(locale, "html"), urlFor(locale, "tools/html"), "html"],
    [ui(locale, "css"), urlFor(locale, "tools/css"), "css"],
    [ui(locale, "assets"), urlFor(locale, "tools/assets"), "assets"],
    [ui(locale, "githubPages"), urlFor(locale, "tools/github-pages"), "github-pages"]
  ];

  // Build mega menu nav or simple nav
  let mainNavHtml = "";
  if (navTools) {
    mainNavHtml = navItems.map(([label, href, key]) => {
      const tools = navTools[key] || [];
      const isCurrent = current === key;
      const icon = navIcons[key] || "";
      if (!tools.length) {
        return `<a href="${href}" ${isCurrent ? 'aria-current="page"' : ""}>${icon}<span>${label}</span></a>`;
      }
      return `<div class="nav-item">
        <a href="${href}" class="nav-trigger" ${isCurrent ? 'aria-current="page"' : ""}>${icon}<span>${label}</span><span class="nav-arrow" aria-hidden="true">&#9662;</span></a>
        <div class="mega-panel" role="region" aria-label="${label} tools">
          <div class="mega-inner">
            <div class="mega-tools">
              ${tools.map((t) => `<a href="${urlFor(locale, `tools/${t.id}`)}">${escapeHtml(t.name)}</a>`).join("")}
            </div>
            <a class="mega-all" href="${href}">${escapeHtml(uiText(locale, "megaAllPrefix", "All Free {0} Tools").replace("{0}", label))} &rarr;</a>
          </div>
        </div>
      </div>`;
    }).join("");
  } else {
    mainNavHtml = navItems.map(([label, href, key]) => {
      const icon = navIcons[key] || "";
      return `<a href="${href}" ${current === key ? 'aria-current="page"' : ""}>${icon}<span>${label}</span></a>`;
    }).join("");
  }

  const alternateLinks = skipAlternates ? "" : site.locales
    .map((item) => `  <link rel="alternate" hreflang="${attr(item)}" href="${attr(absoluteUrl(item, pathname))}">`)
    .concat(`  <link rel="alternate" hreflang="x-default" href="${attr(defaultCanonical)}">`)
    .join("\n");
  const languageLinks = site.locales
    .map((item) => `<a href="${urlFor(item, pathname)}" ${item === locale ? 'aria-current="true"' : ""}>${escapeHtml(localePack(item).nativeName)}</a>`)
    .join("");
  const languageMenu = skipAlternates ? "" : `<details class="language-menu">
        <summary>${escapeHtml(lang.nativeName)}</summary>
        <div>
          ${languageLinks}
        </div>
      </details>`;

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
  ${image ? `<meta property="og:image" content="${attr(image)}">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:image" content="${attr(image)}">` : `<meta name="twitter:card" content="summary">`}
${alternateLinks}
  <link rel="icon" href="/favicon.svg" type="image/svg+xml">
  <meta name="theme-color" content="#181715">
  <link rel="alternate" type="text/plain" title="llms.txt" href="/llms.txt">
  <link rel="stylesheet" href="/assets/styles.css">
  <script async src="https://www.googletagmanager.com/gtag/js?id=G-QLFECKZQ9S"></script>
  <script>
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', 'G-QLFECKZQ9S', { send_page_view: true });
  </script>
  ${extraHead}
</head>
<body>
  <a class="skip-link" href="#main">${escapeHtml(uiText(locale, "skipToContent", "Skip to content"))}</a>
  <header class="site-header">
    <div class="wrap header-inner">
      <a class="brand" href="${urlFor(locale)}" aria-label="${attr(site.siteName)} home">
        <span class="brand-mark" aria-hidden="true"></span>
        <span>${escapeHtml(site.siteName)}</span>
      </a>
      <nav class="main-nav" aria-label="${attr(uiText(locale, "mainNav", "Main navigation"))}">
        ${mainNavHtml}
      </nav>
      <div class="nav-actions">
        ${languageMenu}
        <button class="hamburger" aria-label="${attr(uiText(locale, "menu", "Menu"))}" aria-expanded="false" id="menu-toggle">
          <span></span><span></span><span></span>
        </button>
      </div>
    </div>
  </header>
  <div class="offcanvas-overlay" id="offcanvas-overlay"></div>
  <div class="offcanvas" id="offcanvas" role="dialog" aria-label="${attr(uiText(locale, "navMenu", "Navigation menu"))}">
    <div class="offcanvas-inner">
      <nav class="offcanvas-nav">
        <a href="${urlFor(locale, "tools")}" class="offcanvas-all">${escapeHtml(ui(locale, "browseTools"))}</a>
        ${navItems.map(([label, href, key]) => {
          const oicon = navIcons[key] || "";
          const tools = navTools ? (navTools[key] || []) : [];
          const viewAllLabel = key === "tools"
            ? uiText(locale, "allTools", "All Tools")
            : escapeHtml(uiText(locale, "megaAllPrefix", "All Free {0} Tools").replace("{0}", label));
          return `<details class="offcanvas-group">
            <summary>${oicon}${label}</summary>
            ${tools.length ? tools.map((t) => `<a href="${urlFor(locale, `tools/${t.id}`)}">${escapeHtml(t.name)}</a>`).join("") : ""}
            <a href="${href}" class="offcanvas-view-all">${viewAllLabel}</a>
          </details>`;
        }).join("")}
      </nav>
      <div class="offcanvas-lang">
        ${languageLinks}
      </div>
    </div>
  </div>
  <main id="main">
    ${body}
  </main>
  <script>
    (function(){
      var btn = document.getElementById('menu-toggle');
      var panel = document.getElementById('offcanvas');
      var overlay = document.getElementById('offcanvas-overlay');
      if(btn&&panel&&overlay){
        function open(){btn.setAttribute('aria-expanded','true');panel.classList.add('open');overlay.classList.add('open');document.body.style.overflow='hidden';}
        function close(){btn.setAttribute('aria-expanded','false');panel.classList.remove('open');overlay.classList.remove('open');document.body.style.overflow='';}
        btn.addEventListener('click',function(){btn.getAttribute('aria-expanded')==='true'?close():open();});
        overlay.addEventListener('click',close);
        document.addEventListener('keydown',function(e){if(e.key==='Escape')close();});
      }
      var items = document.querySelectorAll('.nav-item');
      var timer = null, current = null;
      items.forEach(function(item){
        var p = item.querySelector('.mega-panel');
        if(!p)return;
        function show(){if(timer){clearTimeout(timer);timer=null;}if(current&&current!==p){current.classList.remove('open');}p.classList.add('open');current=p;}
        function hide(){timer=setTimeout(function(){p.classList.remove('open');if(current===p)current=null;},150);}
        item.addEventListener('mouseenter',show);
        item.addEventListener('mouseleave',hide);
        p.addEventListener('mouseenter',function(){if(timer){clearTimeout(timer);timer=null;}});
        p.addEventListener('mouseleave',hide);
      });
    })();
  </script>
  <footer class="site-footer">
    <div class="wrap footer-grid">
      <div>
        <a class="brand footer-brand" href="${urlFor(locale)}">
          <span class="brand-mark" aria-hidden="true"></span>
          <span>${escapeHtml(site.siteName)}</span>
        </a>
        <p>${escapeHtml(localeSite(locale).description)}</p>
      </div>
      <div>
        <h2>${escapeHtml(ui(locale, "tools"))}</h2>
        <a href="${urlFor(locale, "tools/seo")}">${escapeHtml(ui(locale, "seo"))}</a>
        <a href="${urlFor(locale, "tools/html")}">${escapeHtml(ui(locale, "html"))}</a>
        <a href="${urlFor(locale, "tools/css")}">${escapeHtml(ui(locale, "css"))}</a>
        <a href="${urlFor(locale, "tools/assets")}">${escapeHtml(ui(locale, "assets"))}</a>
        <a href="${urlFor(locale, "tools/github-pages")}">${escapeHtml(ui(locale, "githubPages"))}</a>
      </div>
      <div>
        <h2>${escapeHtml(ui(locale, "site"))}</h2>
        <a href="${urlFor(locale, "about")}">${escapeHtml(ui(locale, "about"))}</a>
        <a href="${urlFor(locale, "privacy")}">${escapeHtml(ui(locale, "privacy"))}</a>
        <a href="${urlFor(locale, "terms")}">${escapeHtml(ui(locale, "terms"))}</a>
        <a href="${urlFor(locale, "contact")}">${escapeHtml(ui(locale, "contact"))}</a>
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
  const keywords = (tool.keywords || []).join(" ");
  return `<article class="tool-card" data-tool-name="${attr(tool.name)}" data-category="${attr(tool.category)}" data-category-label="${attr(titleCase(tool.category))}" data-keywords="${attr(keywords)}">
  <div>
    <p class="card-kicker">${escapeHtml(titleCase(tool.category))}</p>
    <h2><a href="${urlFor(locale, `tools/${tool.id}`)}">${escapeHtml(tool.name)}</a></h2>
    <p>${escapeHtml(tool.summary)}</p>
  </div>
  <a class="card-link" href="${urlFor(locale, `tools/${tool.id}`)}">${escapeHtml(ui(locale, "openTool"))}</a>
</article>`;
}

function collectionCard(collectionId, details, locale) {
  const toolCount = (details.tools || []).length;
  return `<article class="collection-card">
  <div>
    <p class="card-kicker">${escapeHtml(ui(locale, "collections"))}</p>
    <h2><a href="${urlFor(locale, `collections/${collectionId}`)}">${escapeHtml(details.name)}</a></h2>
    <p>${escapeHtml(details.description)}</p>
    <small>${toolCount} tools</small>
  </div>
  <a class="card-link" href="${urlFor(locale, `collections/${collectionId}`)}">${escapeHtml(ui(locale, "openCollection"))}</a>
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

function comparisonMarkup(locale, comparison) {
  if (!comparison) return "";
  const headerCells = comparison.columns.map((col) => `<th>${escapeHtml(col)}</th>`).join("");
  const bodyRows = comparison.rows.map((row) => {
    const cells = row.map((cell) => `<td>${escapeHtml(cell)}</td>`).join("");
    return `<tr>${cells}</tr>`;
  }).join("");
  return `<section class="section comparison-band">
  <div class="wrap content-layout">
    <div class="section-heading">
      <p class="eyebrow">${escapeHtml(ui(locale, "comparison"))}</p>
      <h2>${escapeHtml(comparison.title)}</h2>
    </div>
    <div>
      <table class="comparison-table">
        <thead><tr>${headerCells}</tr></thead>
        <tbody>${bodyRows}</tbody>
      </table>
      ${comparison.summary ? `<p class="comparison-summary">${escapeHtml(comparison.summary)}</p>` : ""}
    </div>
  </div>
</section>`;
}

function examplesMarkup(locale, items = []) {
  const exampleLabel = ui(locale, "example");
  return items.map((item) => `<article class="example-item">
  <p class="eyebrow">${escapeHtml(exampleLabel)}</p>
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

function localizeCategories(sourceCategories, locale) {
  if (locale === site.defaultLocale) return sourceCategories;
  const overrides = localePack(locale).categories || {};
  return Object.fromEntries(Object.entries(sourceCategories).map(([key, details]) => [
    key,
    {
      ...details,
      ...(overrides[key] || {})
    }
  ]));
}

function localizeTools(sourceTools, locale) {
  if (locale === site.defaultLocale) return sourceTools;
  const pack = localePack(locale);
  const overrides = pack.tools || {};
  return sourceTools.map((tool) => {
    const override = overrides[tool.id] || {};
    const name = override.name || tool.name;
    const summary = override.summary || tool.summary;
    return {
      ...tool,
      ...override,
      name,
      summary,
      description: override.description || summary,
      whatIs: override.whatIs || tool.whatIs,
      howToUse: override.howToUse || tool.howToUse,
      useCases: override.useCases || tool.useCases,
      examples: override.examples || tool.examples,
      mistakes: override.mistakes || tool.mistakes,
      faq: override.faq || tool.faq,
      quickAnswer: override.quickAnswer || tool.quickAnswer,
      limitations: override.limitations || tool.limitations,
      verificationSteps: override.verificationSteps || tool.verificationSteps
    };
  });
}

function localizeCollections(sourceCollections, locale) {
  if (locale === site.defaultLocale) return sourceCollections;
  const overrides = localePack(locale).collections || {};
  return Object.fromEntries(Object.entries(sourceCollections).map(([key, details]) => [
    key,
    {
      ...details,
      ...(overrides[key] || {})
    }
  ]));
}

function homePage(locale, tools, categories, collections) {
  const localizedSite = localeSite(locale);
  const scripts = [
    jsonLd({
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: site.siteName,
      url: absoluteUrl(locale),
      description: localizedSite.description,
      inLanguage: locale
    }),
    jsonLd({
      "@context": "https://schema.org",
      "@type": "Organization",
      name: site.siteName,
      url: absoluteUrl(site.defaultLocale),
      description: localizedSite.description
    }),
    jsonLd(itemListSchema(locale, "jquery.app tools", tools.slice(0, 6)))
  ].join("");
  const body = `${hero({
    eyebrow: ui(locale, "forLastMile"),
    title: localizedSite.tagline,
    description: localizedSite.description,
    actions: `<div class="hero-actions"><a class="button primary" href="${urlFor(locale, "tools")}">${escapeHtml(ui(locale, "browseTools"))}</a><a class="button secondary" href="${urlFor(locale, "tools/github-pages")}">${escapeHtml(ui(locale, "githubPagesTools"))}</a></div>`
  })}
<section class="section intro-band">
  <div class="wrap split-section">
    <div class="section-heading">
      <p class="eyebrow">${escapeHtml(ui(locale, "startHere"))}</p>
      <h2>${escapeHtml(ui(locale, "homeIntroTitle"))}</h2>
    </div>
    <p>${escapeHtml(ui(locale, "homeIntroText"))}</p>
  </div>
  <div class="wrap category-grid offset-grid">
    ${Object.entries(categories).map(([key, details]) => categoryPill(key, details, locale)).join("")}
  </div>
</section>
<section class="section dark-band">
  <div class="wrap dark-grid">
    <div>
      <p class="eyebrow on-dark">${escapeHtml(ui(locale, "whyExists"))}</p>
      <h2>${escapeHtml(ui(locale, "homeWhyTitle"))}</h2>
      <p>${escapeHtml(ui(locale, "homeWhyText"))}</p>
    </div>
    <div class="dark-list">
      ${ui(locale, "homeProof").map((item) => `<span>${escapeHtml(item)}</span>`).join("")}
    </div>
  </div>
</section>
<section class="section soft-band">
  <div class="wrap section-heading">
    <p class="eyebrow">${escapeHtml(ui(locale, "firstRelease"))}</p>
    <h2>${escapeHtml(ui(locale, "homeToolsTitle"))}</h2>
    <p>${escapeHtml(ui(locale, "homeToolsText"))}</p>
  </div>
  <div class="wrap tool-grid">
    ${tools.slice(0, 6).map((tool) => toolCard(tool, locale)).join("")}
  </div>
</section>
${collections ? `<section class="section">
  <div class="wrap section-heading">
    <p class="eyebrow">${escapeHtml(ui(locale, "collections"))}</p>
    <h2>${escapeHtml(ui(locale, "browseCollections"))}</h2>
  </div>
  <div class="wrap collection-grid">
    ${Object.entries(collections).map(([id, details]) => collectionCard(id, details, locale)).join("")}
  </div>
</section>` : ""}`;

  return pageShell({
    locale,
    title: localizedSite.seoTitle,
    description: localizedSite.seoDescription,
    pathname: "",
    body,
    scripts,
    current: "home",
    image: `${site.baseUrl}/assets/social/og-home.png`,
    navTools: buildNavTools(tools)
  });
}

function toolsIndexPage(locale, tools, categories) {
  const scripts = [
    jsonLd(breadcrumbSchema(locale, [
      { name: ui(locale, "home"), pathname: "" },
      { name: ui(locale, "tools"), pathname: "tools" }
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
    <p class="eyebrow">${escapeHtml(ui(locale, "tools"))}</p>
    <h1>${escapeHtml(ui(locale, "toolsPageTitle"))}</h1>
    <p class="lede">${escapeHtml(ui(locale, "toolsPageDescription"))}</p>
  </div>
</section>
<section class="section">
  <div class="wrap">
    ${grouped}
  </div>
</section>`;

  return pageShell({
    locale,
    title: ui(locale, "freeWebToolsTitle"),
    description: ui(locale, "freeWebToolsDescription"),
    pathname: "tools",
    body,
    scripts: scripts + `<script src="/assets/tool-directory-filter.js" defer></script>`,
    image: `${site.baseUrl}/assets/social/og-tools.png`,
    current: "tools",
    navTools: buildNavTools(tools)
  });
}

function categoryPage(locale, category, details, tools, allTools) {
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
      { name: ui(locale, "home"), pathname: "" },
      { name: ui(locale, "tools"), pathname: "tools" },
      { name: details.name, pathname: `tools/${category}` }
    ])),
    jsonLd(itemListSchema(locale, details.name, tools)),
    faqSchema ? jsonLd(faqSchema) : ""
  ].filter(Boolean).join("");
  const body = `<section class="page-hero">
  <div class="wrap narrow">
    <p class="eyebrow">${escapeHtml(ui(locale, "tools"))}</p>
    <h1>${escapeHtml(details.name)}</h1>
    <p class="lede">${escapeHtml(details.description)}</p>
  </div>
</section>
<section class="section soft-band">
  <div class="wrap section-heading">
    <p class="eyebrow">${escapeHtml(ui(locale, "availableTools"))}</p>
    <h2>${escapeHtml(template(locale, "toolsYouCanUse", { category: details.name }))}</h2>
  </div>
  <div class="wrap tool-grid">
    ${tools.map((tool) => toolCard(tool, locale)).join("")}
  </div>
</section>
<section class="section article-band">
  <div class="wrap content-layout">
    <aside class="content-rail">
      <span>${escapeHtml(details.name)}</span>
      <span>${escapeHtml(ui(locale, "browserOnly"))}</span>
      <span>${escapeHtml(ui(locale, "noAccountRequired"))}</span>
    </aside>
    <article class="tool-article">
      <h2>${escapeHtml(ui(locale, "whatCollectionHelps"))}</h2>
      <p>${escapeHtml(details.intro || details.description)}</p>
      ${details.bestFor?.length ? `<h2>${escapeHtml(ui(locale, "bestFor"))}</h2><ul>${listItems(details.bestFor)}</ul>` : ""}
      ${details.useCases?.length ? `<h2>${escapeHtml(ui(locale, "commonUseCases"))}</h2><ul>${listItems(details.useCases)}</ul>` : ""}
      ${details.taskGuide ? `<h2>${escapeHtml(ui(locale, "taskGuide"))}</h2><p>${escapeHtml(details.taskGuide)}</p>` : ""}
      ${details.checklist?.length ? `<h2>${escapeHtml(ui(locale, "publishingChecklist"))}</h2><ul>${listItems(details.checklist)}</ul>` : ""}
    </article>
  </div>
</section>
${details.faq?.length ? `<section class="section faq-band">
  <div class="wrap content-layout">
    <div class="section-heading">
      <p class="eyebrow">${escapeHtml(ui(locale, "faq"))}</p>
      <h2>${escapeHtml(template(locale, "questionsAbout", { topic: details.name.toLowerCase() }))}</h2>
    </div>
    <div class="faq-list">
      ${faqMarkup(details.faq)}
    </div>
  </div>
</section>` : ""}`;

  return pageShell({
    locale,
    title: `Free ${details.name} - ${site.siteName}`,
    description: locale === site.defaultLocale ? freeBrowserDescription(details.description) : details.description,
    pathname: `tools/${category}`,
    body,
    scripts,
    current: category,
    image: `${site.baseUrl}/assets/social/og-${category}.png`,
    navTools: buildNavTools(allTools || tools)
  });
}

function collectionPage(locale, collectionId, details, tools, categories, collections, allTools) {
  const faqSchema = details.faq?.length ? {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: details.faq.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer }
    }))
  } : null;
  const scripts = [
    jsonLd(breadcrumbSchema(locale, [
      { name: ui(locale, "home"), pathname: "" },
      { name: ui(locale, "collections"), pathname: "collections" },
      { name: details.name, pathname: `collections/${collectionId}` }
    ])),
    jsonLd(itemListSchema(locale, details.name, tools)),
    faqSchema ? jsonLd(faqSchema) : ""
  ].filter(Boolean).join("");
  const body = `<section class="page-hero">
  <div class="wrap narrow">
    <p class="eyebrow">${escapeHtml(ui(locale, "collections"))}</p>
    <h1>${escapeHtml(details.name)}</h1>
    <p class="lede">${escapeHtml(details.description)}</p>
  </div>
</section>
<section class="section soft-band">
  <div class="wrap section-heading">
    <p class="eyebrow">${escapeHtml(ui(locale, "availableTools"))}</p>
    <h2>${escapeHtml(template(locale, "toolsYouCanUse", { category: details.name }))}</h2>
  </div>
  <div class="wrap tool-grid">
    ${tools.map((tool) => toolCard(tool, locale)).join("")}
  </div>
</section>
<section class="section article-band">
  <div class="wrap content-layout">
    <aside class="content-rail">
      <span>${escapeHtml(details.name)}</span>
      <span>${escapeHtml(ui(locale, "collections"))}</span>
    </aside>
    <article class="tool-article">
      <h2>${escapeHtml(ui(locale, "whatCollectionHelps"))}</h2>
      <p>${escapeHtml(details.intro || details.description)}</p>
      ${details.bestFor?.length ? `<h2>${escapeHtml(ui(locale, "bestFor"))}</h2><ul>${listItems(details.bestFor)}</ul>` : ""}
      ${details.workflowSteps?.length ? `<h2>${escapeHtml(ui(locale, "workflowSteps"))}</h2><ol>${details.workflowSteps.map(step => `<li><strong>${escapeHtml(step.name)}</strong>: ${escapeHtml(step.description)}</li>`).join("")}</ol>` : ""}
      ${details.prerequisites?.length ? `<h2>${escapeHtml(ui(locale, "prerequisites"))}</h2><ul>${listItems(details.prerequisites)}</ul>` : ""}
      ${details.checklist?.length ? `<h2>${escapeHtml(ui(locale, "publishingChecklist"))}</h2><ul>${listItems(details.checklist)}</ul>` : ""}
      ${details.relatedCollections?.length ? `<h2>${escapeHtml(ui(locale, "relatedCollections"))}</h2><p>${details.relatedCollections.map(id => `<a href="${urlFor(locale, `collections/${id}`)}">${escapeHtml(collections?.[id]?.name || id)}</a>`).join(", ")}</p>` : ""}
    </article>
  </div>
</section>
${details.faq?.length ? `<section class="section faq-band">
  <div class="wrap content-layout">
    <div class="section-heading">
      <p class="eyebrow">${escapeHtml(ui(locale, "faq"))}</p>
      <h2>${escapeHtml(template(locale, "questionsAbout", { topic: details.name.toLowerCase() }))}</h2>
    </div>
    <div class="faq-list">
      ${faqMarkup(details.faq)}
    </div>
  </div>
</section>` : ""}`;

  return pageShell({
    locale,
    title: `Free ${details.name} - ${site.siteName}`,
    description: details.description,
    pathname: `collections/${collectionId}`,
    body,
    scripts,
    current: "collections",
    image: `${site.baseUrl}/assets/social/og-${collectionId}.png`,
    navTools: buildNavTools(allTools || tools)
  });
}

function toolPage(locale, tool, allTools, categories) {
  const related = allTools.filter((item) => item.category === tool.category && item.id !== tool.id).slice(0, 3);
  const complementary = ["seo", "html", "css", "assets", "github-pages"];
  const complementaryCategories = {
    seo: ["html", "github-pages"],
    html: ["seo", "css"],
    css: ["html", "assets"],
    assets: ["css", "html"],
    "github-pages": ["seo", "assets"]
  };
  const crossCategory = (complementaryCategories[tool.category] || [])
    .flatMap((cat) => allTools.filter((item) => item.category === cat && item.id !== tool.id))
    .filter((item, index, arr) => arr.findIndex((t) => t.id === item.id) === index)
    .slice(0, 3);
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
      { name: ui(locale, "home"), pathname: "" },
      { name: ui(locale, "tools"), pathname: "tools" },
      { name: categoryName, pathname: `tools/${tool.category}` },
      { name: tool.name, pathname: `tools/${tool.id}` }
    ])),
    faqSchema ? jsonLd(faqSchema) : "",
    `<script type="module" src="/assets/tool-core.js"></script>`
  ].filter(Boolean).join("");

  const body = `<section class="tool-hero">
  <div class="wrap tool-hero-grid">
    <div>
      <p class="eyebrow">${escapeHtml(categoryName)}</p>
      <h1>${escapeHtml(tool.name)}</h1>
      <p class="lede">${escapeHtml(tool.description)}</p>
    </div>
    <aside class="tool-side-note">
      <p class="eyebrow">${escapeHtml(ui(locale, "quickReference"))}</p>
      <div class="tool-meta-list">
        <span><strong>${escapeHtml(ui(locale, "category"))}:</strong> ${escapeHtml(categoryName)}</span>
        ${tool.limitations?.[0] ? `<span><strong>${escapeHtml(ui(locale, "note"))}:</strong> ${escapeHtml(tool.limitations[0])}</span>` : ""}
        <span><strong>${escapeHtml(ui(locale, "output"))}:</strong> ${escapeHtml(tool.summary)}</span>
      </div>
      ${related.length ? `<div class="tool-side-links">
        <strong>${escapeHtml(ui(locale, "alsoTry"))}</strong>
        ${related.slice(0, 3).map((r) => `<a href="${urlFor(locale, `tools/${r.id}`)}">${escapeHtml(r.name)}</a>`).join("")}
      </div>` : ""}
      <a class="button primary" href="#tool">${escapeHtml(ui(locale, "useTool"))}</a>
      <small class="side-privacy">${escapeHtml(ui(locale, "privateByDefault"))}</small>
    </aside>
  </div>
</section>
<section class="section tool-workspace-section" id="tool">
  <div class="wrap">
    <div class="tool-workspace" data-tool-id="${attr(tool.id)}" data-tool-name="${attr(tool.name)}" data-output-label="${attr(uiText(locale, "output", "Output"))}" data-copy-label="${attr(uiText(locale, "copy", "Copy"))}" data-copied-label="${attr(uiText(locale, "copied", "Copied"))}">
      <div class="tool-loading">${escapeHtml(ui(locale, "loadingTool"))}</div>
    </div>
  </div>
</section>
<section class="section article-band">
  <div class="wrap content-layout">
    <aside class="content-rail">
      <span class="rail-link">${escapeHtml(categoryName)}</span>
      ${related.length ? related.slice(0, 4).map((r) => `<a href="${urlFor(locale, `tools/${r.id}`)}">${escapeHtml(r.name)}</a>`).join("") : ""}
      <a href="${urlFor(locale, `tools/${tool.category}`)}">${escapeHtml(uiText(locale, "more", "More"))} ${escapeHtml(categoryName)}</a>
    </aside>
    <article class="tool-article">
      <h2>${escapeHtml(template(locale, "whatIs", { name: tool.name }))}</h2>
      <p>${escapeHtml(tool.whatIs || tool.description)}</p>
      ${tool.quickAnswer ? `<div class="quick-answer"><h3>${escapeHtml(ui(locale, "quickAnswer"))}</h3><p>${escapeHtml(tool.quickAnswer)}</p></div>` : ""}
      ${tool.limitations?.length ? `<h3>${escapeHtml(ui(locale, "limitations"))}</h3><ul>${listItems(tool.limitations)}</ul>` : ""}
      <h2>${escapeHtml(ui(locale, "howToUse"))}</h2>
      <ol>${listItems(tool.howToUse || [])}</ol>
      <h2>${escapeHtml(ui(locale, "whatUseFor"))}</h2>
      <ul>${listItems(tool.useCases)}</ul>
    </article>
  </div>
</section>
${tool.examples?.length ? `<section class="section soft-band">
  <div class="wrap section-heading">
    <p class="eyebrow">${escapeHtml(ui(locale, "useCases"))}</p>
    <h2>${escapeHtml(ui(locale, "examples"))}</h2>
  </div>
  <div class="wrap example-grid">
    ${examplesMarkup(locale, tool.examples)}
  </div>
</section>` : ""}
<section class="section">
  <div class="wrap content-layout">
    <aside class="content-rail">
      <span>${escapeHtml(ui(locale, "beforePublishing"))}</span>
      <span>${escapeHtml(ui(locale, "checkOutput"))}</span>
    </aside>
    <article class="tool-article">
      <h2>${escapeHtml(ui(locale, "commonMistakes"))}</h2>
      <ul>${listItems(tool.mistakes)}</ul>
      ${tool.verificationSteps?.length ? `<h2>${escapeHtml(ui(locale, "verification"))}</h2><ol>${listItems(tool.verificationSteps)}</ol>` : ""}
    </article>
  </div>
</section>
${comparisonMarkup(locale, tool.comparison)}
${tool.faq?.length ? `<section class="section faq-band">
  <div class="wrap content-layout">
    <div class="section-heading">
      <p class="eyebrow">${escapeHtml(ui(locale, "faq"))}</p>
      <h2>${escapeHtml(template(locale, "questionsAbout", { topic: tool.name }))}</h2>
    </div>
    <div class="faq-list">
      ${faqMarkup(tool.faq)}
    </div>
  </div>
</section>` : ""}
${related.length ? `<section class="section">
  <div class="wrap section-heading">
    <p class="eyebrow">${escapeHtml(ui(locale, "relatedTools"))}</p>
    <h2>${escapeHtml(template(locale, "moreCategory", { category: categoryName.toLowerCase() }))}</h2>
  </div>
  <div class="wrap tool-grid compact">
    ${related.map((item) => toolCard(item, locale)).join("")}
  </div>
</section>` : ""}
${crossCategory.length ? `<section class="section">
  <div class="wrap section-heading">
    <p class="eyebrow">${escapeHtml(ui(locale, "alsoTry"))}</p>
    <h2>${escapeHtml(ui(locale, "alsoTry"))}</h2>
  </div>
  <div class="wrap tool-grid compact">
    ${crossCategory.map((item) => toolCard(item, locale)).join("")}
  </div>
</section>` : ""}`;

  return pageShell({
    locale,
    title: `${tool.name} - ${site.siteName}`,
    description: locale === site.defaultLocale ? freeBrowserDescription(tool.summary) : tool.summary,
    pathname: `tools/${tool.id}`,
    body,
    scripts,
    image: `${site.baseUrl}/assets/social/og-${tool.category}.png`,
    current: tool.category,
    navTools: buildNavTools(allTools)
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

function simplePages(locale) {
  const en = {
    about: {
      title: "About jquery.app",
      description: "A small workshop for the details that sit between building a page and publishing it well.",
      content: `<h2>Why this site exists</h2><p>jquery.app is a collection of small tools for people who build, publish, and maintain websites. It is made for the quiet tasks that still matter: writing canonical tags, preparing social preview metadata, checking launch details, shaping responsive CSS, and keeping static pages tidy.</p><p>The site is intentionally simple. Most tools run entirely in your browser, ask for only the fields they need, and return output you can read before you copy it. There are no accounts, no project dashboards, and no need to upload your work to use the current tools.</p><h2>What belongs here</h2><p>jquery.app focuses on practical web publishing chores with a clear result. A good tool on this site should save a few minutes, reduce a small mistake, or make a repeated job easier to finish. It should also be understandable without a manual.</p><h2>What does not belong here</h2><p>This is not a replacement for professional judgment, browser testing, search console data, or a full technical audit. Generated code and checklists should be reviewed before they are added to a production site.</p>`
    },
    privacy: {
      title: "Privacy Policy",
      description: "The current tools are designed to work locally in your browser and avoid unnecessary collection.",
      content: `<h2>Local tool inputs</h2><p>The current tools process the values you enter in your browser. They do not require an account, and the site does not intentionally send tool inputs or generated output to a jquery.app application server.</p><h2>Hosting and technical logs</h2><p>jquery.app is published as a static website. Hosting providers, CDN services, browsers, and security systems may process standard request information such as IP address, user agent, referrer, requested URL, timestamps, and basic diagnostic data.</p><h2>Cookies and analytics</h2><p>jquery.app uses Google Analytics 4 (GA4) to measure page views and basic site usage patterns. GA4 may set first-party cookies for session tracking. The site does not track tool inputs, generated outputs, copied content, or any information you type into the tools. If advertising, embedded media, or additional third-party widgets are added in the future, this policy will be updated before those services are enabled.</p><h2>External links</h2><p>Some pages may link to GitHub, documentation sites, browser tools, or other third-party resources. Those sites have their own privacy practices.</p>`
    },
    terms: {
      title: "Terms of Use",
      description: "Use the tools freely, but review the output before it becomes part of a live site.",
      content: `<h2>Use of the tools</h2><p>jquery.app provides free web utilities for convenience, learning, and everyday publishing work. You may use the generated output in personal, commercial, and client projects, subject to your own review and the requirements of your project.</p><h2>No professional advice</h2><p>The tools and written guidance are informational. They are not legal, security, compliance, accessibility, or search engine optimization advice.</p><h2>No warranty</h2><p>The site is provided as is and as available. jquery.app does not guarantee that a tool will be error-free, uninterrupted, or suitable for every use case.</p><h2>Your responsibility</h2><p>You are responsible for testing generated HTML, CSS, metadata, DNS notes, and checklists before using them on a live website.</p>`
    },
    contact: {
      title: "Contact",
      description: "Report broken tools, outdated guidance, accessibility issues, or privacy concerns.",
      content: `<h2>Send a useful report</h2><p>If something is broken, include the tool name, the page URL, what you entered, what you expected, and what happened instead. Clear reports make small tools easier to keep accurate.</p><h2>Report an issue</h2><p>Please report bugs, outdated guidance, or accessibility problems at <a href="https://github.com/jqueryscript/jqueryapp/issues">github.com/jqueryscript/jqueryapp/issues</a>. Every report helps keep the tools accurate and trustworthy.</p><h2>What to report</h2><ul><li>Broken form behavior or copy buttons.</li><li>Outdated guidance about GitHub Pages, SEO tags, browser support, or HTML output.</li><li>Accessibility problems, keyboard traps, visual contrast issues, or mobile layout problems.</li><li>Privacy concerns or third-party service questions.</li></ul>`
    }
  };

  const localized = {
    de: {
      about: { title: "Über jquery.app", description: "Ein kleiner Arbeitsbereich für die Details zwischen Aufbau und Veröffentlichung.", content: `<h2>Warum diese Seite existiert</h2><p>jquery.app sammelt kleine Webtools für wiederkehrende Aufgaben vor der Veröffentlichung: Canonical-Tags, Social-Preview-Metadaten, CSS-Werte, GitHub-Pages-Details und Launch-Checks.</p><h2>Wie die Tools arbeiten</h2><p>Die aktuellen Tools laufen im Browser, fragen nur die nötigen Werte ab und liefern eine Ausgabe, die du vor dem Kopieren lesen kannst.</p><h2>Grenzen</h2><p>Die Tools ersetzen keine professionelle Prüfung, kein Browser-Testing, keine Search-Console-Daten und kein vollständiges technisches Audit.</p>` },
      privacy: { title: "Datenschutz", description: "Die aktuellen Tools arbeiten lokal im Browser und vermeiden unnötige Datenerfassung.", content: `<h2>Tool-Eingaben</h2><p>Die aktuellen Tools verarbeiten Eingaben im Browser. Es ist kein Konto erforderlich, und Eingaben werden nicht absichtlich an einen jquery.app-Anwendungsserver gesendet.</p><h2>Hosting-Protokolle</h2><p>Hosting-, CDN- und Sicherheitsdienste können übliche technische Informationen wie IP-Adresse, Browserdaten, Referrer, URL und Zeitpunkt verarbeiten.</p><h2>Cookies und Analyse</h2><p>Die Tools benötigen keine Cookies. Wenn später Analyse, Werbung oder eingebettete Dienste hinzukommen, sollte diese Richtlinie vorher aktualisiert werden.</p>` },
      terms: { title: "Nutzungsbedingungen", description: "Nutze die Tools frei, aber prüfe die Ausgabe vor dem Einsatz auf einer Live-Seite.", content: `<h2>Nutzung</h2><p>jquery.app stellt kostenlose Webtools für Publishing- und Entwicklungsaufgaben bereit. Du kannst die Ausgabe in eigenen, kommerziellen und Kundenprojekten nutzen, wenn du sie selbst prüfst.</p><h2>Keine Fachberatung</h2><p>Die Inhalte sind informativ und keine Rechts-, Sicherheits-, Compliance-, Barrierefreiheits- oder SEO-Beratung.</p><h2>Keine Gewährleistung</h2><p>Die Seite wird ohne Garantie bereitgestellt. Browser, Suchmaschinen und Hosting-Regeln können sich ändern.</p>` },
      contact: { title: "Kontakt", description: "Melde defekte Tools, veraltete Hinweise, Barrierefreiheitsprobleme oder Datenschutzfragen.", content: `<h2>Hilfreiche Meldungen</h2><p>Nenne bei Fehlern den Toolnamen, die URL, deine Eingabe, das erwartete Ergebnis und das tatsächliche Verhalten.</p><h2>Geeignete Themen</h2><ul><li>Defekte Formulare oder Kopierbuttons.</li><li>Veraltete Hinweise zu GitHub Pages, SEO-Tags oder Browsern.</li><li>Probleme mit Tastatur, Kontrast, Layout oder Mobilansicht.</li><li>Datenschutz- oder Drittanbieterfragen.</li></ul>` }
    },
    fr: {
      about: { title: "À propos de jquery.app", description: "Un petit atelier pour les détails entre création et publication.", content: `<h2>Pourquoi ce site existe</h2><p>jquery.app regroupe de petits outils web pour les tâches qui reviennent avant publication : canonical, aperçus sociaux, valeurs CSS, details GitHub Pages et contrôles de lancement.</p><h2>Fonctionnement</h2><p>Les outils actuels fonctionnent dans le navigateur, demandent seulement les champs utiles et affichent une sortie lisible avant copie.</p><h2>Limites</h2><p>Ils ne remplacent pas un jugement professionnel, des tests navigateur, les donnees Search Console ou un audit technique complet.</p>` },
      privacy: { title: "Politique de confidentialite", description: "Les outils actuels fonctionnent localement dans le navigateur et limitent la collecte.", content: `<h2>Saisies dans les outils</h2><p>Les outils actuels traitent les valeurs dans votre navigateur. Aucun compte n'est requis et les donnees ne sont pas volontairement envoyees a un serveur applicatif jquery.app.</p><h2>Logs techniques</h2><p>L'hebergement, le CDN et les systemes de securite peuvent traiter des informations techniques standard comme IP, navigateur, referrer, URL et horodatage.</p><h2>Cookies et analytics</h2><p>Les outils n'ont pas besoin de cookies. Si analytics, publicite ou widgets tiers sont ajoutes plus tard, cette page devra etre mise a jour.</p>` },
      terms: { title: "Conditions d'utilisation", description: "Utilisez les outils librement, mais verifiez la sortie avant publication.", content: `<h2>Utilisation</h2><p>jquery.app fournit des outils web gratuits pour les taches de publication. Vous pouvez utiliser la sortie dans des projets personnels, commerciaux ou clients apres verification.</p><h2>Pas de conseil professionnel</h2><p>Les contenus sont informatifs et ne constituent pas un conseil juridique, securite, conformite, accessibilite ou SEO.</p><h2>Pas de garantie</h2><p>Le site est fourni tel quel. Les navigateurs, moteurs de recherche et regles d'hebergement peuvent changer.</p>` },
      contact: { title: "Contact", description: "Signalez un outil casse, une information obsolete, un probleme d'accessibilite ou une question de confidentialite.", content: `<h2>Envoyer un signalement utile</h2><p>Indiquez le nom de l'outil, l'URL, votre saisie, le resultat attendu et le resultat observe.</p><h2>Sujets utiles</h2><ul><li>Formulaire ou bouton de copie casse.</li><li>Information obsolete sur GitHub Pages, SEO ou navigateurs.</li><li>Problemes de contraste, clavier, mobile ou mise en page.</li><li>Questions de confidentialite ou de service tiers.</li></ul>` }
    },
    es: {
      about: { title: "Acerca de jquery.app", description: "Un pequeno taller para los detalles entre crear una pagina y publicarla bien.", content: `<h2>Por que existe este sitio</h2><p>jquery.app reune herramientas web pequenas para tareas que aparecen antes de publicar: canonical, previews sociales, valores CSS, detalles de GitHub Pages y revisiones de lanzamiento.</p><h2>Como funcionan</h2><p>Las herramientas actuales funcionan en el navegador, piden solo los campos necesarios y muestran una salida legible antes de copiarla.</p><h2>Limites</h2><p>No sustituyen criterio profesional, pruebas en navegador, datos de Search Console ni una auditoria tecnica completa.</p>` },
      privacy: { title: "Politica de privacidad", description: "Las herramientas actuales trabajan localmente en el navegador y evitan recopilacion innecesaria.", content: `<h2>Datos introducidos</h2><p>Las herramientas actuales procesan los valores en tu navegador. No requieren cuenta y no envian intencionalmente la entrada a un servidor de aplicacion de jquery.app.</p><h2>Registros tecnicos</h2><p>Hosting, CDN y sistemas de seguridad pueden procesar informacion tecnica normal como IP, navegador, referrer, URL y hora.</p><h2>Cookies y analitica</h2><p>Las herramientas no necesitan cookies. Si mas adelante se anaden analitica, anuncios o widgets de terceros, esta politica debe actualizarse antes.</p>` },
      terms: { title: "Terminos de uso", description: "Usa las herramientas libremente, pero revisa la salida antes de publicarla.", content: `<h2>Uso</h2><p>jquery.app ofrece herramientas web gratuitas para tareas de publicacion. Puedes usar la salida en proyectos personales, comerciales o de clientes despues de revisarla.</p><h2>Sin asesoramiento profesional</h2><p>El contenido es informativo y no es asesoramiento legal, de seguridad, cumplimiento, accesibilidad ni SEO.</p><h2>Sin garantia</h2><p>El sitio se ofrece tal cual. Navegadores, buscadores y reglas de hosting pueden cambiar.</p>` },
      contact: { title: "Contacto", description: "Informa de herramientas rotas, guias desactualizadas, problemas de accesibilidad o privacidad.", content: `<h2>Enviar un informe util</h2><p>Incluye nombre de la herramienta, URL, entrada usada, resultado esperado y resultado obtenido.</p><h2>Que informar</h2><ul><li>Formularios o botones de copiar rotos.</li><li>Guia desactualizada sobre GitHub Pages, SEO o navegadores.</li><li>Problemas de teclado, contraste, movil o layout.</li><li>Preguntas de privacidad o servicios externos.</li></ul>` }
    },
    ja: {
      about: { title: "jquery.appについて", description: "ページ制作と公開の間にある細かな作業を助ける小さな作業場です。", content: `<h2>このサイトの目的</h2><p>jquery.appは、公開前によく発生する小さなWeb作業を助けるツール集です。canonical、SNSプレビュー、CSS値、GitHub Pages設定、公開前チェックなどを扱います。</p><h2>ツールの動作</h2><p>現在のツールはブラウザで動作し、必要な項目だけを入力して、確認しやすい出力を返します。</p><h2>注意点</h2><p>専門的な判断、ブラウザテスト、Search Consoleデータ、完全な技術監査の代わりではありません。</p>` },
      privacy: { title: "プライバシーポリシー", description: "現在のツールはブラウザ内で動作し、不要な収集を避ける設計です。", content: `<h2>ツールへの入力</h2><p>現在のツールは入力値をブラウザ内で処理します。アカウントは不要で、入力内容をjquery.appのアプリケーションサーバーへ意図的に送信しません。</p><h2>技術ログ</h2><p>ホスティング、CDN、セキュリティサービスは、IPアドレス、ブラウザ情報、参照元、URL、時刻などの標準的な情報を処理する場合があります。</p><h2>Cookieと解析</h2><p>ツールの動作にCookieは不要です。将来、解析、広告、第三者ウィジェットを追加する場合は、このページを先に更新する必要があります。</p>` },
      terms: { title: "利用規約", description: "ツールは自由に使えますが、公開前に出力を確認してください。", content: `<h2>利用</h2><p>jquery.appは公開作業向けの無料Webツールを提供します。出力は確認したうえで、個人、商用、クライアント案件に利用できます。</p><h2>専門的助言ではありません</h2><p>掲載内容は情報提供であり、法律、セキュリティ、コンプライアンス、アクセシビリティ、SEOの専門的助言ではありません。</p><h2>保証なし</h2><p>サイトは現状有姿で提供されます。ブラウザ、検索エンジン、ホスティングの仕様は変わる可能性があります。</p>` },
      contact: { title: "お問い合わせ", description: "壊れたツール、古い情報、アクセシビリティ、プライバシーの問題を報告できます。", content: `<h2>役立つ報告</h2><p>問題がある場合は、ツール名、ページURL、入力内容、期待した結果、実際の結果を含めてください。</p><h2>報告できる内容</h2><ul><li>フォームやコピー操作の不具合。</li><li>GitHub Pages、SEOタグ、ブラウザ対応に関する古い情報。</li><li>キーボード操作、コントラスト、モバイル表示、レイアウトの問題。</li><li>プライバシーや第三者サービスに関する懸念。</li></ul>` }
    },
    nl: {
      about: { title: "Over jquery.app", description: "Een kleine werkplaats voor de details tussen bouwen en netjes publiceren.", content: `<h2>Waarom deze site bestaat</h2><p>jquery.app verzamelt kleine webtools voor terugkerende taken voor publicatie: canonicals, social previews, CSS-waarden, GitHub Pages details en launchchecks.</p><h2>Hoe de tools werken</h2><p>De huidige tools draaien in de browser, vragen alleen noodzakelijke velden en tonen leesbare uitvoer voordat je kopieert.</p><h2>Grenzen</h2><p>Ze vervangen geen professioneel oordeel, browsertests, Search Console data of volledige technische audit.</p>` },
      privacy: { title: "Privacybeleid", description: "De huidige tools werken lokaal in je browser en vermijden onnodige verzameling.", content: `<h2>Invoer in tools</h2><p>De huidige tools verwerken waarden in je browser. Er is geen account nodig en invoer wordt niet bewust naar een jquery.app applicatieserver gestuurd.</p><h2>Technische logs</h2><p>Hosting, CDN en beveiligingssystemen kunnen standaard technische informatie verwerken, zoals IP-adres, browser, referrer, URL en tijdstip.</p><h2>Cookies en analytics</h2><p>De tools hebben geen cookies nodig. Als later analytics, advertenties of widgets worden toegevoegd, moet dit beleid eerst worden bijgewerkt.</p>` },
      terms: { title: "Gebruiksvoorwaarden", description: "Gebruik de tools vrij, maar controleer uitvoer voordat die live gaat.", content: `<h2>Gebruik</h2><p>jquery.app biedt gratis webtools voor publicatiewerk. Je mag de uitvoer gebruiken in persoonlijke, commerciele en klantprojecten na eigen controle.</p><h2>Geen professioneel advies</h2><p>De inhoud is informatief en geen juridisch, beveiligings-, compliance-, toegankelijkheids- of SEO-advies.</p><h2>Geen garantie</h2><p>De site wordt geleverd zoals hij is. Browsers, zoekmachines en hostingregels kunnen veranderen.</p>` },
      contact: { title: "Contact", description: "Meld kapotte tools, verouderde informatie, toegankelijkheidsproblemen of privacyvragen.", content: `<h2>Stuur een nuttige melding</h2><p>Noem de toolnaam, pagina-URL, invoer, verwachte uitkomst en wat er gebeurde.</p><h2>Wat je kunt melden</h2><ul><li>Kapotte formulieren of kopieerknoppen.</li><li>Verouderde informatie over GitHub Pages, SEO-tags of browsers.</li><li>Problemen met toetsenbord, contrast, mobiel of layout.</li><li>Privacyvragen of vragen over externe diensten.</li></ul>` }
    }
  };

  return localized[locale] || en;
}

function notFoundPage(locale) {
  const body = `<section class="page-hero">
  <div class="wrap narrow">
    <p class="eyebrow">404</p>
    <h1>${escapeHtml(ui(locale, "notFoundTitle"))}</h1>
    <p class="lede">${escapeHtml(ui(locale, "notFoundText"))}</p>
    <div class="hero-actions">
      <a class="button primary" href="${urlFor(locale)}">${escapeHtml(ui(locale, "goHome"))}</a>
      <a class="button secondary" href="${urlFor(locale, "tools")}">${escapeHtml(ui(locale, "browseTools"))}</a>
    </div>
  </div>
</section>`;

  return pageShell({
    locale,
    title: `${ui(locale, "notFoundTitle")} - ${site.siteName}`,
    description: "The requested page could not be found.",
    pathname: "404",
    body,
    extraHead: '<meta name="robots" content="noindex">',
    skipAlternates: true
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
    <h1>${escapeHtml(ui(locale, "redirectTitle"))}</h1>
    <p class="lede">${escapeHtml(template(locale, "redirectText", { target }))}</p>
    <div class="hero-actions">
      <a class="button primary" href="${target}">${escapeHtml(ui(locale, "continue"))}</a>
    </div>
  </div>
</section>`,
    extraHead: `<meta http-equiv="refresh" content="0; url=${attr(target)}">
  <meta name="robots" content="noindex">`,
    skipAlternates: true
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

> You might not need AI for every web task. jquery.app provides small browser tools that solve everyday HTML, CSS, SEO, mobile UI and publishing tasks with deterministic output — no uploads, accounts, or AI token costs.

${site.description}

## Core Workflows

- [GitHub Pages publishing workflow](${absoluteUrl(site.defaultLocale, "collections/github-pages-workflow")}): CNAME, DNS, sitemap, robots.txt, 404, canonical checks — the full static publishing checklist.
- [Blog publisher toolkit](${absoluteUrl(site.defaultLocale, "collections/blog-publisher")}): Front matter, URL slugs, reading time, RSS/JSON feeds, social previews.
- [Multilingual site setup](${absoluteUrl(site.defaultLocale, "collections/multilingual-site")}): Hreflang tags, canonical URLs, sitemap planning for translated pages.
- [Beginner CSS tools](${absoluteUrl(site.defaultLocale, "collections/beginner-css")}): Clamp calculator, safe area insets, flexbox generator, border radius builder, and more.

## Tool Categories

${categoryLines}

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
  await copyFile(path.join(assetsDir, "tool-core.js"), path.join(target, "tool-core.js"));
  await copyFile(path.join(assetsDir, "tool-directory-filter.js"), path.join(target, "tool-directory-filter.js"));
  // Copy per-tool modules
  const toolsSrcDir = path.join(assetsDir, "tools");
  const toolsDstDir = path.join(target, "tools");
  await mkdir(toolsDstDir, { recursive: true });
  const toolFiles = await readdir(toolsSrcDir);
  for (const f of toolFiles) {
    if (f.endsWith(".js")) {
      await copyFile(path.join(toolsSrcDir, f), path.join(toolsDstDir, f));
    }
  }
  await copyFile(path.join(assetsDir, "favicon.svg"), path.join(distDir, "favicon.svg"));
  // GSC verification file
  await copyFile(path.join(root, "src", "google9d00cdf8df0ddc4e.html"), path.join(distDir, "google9d00cdf8df0ddc4e.html"));
}

async function buildLocale(locale) {
  const sourceTools = JSON.parse(await readFile(path.join(dataDir, "tools.en.json"), "utf8"));
  const sourceCategories = JSON.parse(await readFile(path.join(dataDir, "categories.en.json"), "utf8"));
  const sourceCollections = JSON.parse(await readFile(path.join(dataDir, "collections.en.json"), "utf8"));
  const tools = localizeTools(sourceTools, locale);
  const categories = localizeCategories(sourceCategories, locale);
  const collections = localizeCollections(sourceCollections, locale);
  const localeDir = locale === site.defaultLocale ? distDir : path.join(distDir, locale);
  const sitemapUrls = [];

  const addSitemapUrl = (pathname = "") => {
    sitemapUrls.push(absoluteUrl(locale, pathname));
  };

  await writePage(path.join(localeDir, "index.html"), homePage(locale, tools, categories, collections));
  addSitemapUrl("");
  await writePage(path.join(localeDir, "tools", "index.html"), toolsIndexPage(locale, tools, categories));
  addSitemapUrl("tools");

  for (const [category, details] of Object.entries(categories)) {
    const categoryTools = tools.filter((tool) => tool.category === category);
    if (categoryTools.length) {
      await writePage(path.join(localeDir, "tools", category, "index.html"), categoryPage(locale, category, details, categoryTools, tools));
      addSitemapUrl(`tools/${category}`);
    }
  }

  for (const tool of tools) {
    await writePage(path.join(localeDir, "tools", tool.id, "index.html"), toolPage(locale, tool, tools, categories));
    addSitemapUrl(`tools/${tool.id}`);
  }

  for (const [collectionId, details] of Object.entries(collections)) {
    const collectionTools = tools.filter((tool) => details.tools?.includes(tool.id));
    if (collectionTools.length) {
      await writePage(path.join(localeDir, "collections", collectionId, "index.html"), collectionPage(locale, collectionId, details, collectionTools, categories, collections, tools));
      addSitemapUrl(`collections/${collectionId}`);
    }
  }

  const pages = simplePages(locale);
  await writePage(path.join(localeDir, "about", "index.html"), simplePage(locale, "about", pages.about.title, pages.about.description, pages.about.content));
  addSitemapUrl("about");
  await writePage(path.join(localeDir, "privacy", "index.html"), simplePage(locale, "privacy", pages.privacy.title, pages.privacy.description, pages.privacy.content));
  addSitemapUrl("privacy");
  await writePage(path.join(localeDir, "terms", "index.html"), simplePage(locale, "terms", pages.terms.title, pages.terms.description, pages.terms.content));
  addSitemapUrl("terms");
  await writePage(path.join(localeDir, "contact", "index.html"), simplePage(locale, "contact", pages.contact.title, pages.contact.description, pages.contact.content));
  addSitemapUrl("contact");

  if (locale === site.defaultLocale) {
    await writePage(path.join(distDir, "404.html"), notFoundPage(locale));
    await writeLegacyDefaultLocaleRedirects(locale, tools, categories, collections);
  }

  return sitemapUrls;
}

async function writeLegacyDefaultLocaleRedirects(locale, tools, categories, collections) {
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
    ...tools.map((tool) => `tools/${tool.id}`),
    ...Object.keys(collections).map((id) => `collections/${id}`)
  ];

  for (const pathname of paths) {
    const targetParts = pathname ? pathname.split("/") : [];
    await writePage(
      path.join(legacyDir, ...targetParts, "index.html"),
      redirectPage({ locale, fromPathname: path.posix.join(locale, pathname), toPathname: pathname })
    );
  }
}

// --- Minification (zero-dependency, Node.js built-ins only) ---

function minifyCSS(content) {
  return content
    .replace(/\/\*[\s\S]*?\*\//g, "")           // remove block comments
    .replace(/\s+/g, " ")                        // collapse whitespace
    .replace(/\s*([{}:;,>+~])\s*/g, "$1")       // remove space around operators
    .replace(/;\s*}/g, "}")                      // remove trailing semicolons before }
    .replace(/}\s*/g, "}")                       // collapse whitespace after }
    .trim();
}

function minifyJS(content) {
  let out = "";
  let i = 0;
  while (i < content.length) {
    // String literals: pass through unchanged
    if (content[i] === '"' || content[i] === "'" || content[i] === "`") {
      const quote = content[i];
      out += quote;
      i++;
      while (i < content.length && content[i] !== quote) {
        if (content[i] === "\\") { out += content[i] + content[i + 1]; i += 2; }
        else { out += content[i]; i++; }
      }
      if (i < content.length) { out += content[i]; i++; }
      continue;
    }
    // Line comments
    if (content[i] === "/" && content[i + 1] === "/") {
      while (i < content.length && content[i] !== "\n") i++;
      out += " ";
      continue;
    }
    // Block comments
    if (content[i] === "/" && content[i + 1] === "*") {
      i += 2;
      while (i < content.length && !(content[i] === "*" && content[i + 1] === "/")) i++;
      if (i < content.length) i += 2;
      out += " ";
      continue;
    }
    // Regex literal (after =, (, [, !, etc. — simple heuristic)
    if (content[i] === "/" && i > 0 && /[=(\[!?:,;&|^~<>]/.test(content[i - 1] || " ")) {
      out += "/";
      i++;
      while (i < content.length && content[i] !== "/") {
        if (content[i] === "\\") { out += content[i] + content[i + 1]; i += 2; }
        else { out += content[i]; i++; }
      }
      if (i < content.length) { out += "/"; i++; }
      // skip regex flags
      while (i < content.length && /[gimsuy]/.test(content[i])) { out += content[i]; i++; }
      continue;
    }
    out += content[i];
    i++;
  }
  return out
    .replace(/\n\s+/g, "\n")          // trim leading whitespace per line
    .replace(/[ \t]+/g, " ")          // collapse horizontal whitespace
    .replace(/\n{2,}/g, "\n")         // collapse blank lines
    .replace(/^\s+|\s+$/gm, "")       // trim each line
    .replace(/\n/g, "")               // join lines
    .trim();
}

function minifyHTML(content) {
  // Protect inline scripts, styles, pre, and textarea
  const blocks = [];
  const safe = content
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, (m) => { blocks.push(m); return `___BLOCK_${blocks.length - 1}___`; })
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, (m) => { blocks.push(m); return `___BLOCK_${blocks.length - 1}___`; })
    .replace(/<pre\b[^>]*>[\s\S]*?<\/pre>/gi, (m) => { blocks.push(m); return `___BLOCK_${blocks.length - 1}___`; })
    .replace(/<textarea\b[^>]*>[\s\S]*?<\/textarea>/gi, (m) => { blocks.push(m); return `___BLOCK_${blocks.length - 1}___`; });

  let out = safe
    .replace(/<!--[\s\S]*?-->/g, "")   // remove HTML comments
    .replace(/\s+/g, " ")              // collapse whitespace
    .replace(/>\s+</g, "><")           // remove whitespace between tags
    .trim();

  // Restore protected blocks
  blocks.forEach((block, idx) => {
    out = out.replace(`___BLOCK_${idx}___`, block);
  });

  return out;
}

async function minifyDir(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      await minifyDir(full);
    } else if (entry.name.endsWith(".html")) {
      const raw = await readFile(full, "utf8");
      await writeFile(full, minifyHTML(raw), "utf8");
    } else if (entry.name.endsWith(".css")) {
      const raw = await readFile(full, "utf8");
      await writeFile(full, minifyCSS(raw), "utf8");
    } else if (entry.name.endsWith(".js") && !entry.name.includes(".min.")) {
      const raw = await readFile(full, "utf8");
      await writeFile(full, minifyJS(raw), "utf8");
    }
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

  await minifyDir(distDir);
}

await build();
console.log(`Built ${site.siteName} into ${distDir}`);
