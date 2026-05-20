const htmlEscape = (value = "") =>
  String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");

const attrEscape = (value = "") => htmlEscape(value).replaceAll("'", "&#39;");

const normalizeUrl = (value) => {
  const trimmed = String(value || "").trim();
  if (!trimmed) return "";
  try {
    return new URL(trimmed).toString();
  } catch {
    return trimmed;
  }
};

const field = ({ id, label, value = "", type = "text", help = "", full = false, attrs = "" }) => `
  <div class="field ${full ? "full" : ""}">
    <label for="${id}">${label}</label>
    <input id="${id}" type="${type}" value="${attrEscape(value)}" ${attrs}>
    ${help ? `<small>${help}</small>` : ""}
  </div>`;

const textarea = ({ id, label, value = "", help = "", full = true }) => `
  <div class="field ${full ? "full" : ""}">
    <label for="${id}">${label}</label>
    <textarea id="${id}">${htmlEscape(value)}</textarea>
    ${help ? `<small>${help}</small>` : ""}
  </div>`;

const select = ({ id, label, options, value = "", full = false }) => `
  <div class="field ${full ? "full" : ""}">
    <label for="${id}">${label}</label>
    <select id="${id}">
      ${options.map((item) => `<option value="${attrEscape(item.value)}" ${item.value === value ? "selected" : ""}>${htmlEscape(item.label)}</option>`).join("")}
    </select>
  </div>`;

const checkbox = ({ id, label, checked = false }) => `
  <label class="check-row">
    <input id="${id}" type="checkbox" ${checked ? "checked" : ""}>
    <span>${label}</span>
  </label>`;

function mountTool(root, config) {
  const outputLabel = root.dataset.outputLabel || "Output";
  const copyLabel = root.dataset.copyLabel || "Copy";
  const copiedLabel = root.dataset.copiedLabel || "Copied";
  root.innerHTML = `
    <div class="tool-layout">
      <form class="tool-panel" data-role="form">
        ${config.form}
      </form>
      <div class="result-box">
        <div class="result-header">
          <h2>${htmlEscape(outputLabel)}</h2>
          <button class="copy-button" type="button" data-role="copy">${htmlEscape(copyLabel)}</button>
        </div>
        <pre class="output" data-role="output"></pre>
        <div data-role="preview"></div>
      </div>
    </div>`;

  const form = root.querySelector("[data-role='form']");
  const output = root.querySelector("[data-role='output']");
  const preview = root.querySelector("[data-role='preview']");
  const copy = root.querySelector("[data-role='copy']");

  const update = () => {
    const result = config.generate(root);
    output.textContent = result.output;
    preview.innerHTML = result.preview || "";
  };

  form.addEventListener("input", update);
  form.addEventListener("change", update);
  copy.addEventListener("click", async () => {
    await navigator.clipboard.writeText(output.textContent);
    copy.textContent = copiedLabel;
    setTimeout(() => {
      copy.textContent = copyLabel;
    }, 1200);
  });

  update();
}

function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : { r: 0, g: 0, b: 0 };
}

function relativeLuminance({ r, g, b }) {
  const [rs, gs, bs] = [r, g, b].map((c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

function contrastRatio(hex1, hex2) {
  const lum1 = relativeLuminance(hexToRgb(hex1));
  const lum2 = relativeLuminance(hexToRgb(hex2));
  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);
  return (lighter + 0.05) / (darker + 0.05);
}

const tools = {
  "hreflang-tag-generator": {
    form: `
      <div class="field-grid">
        ${textarea({
          id: "pairs",
          label: "Language URL pairs",
          value: "en|https://example.com/en/page/\nes|https://example.com/es/page/\nzh|https://example.com/zh/page/",
          help: "Use one pair per line: language-code|absolute-url"
        })}
        ${field({ id: "xdefault", label: "x-default URL", value: "https://example.com/", full: true })}
      </div>`,
    generate(root) {
      const lines = root.querySelector("#pairs").value.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
      const tags = lines.map((line) => {
        const [lang, ...urlParts] = line.split("|");
        const url = normalizeUrl(urlParts.join("|"));
        return lang && url ? `<link rel="alternate" hreflang="${attrEscape(lang.trim())}" href="${attrEscape(url)}">` : "";
      }).filter(Boolean);
      const xdefault = normalizeUrl(root.querySelector("#xdefault").value);
      if (xdefault) tags.push(`<link rel="alternate" hreflang="x-default" href="${attrEscape(xdefault)}">`);
      return { output: tags.join("\n") };
    }
  },

  "og-twitter-card-builder": {
    form: `
      <div class="field-grid">
        ${field({ id: "title", label: "Title", value: "Small web tools for quick fixes" })}
        ${field({ id: "site", label: "Site name", value: "jquery.app" })}
        ${textarea({ id: "description", label: "Description", value: "Browser-based tools for people who build, publish, and maintain websites.", full: true })}
        ${field({ id: "url", label: "Page URL", value: "https://www.jquery.app/tools/" })}
        ${field({ id: "image", label: "Image URL", value: "https://www.jquery.app/assets/social-preview.png" })}
        ${select({ id: "type", label: "Open Graph type", value: "website", options: [{ label: "website", value: "website" }, { label: "article", value: "article" }] })}
      </div>`,
    generate(root) {
      const title = root.querySelector("#title").value.trim();
      const description = root.querySelector("#description").value.trim();
      const url = normalizeUrl(root.querySelector("#url").value);
      const image = normalizeUrl(root.querySelector("#image").value);
      const site = root.querySelector("#site").value.trim();
      const type = root.querySelector("#type").value;
      const output = [
        `<meta property="og:type" content="${attrEscape(type)}">`,
        `<meta property="og:site_name" content="${attrEscape(site)}">`,
        `<meta property="og:title" content="${attrEscape(title)}">`,
        `<meta property="og:description" content="${attrEscape(description)}">`,
        `<meta property="og:url" content="${attrEscape(url)}">`,
        `<meta property="og:image" content="${attrEscape(image)}">`,
        `<meta name="twitter:card" content="summary_large_image">`,
        `<meta name="twitter:title" content="${attrEscape(title)}">`,
        `<meta name="twitter:description" content="${attrEscape(description)}">`,
        `<meta name="twitter:image" content="${attrEscape(image)}">`
      ].join("\n");
      const preview = `<div class="preview-card"><span>${htmlEscape(site || url)}</span><strong>${htmlEscape(title)}</strong><p>${htmlEscape(description)}</p></div>`;
      return { output, preview };
    }
  },

  "github-pages-cname-helper": {
    form: `
      <div class="field-grid">
        ${field({ id: "domain", label: "Custom domain", value: "www.example.com", full: true, help: "Use only the domain name. Do not include https:// or a path." })}
        ${select({
          id: "setup",
          label: "Domain setup",
          value: "www",
          options: [
            { label: "www subdomain", value: "www" },
            { label: "apex/root domain", value: "apex" }
          ]
        })}
      </div>`,
    generate(root) {
      const domain = root.querySelector("#domain").value.replace(/^https?:\/\//, "").replace(/\/.*$/, "").trim();
      const setup = root.querySelector("#setup").value;
      const dns = setup === "www"
        ? `DNS note:\nCreate a CNAME record for www that points to your GitHub Pages host, usually USERNAME.github.io.`
        : `DNS note:\nCreate A records for the apex domain that point to GitHub Pages IP addresses. Add a www CNAME if you also want www.example.com.`;
      return {
        output: `CNAME file content:\n${domain}\n\n${dns}\n\nAfter DNS is ready, enable Enforce HTTPS in the GitHub Pages settings.`
      };
    }
  },

  "static-site-seo-checklist-generator": {
    form: `
      <div class="field-grid">
        ${select({
          id: "siteType",
          label: "Site type",
          value: "static",
          options: [
            { label: "Static website", value: "static" },
            { label: "Blog", value: "blog" },
            { label: "Tool site", value: "tool" },
            { label: "Documentation", value: "docs" }
          ]
        })}
        ${field({ id: "domain", label: "Domain", value: "https://example.com" })}
      </div>
      <div class="check-grid">
        ${checkbox({ id: "multi", label: "Multilingual pages" })}
        ${checkbox({ id: "github", label: "Hosted on GitHub Pages", checked: true })}
        ${checkbox({ id: "blog", label: "Has blog posts" })}
        ${checkbox({ id: "schemas", label: "Uses structured data", checked: true })}
      </div>`,
    generate(root) {
      const siteType = root.querySelector("#siteType").value;
      const domain = normalizeUrl(root.querySelector("#domain").value);
      const items = [
        `SEO launch checklist for ${domain || "your site"}`,
        "",
        "- Each indexable page has one unique title tag.",
        "- Each indexable page has one useful meta description.",
        "- Each page has one canonical URL.",
        "- Important pages are linked from navigation, category pages, or related sections.",
        "- A sitemap.xml file exists and uses final public URLs.",
        "- robots.txt does not block important pages.",
        "- Open Graph tags exist for pages that may be shared.",
        "- Images have width, height, loading, and useful alt text where needed.",
        "- 404.html exists for static hosting.",
        "- Internal links use final URLs, not local file paths."
      ];
      if (siteType === "tool") items.push("- Tool pages explain input, output, common uses, and related tools.");
      if (root.querySelector("#multi").checked) items.push("- Each language page has hreflang alternates and a matching canonical tag.");
      if (root.querySelector("#github").checked) items.push("- The CNAME file is present if a custom GitHub Pages domain is used.");
      if (root.querySelector("#blog").checked) items.push("- Blog posts link to relevant tools and category pages.");
      if (root.querySelector("#schemas").checked) items.push("- Breadcrumb, FAQ, or WebApplication schema is valid where it is useful.");
      return { output: items.join("\n") };
    }
  },

  "robots-meta-tag-generator": {
    form: `
      <div class="check-grid">
        ${checkbox({ id: "noindex", label: "noindex" })}
        ${checkbox({ id: "nofollow", label: "nofollow" })}
        ${checkbox({ id: "noarchive", label: "noarchive" })}
        ${checkbox({ id: "nosnippet", label: "nosnippet" })}
        ${checkbox({ id: "noimageindex", label: "noimageindex" })}
      </div>
      <div class="field-grid">
        ${select({
          id: "imagePreview",
          label: "Image preview",
          value: "large",
          options: [
            { label: "large", value: "large" },
            { label: "standard", value: "standard" },
            { label: "none", value: "none" }
          ]
        })}
        ${field({ id: "maxSnippet", label: "Max snippet characters", value: "-1", type: "number" })}
      </div>`,
    generate(root) {
      const directives = [];
      directives.push(root.querySelector("#noindex").checked ? "noindex" : "index");
      directives.push(root.querySelector("#nofollow").checked ? "nofollow" : "follow");
      ["noarchive", "nosnippet", "noimageindex"].forEach((id) => {
        if (root.querySelector(`#${id}`).checked) directives.push(id);
      });
      directives.push(`max-image-preview:${root.querySelector("#imagePreview").value}`);
      const snippet = root.querySelector("#maxSnippet").value.trim();
      if (snippet) directives.push(`max-snippet:${snippet}`);
      return { output: `<meta name="robots" content="${attrEscape(directives.join(", "))}">` };
    }
  },

  "canonical-url-tag-generator": {
    form: `
      <div class="field-grid">
        ${field({ id: "canonical", label: "Canonical URL", value: "https://example.com/page/", full: true })}
        ${checkbox({ id: "trimIndex", label: "Remove index.html", checked: true })}
      </div>`,
    generate(root) {
      let url = normalizeUrl(root.querySelector("#canonical").value);
      if (root.querySelector("#trimIndex").checked) url = url.replace(/index\.html?$/i, "");
      return { output: `<link rel="canonical" href="${attrEscape(url)}">` };
    }
  },

  "html-link-rel-generator": {
    form: `
      <div class="field-grid">
        ${select({
          id: "rel",
          label: "rel",
          value: "preload",
          options: [
            { label: "preload", value: "preload" },
            { label: "modulepreload", value: "modulepreload" },
            { label: "preconnect", value: "preconnect" },
            { label: "dns-prefetch", value: "dns-prefetch" },
            { label: "prefetch", value: "prefetch" },
            { label: "canonical", value: "canonical" },
            { label: "alternate", value: "alternate" }
          ]
        })}
        ${field({ id: "href", label: "href", value: "/assets/site.css" })}
        ${select({
          id: "as",
          label: "as",
          value: "style",
          options: [
            { label: "none", value: "" },
            { label: "style", value: "style" },
            { label: "script", value: "script" },
            { label: "font", value: "font" },
            { label: "image", value: "image" },
            { label: "fetch", value: "fetch" }
          ]
        })}
        ${field({ id: "type", label: "type", value: "text/css" })}
        ${checkbox({ id: "crossorigin", label: "crossorigin" })}
      </div>`,
    generate(root) {
      const attrs = [
        `rel="${attrEscape(root.querySelector("#rel").value)}"`,
        `href="${attrEscape(root.querySelector("#href").value.trim())}"`
      ];
      const as = root.querySelector("#as").value;
      const type = root.querySelector("#type").value.trim();
      if (as) attrs.push(`as="${attrEscape(as)}"`);
      if (type) attrs.push(`type="${attrEscape(type)}"`);
      if (root.querySelector("#crossorigin").checked) attrs.push("crossorigin");
      return { output: `<link ${attrs.join(" ")}>` };
    }
  },

  "favicon-html-tag-generator": {
    form: `
      <div class="field-grid">
        ${field({ id: "base", label: "Icon base path", value: "/icons" })}
        ${field({ id: "name", label: "App name", value: "jquery.app" })}
        ${field({ id: "theme", label: "Theme color", value: "#0f766e" })}
        ${field({ id: "bg", label: "Background color", value: "#ffffff" })}
      </div>`,
    generate(root) {
      const base = root.querySelector("#base").value.replace(/\/$/, "");
      const name = root.querySelector("#name").value.trim();
      const theme = root.querySelector("#theme").value.trim();
      const bg = root.querySelector("#bg").value.trim();
      const output = [
        `<link rel="icon" href="${attrEscape(base)}/favicon.ico" sizes="any">`,
        `<link rel="icon" href="${attrEscape(base)}/icon.svg" type="image/svg+xml">`,
        `<link rel="apple-touch-icon" href="${attrEscape(base)}/apple-touch-icon.png">`,
        `<link rel="manifest" href="${attrEscape(base)}/site.webmanifest">`,
        `<meta name="theme-color" content="${attrEscape(theme)}">`,
        "",
        "site.webmanifest:",
        JSON.stringify({
          name,
          short_name: name,
          icons: [
            { src: `${base}/icon-192.png`, sizes: "192x192", type: "image/png" },
            { src: `${base}/icon-512.png`, sizes: "512x512", type: "image/png" }
          ],
          theme_color: theme,
          background_color: bg,
          display: "standalone"
        }, null, 2)
      ].join("\n");
      return { output };
    }
  },

  "css-clamp-calculator": {
    form: `
      <div class="field-grid">
        ${field({ id: "minSize", label: "Minimum size px", value: "18", type: "number" })}
        ${field({ id: "maxSize", label: "Maximum size px", value: "48", type: "number" })}
        ${field({ id: "minViewport", label: "Minimum viewport px", value: "360", type: "number" })}
        ${field({ id: "maxViewport", label: "Maximum viewport px", value: "1200", type: "number" })}
        ${select({
          id: "property",
          label: "CSS property",
          value: "font-size",
          options: [
            { label: "font-size", value: "font-size" },
            { label: "margin-top", value: "margin-top" },
            { label: "padding", value: "padding" },
            { label: "gap", value: "gap" }
          ]
        })}
      </div>`,
    generate(root) {
      const minSize = Number(root.querySelector("#minSize").value);
      const maxSize = Number(root.querySelector("#maxSize").value);
      const minViewport = Number(root.querySelector("#minViewport").value);
      const maxViewport = Number(root.querySelector("#maxViewport").value);
      const property = root.querySelector("#property").value;
      const slope = (maxSize - minSize) / (maxViewport - minViewport);
      const preferred = `${(minSize - slope * minViewport).toFixed(4)}px + ${(slope * 100).toFixed(4)}vw`;
      const clamp = `clamp(${minSize}px, ${preferred}, ${maxSize}px)`;
      return { output: `${property}: ${clamp};\n\n/* ${minSize}px at ${minViewport}px viewport, ${maxSize}px at ${maxViewport}px viewport */` };
    }
  },

  "css-safe-area-insets-generator": {
    form: `
      <div class="field-grid">
        ${select({
          id: "property",
          label: "CSS property",
          value: "padding",
          options: [
            { label: "padding", value: "padding" },
            { label: "margin", value: "margin" },
            { label: "inset", value: "inset" }
          ]
        })}
        ${field({ id: "fallback", label: "Fallback px", value: "16", type: "number" })}
        ${field({ id: "selector", label: "Selector", value: ".mobile-safe-area", full: true })}
      </div>`,
    generate(root) {
      const property = root.querySelector("#property").value;
      const fallback = Number(root.querySelector("#fallback").value);
      const selector = root.querySelector("#selector").value.trim() || ".mobile-safe-area";
      const lines = [
        `<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">`,
        "",
        `${selector} {`,
        `  --safe-top: max(${fallback}px, env(safe-area-inset-top));`,
        `  --safe-right: max(${fallback}px, env(safe-area-inset-right));`,
        `  --safe-bottom: max(${fallback}px, env(safe-area-inset-bottom));`,
        `  --safe-left: max(${fallback}px, env(safe-area-inset-left));`,
        `  ${property}: var(--safe-top) var(--safe-right) var(--safe-bottom) var(--safe-left);`,
        `}`
      ];
      return { output: lines.join("\n") };
    }
  },

  "llms-txt-generator": {
    form: `
      <div class="field-grid">
        ${field({ id: "siteName", label: "Site name", value: "Example Tools" })}
        ${field({ id: "siteUrl", label: "Site URL", value: "https://example.com", full: true })}
        ${textarea({ id: "siteDescription", label: "Site description", value: "A collection of practical tools and guides for publishing static websites.", full: true })}
        ${textarea({
          id: "importantPages",
          label: "Important pages",
          value: "Home|https://example.com/|Main entry point for the site\nTools|https://example.com/tools/|All available tools\nPrivacy Policy|https://example.com/privacy/|Privacy and data handling notes",
          help: "Use one page per line: title|absolute-url|description"
        })}
        ${textarea({ id: "notes", label: "Notes for AI systems", value: "Prefer canonical URLs on https://example.com/.\nDo not treat staging or redirected URLs as canonical.", full: true })}
        ${field({ id: "sitemap", label: "Sitemap URL", value: "https://example.com/sitemap.xml", full: true })}
      </div>`,
    generate(root) {
      const siteName = root.querySelector("#siteName").value.trim() || "Website";
      const siteUrl = normalizeUrl(root.querySelector("#siteUrl").value);
      const description = root.querySelector("#siteDescription").value.trim();
      const pages = root.querySelector("#importantPages").value.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
      const notes = root.querySelector("#notes").value.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
      const sitemap = normalizeUrl(root.querySelector("#sitemap").value);
      const pageLines = pages.map((line) => {
        const [title, url, ...desc] = line.split("|").map((part) => part.trim());
        return title && url ? `- [${title}](${normalizeUrl(url)}): ${desc.join("|") || "Important page"}` : "";
      }).filter(Boolean);
      const noteLines = notes.map((note) => `- ${note}`);
      const output = [
        `# ${siteName}`,
        "",
        description,
        "",
        siteUrl ? `Canonical site URL: ${siteUrl}` : "",
        "",
        "## Important Pages",
        "",
        pageLines.join("\n") || "- Add important canonical pages here.",
        "",
        "## Notes for AI Systems",
        "",
        noteLines.join("\n") || "- Prefer canonical public URLs.",
        "",
        "## Sitemap",
        "",
        sitemap || "https://example.com/sitemap.xml"
      ].filter((line, index, arr) => line !== "" || arr[index - 1] !== "").join("\n");
      return { output };
    }
  },

  "robots-txt-builder": {
    form: `
      <div class="field-grid">
        ${field({ id: "siteUrl", label: "Site URL", value: "https://example.com", full: true })}
        ${field({ id: "sitemap", label: "Sitemap URL", value: "https://example.com/sitemap.xml", full: true })}
        ${select({
          id: "crawlMode",
          label: "Default crawler access",
          value: "allow",
          options: [
            { label: "Allow all public pages", value: "allow" },
            { label: "Block all crawling", value: "block" }
          ]
        })}
        ${textarea({ id: "disallow", label: "Disallowed paths", value: "/tmp/\n/search/\n?preview=", help: "One path or pattern per line. Leave blank when everything public can be crawled." })}
        ${checkbox({ id: "aiNote", label: "Add AI crawler policy comment", checked: true })}
      </div>`,
    generate(root) {
      const siteUrl = normalizeUrl(root.querySelector("#siteUrl").value).replace(/\/$/, "");
      const sitemap = normalizeUrl(root.querySelector("#sitemap").value);
      const blockAll = root.querySelector("#crawlMode").value === "block";
      const disallow = root.querySelector("#disallow").value.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
      const lines = ["User-agent: *"];
      if (blockAll) {
        lines.push("Disallow: /");
      } else {
        lines.push("Allow: /");
        disallow.forEach((path) => lines.push(`Disallow: ${path}`));
      }
      if (root.querySelector("#aiNote").checked) {
        lines.push("", "# AI crawler policy: public pages are available unless a path is disallowed above.");
      }
      lines.push("", `Sitemap: ${sitemap || `${siteUrl}/sitemap.xml`}`);
      return { output: lines.join("\n") };
    }
  },

  "json-ld-starter-builder": {
    form: `
      <div class="field-grid">
        ${select({
          id: "schemaType",
          label: "Schema type",
          value: "WebSite",
          options: [
            { label: "WebSite", value: "WebSite" },
            { label: "Organization", value: "Organization" },
            { label: "Article", value: "Article" },
            { label: "FAQPage", value: "FAQPage" },
            { label: "BreadcrumbList", value: "BreadcrumbList" }
          ]
        })}
        ${field({ id: "name", label: "Name or title", value: "Example Tools" })}
        ${field({ id: "url", label: "URL", value: "https://example.com/", full: true })}
        ${textarea({ id: "description", label: "Description", value: "Practical tools for publishing static websites.", full: true })}
        ${textarea({ id: "items", label: "FAQ or breadcrumb lines", value: "What is this site?|A small collection of useful web tools.\nTools|https://example.com/tools/", help: "FAQ: question|answer. Breadcrumb: name|url." })}
      </div>`,
    generate(root) {
      const type = root.querySelector("#schemaType").value;
      const name = root.querySelector("#name").value.trim();
      const url = normalizeUrl(root.querySelector("#url").value);
      const description = root.querySelector("#description").value.trim();
      const rows = root.querySelector("#items").value.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
      let schema;
      if (type === "FAQPage") {
        schema = {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: rows.map((line) => {
            const [question, ...answer] = line.split("|");
            return {
              "@type": "Question",
              name: (question || "").trim(),
              acceptedAnswer: {
                "@type": "Answer",
                text: answer.join("|").trim()
              }
            };
          }).filter((item) => item.name && item.acceptedAnswer.text)
        };
      } else if (type === "BreadcrumbList") {
        schema = {
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: rows.map((line, index) => {
            const [itemName, itemUrl] = line.split("|").map((part) => part.trim());
            return {
              "@type": "ListItem",
              position: index + 1,
              name: itemName,
              item: normalizeUrl(itemUrl)
            };
          }).filter((item) => item.name && item.item)
        };
      } else {
        schema = {
          "@context": "https://schema.org",
          "@type": type,
          name,
          url,
          description
        };
        if (type === "Article") schema.headline = name;
      }
      return { output: `<script type="application/ld+json">\n${JSON.stringify(schema, null, 2)}\n</script>` };
    }
  },

  "responsive-image-markup-generator": {
    form: `
      <div class="field-grid">
        ${field({ id: "src", label: "Default image URL", value: "/assets/example-960.webp", full: true })}
        ${field({ id: "alt", label: "Alt text", value: "Screenshot of the example tool", full: true })}
        ${field({ id: "width", label: "Width", value: "960", type: "number" })}
        ${field({ id: "height", label: "Height", value: "540", type: "number" })}
        ${textarea({ id: "srcset", label: "srcset candidates", value: "/assets/example-640.webp 640w\n/assets/example-960.webp 960w\n/assets/example-1280.webp 1280w" })}
        ${field({ id: "sizes", label: "sizes", value: "(max-width: 760px) 100vw, 760px", full: true })}
        ${checkbox({ id: "picture", label: "Generate picture element with WebP source" })}
        ${checkbox({ id: "lazy", label: "Lazy load image", checked: true })}
      </div>`,
    generate(root) {
      const src = root.querySelector("#src").value.trim();
      const alt = root.querySelector("#alt").value.trim();
      const width = root.querySelector("#width").value.trim();
      const height = root.querySelector("#height").value.trim();
      const srcset = root.querySelector("#srcset").value.split(/\r?\n/).map((line) => line.trim()).filter(Boolean).join(",\n    ");
      const sizes = root.querySelector("#sizes").value.trim();
      const lazy = root.querySelector("#lazy").checked;
      const attrs = [
        `src="${attrEscape(src)}"`,
        srcset ? `srcset="${attrEscape(srcset.replace(/\n\s*/g, " "))}"` : "",
        sizes ? `sizes="${attrEscape(sizes)}"` : "",
        `width="${attrEscape(width)}"`,
        `height="${attrEscape(height)}"`,
        `alt="${attrEscape(alt)}"`,
        lazy ? `loading="lazy"` : `loading="eager"`,
        `decoding="async"`
      ].filter(Boolean).join("\n  ");
      const img = `<img\n  ${attrs}\n>`;
      if (!root.querySelector("#picture").checked) return { output: img };
      return {
        output: `<picture>\n  <source type="image/webp" srcset="${attrEscape(srcset.replace(/\n\s*/g, " "))}" sizes="${attrEscape(sizes)}">\n  ${img.replace(/\n/g, "\n  ")}\n</picture>`
      };
    }
  },

  "responsive-iframe-embed-generator": {
    form: `
      <div class="field-grid">
        ${field({ id: "src", label: "Iframe URL", value: "https://www.youtube.com/embed/dQw4w9WgXcQ", full: true })}
        ${field({ id: "title", label: "Iframe title", value: "Video tutorial", full: true })}
        ${select({
          id: "ratio",
          label: "Aspect ratio",
          value: "16 / 9",
          options: [
            { label: "16:9", value: "16 / 9" },
            { label: "4:3", value: "4 / 3" },
            { label: "1:1", value: "1 / 1" },
            { label: "21:9", value: "21 / 9" }
          ]
        })}
        ${field({ id: "className", label: "Wrapper class", value: "embed-frame" })}
        ${checkbox({ id: "lazy", label: "Lazy load iframe", checked: true })}
        ${checkbox({ id: "sandbox", label: "Add common sandbox permissions" })}
      </div>`,
    generate(root) {
      const src = root.querySelector("#src").value.trim();
      const title = root.querySelector("#title").value.trim();
      const ratio = root.querySelector("#ratio").value;
      const className = root.querySelector("#className").value.trim() || "embed-frame";
      const lazy = root.querySelector("#lazy").checked;
      const sandbox = root.querySelector("#sandbox").checked;
      const iframeAttrs = [
        `src="${attrEscape(src)}"`,
        `title="${attrEscape(title)}"`,
        lazy ? `loading="lazy"` : "",
        `referrerpolicy="strict-origin-when-cross-origin"`,
        sandbox ? `sandbox="allow-scripts allow-same-origin allow-presentation"` : "",
        `allowfullscreen`
      ].filter(Boolean).join("\n    ");
      return {
        output: `<div class="${attrEscape(className)}">\n  <iframe\n    ${iframeAttrs}\n  ></iframe>\n</div>\n\n<style>\n.${className} {\n  width: 100%;\n  aspect-ratio: ${ratio};\n}\n\n.${className} iframe {\n  width: 100%;\n  height: 100%;\n  border: 0;\n  display: block;\n}\n</style>`
      };
    }
  },

  "github-pages-spa-404-helper": {
    form: `
      <div class="field-grid">
        ${field({ id: "basePath", label: "App base path", value: "/", help: "Use / for custom domains, or /repo-name/ for project pages." })}
        ${select({
          id: "mode",
          label: "Preserve path as",
          value: "query",
          options: [
            { label: "Query string (?p=/route)", value: "query" },
            { label: "Hash (#/route)", value: "hash" }
          ]
        })}
        ${field({ id: "delay", label: "Redirect delay ms", value: "0", type: "number" })}
      </div>`,
    generate(root) {
      let basePath = root.querySelector("#basePath").value.trim() || "/";
      if (!basePath.startsWith("/")) basePath = `/${basePath}`;
      if (!basePath.endsWith("/")) basePath = `${basePath}/`;
      const mode = root.querySelector("#mode").value;
      const delay = Number(root.querySelector("#delay").value) || 0;
      const targetExpression = mode === "hash"
        ? `base + "#" + path + search + hash`
        : `base + "?p=" + encodeURIComponent(path + search + hash)`;
      const output = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="robots" content="noindex">
  <title>Redirecting...</title>
</head>
<body>
  <script>
    (function () {
      var base = ${JSON.stringify(basePath)};
      var path = location.pathname;
      var search = location.search || "";
      var hash = location.hash || "";
      var target = ${targetExpression};
      setTimeout(function () {
        location.replace(target);
      }, ${delay});
    }());
  </script>
  <p>Redirecting...</p>
</body>
</html>`;
      return { output };
    }
  },

  "css-color-contrast-checker": {
    form: `
      <div class="field-grid">
        ${field({ id: "fgColor", label: "Foreground color", value: "#333333", type: "color" })}
        ${field({ id: "bgColor", label: "Background color", value: "#ffffff", type: "color" })}
      </div>`,
    generate(root) {
      const fg = root.querySelector("#fgColor").value;
      const bg = root.querySelector("#bgColor").value;
      const ratio = contrastRatio(fg, bg);
      const lines = [
        `Contrast ratio: ${ratio.toFixed(2)}:1`,
        "",
        "WCAG AA:",
        `  Normal text (4.5:1): ${ratio >= 4.5 ? "PASS" : "FAIL"}`,
        `  Large text (3:1):    ${ratio >= 3 ? "PASS" : "FAIL"}`,
        "",
        "WCAG AAA:",
        `  Normal text (7:1):   ${ratio >= 7 ? "PASS" : "FAIL"}`,
        `  Large text (4.5:1):  ${ratio >= 4.5 ? "PASS" : "FAIL"}`
      ].join("\n");
      const preview = `<div style="padding:1rem;background-color:${bg};color:${fg};font-size:1.25rem;border-radius:4px;border:1px solid #ddd">Sample Text</div>`;
      return { output: lines, preview };
    }
  },

  "css-box-shadow-builder": {
    form: `
      <div class="field-grid">
        ${field({ id: "ox", label: "Offset-X", value: "0", type: "number" })}
        ${field({ id: "oy", label: "Offset-Y", value: "4", type: "number" })}
        ${field({ id: "blur", label: "Blur", value: "8", type: "number" })}
        ${field({ id: "spread", label: "Spread", value: "0", type: "number" })}
        ${field({ id: "color", label: "Color", value: "rgba(0,0,0,0.15)" })}
        ${checkbox({ id: "inset", label: "Inset" })}
      </div>`,
    generate(root) {
      const ox = root.querySelector("#ox").value || "0";
      const oy = root.querySelector("#oy").value || "0";
      const blur = root.querySelector("#blur").value || "0";
      const spread = root.querySelector("#spread").value || "0";
      const color = root.querySelector("#color").value.trim() || "rgba(0,0,0,0.15)";
      const inset = root.querySelector("#inset").checked ? "inset " : "";
      const css = `box-shadow: ${inset}${ox}px ${oy}px ${blur}px ${spread}px ${color};`;
      const preview = `<div style="width:200px;height:120px;border-radius:8px;background:#fff;${css}margin:1rem auto;border:1px solid #e5e7eb"></div>`;
      return { output: css, preview };
    }
  },

  "css-flexbox-generator": {
    form: `
      <div class="field-grid">
        ${select({
          id: "fd",
          label: "flex-direction",
          value: "row",
          options: [
            { label: "row", value: "row" },
            { label: "row-reverse", value: "row-reverse" },
            { label: "column", value: "column" },
            { label: "column-reverse", value: "column-reverse" }
          ]
        })}
        ${select({
          id: "fw",
          label: "flex-wrap",
          value: "nowrap",
          options: [
            { label: "nowrap", value: "nowrap" },
            { label: "wrap", value: "wrap" },
            { label: "wrap-reverse", value: "wrap-reverse" }
          ]
        })}
        ${select({
          id: "jc",
          label: "justify-content",
          value: "flex-start",
          options: [
            { label: "flex-start", value: "flex-start" },
            { label: "center", value: "center" },
            { label: "flex-end", value: "flex-end" },
            { label: "space-between", value: "space-between" },
            { label: "space-around", value: "space-around" },
            { label: "space-evenly", value: "space-evenly" }
          ]
        })}
        ${select({
          id: "ai",
          label: "align-items",
          value: "stretch",
          options: [
            { label: "stretch", value: "stretch" },
            { label: "flex-start", value: "flex-start" },
            { label: "center", value: "center" },
            { label: "flex-end", value: "flex-end" },
            { label: "baseline", value: "baseline" }
          ]
        })}
      </div>`,
    generate(root) {
      const fd = root.querySelector("#fd").value;
      const fw = root.querySelector("#fw").value;
      const jc = root.querySelector("#jc").value;
      const ai = root.querySelector("#ai").value;
      const css = `display: flex;\nflex-direction: ${fd};\nflex-wrap: ${fw};\njustify-content: ${jc};\nalign-items: ${ai};`;
      const html = `<div class="flex-container">\n  <div>Item 1</div>\n  <div>Item 2</div>\n  <div>Item 3</div>\n</div>`;
      const preview = `<div style="display:flex;flex-direction:${fd};flex-wrap:${fw};justify-content:${jc};align-items:${ai};gap:8px;padding:8px;border:1px solid #e5e7eb;border-radius:4px;min-height:60px"><div style="background:#ef4444;color:#fff;padding:12px 16px;border-radius:4px;font-weight:700">1</div><div style="background:#3b82f6;color:#fff;padding:12px 16px;border-radius:4px;font-weight:700">2</div><div style="background:#22c55e;color:#fff;padding:12px 16px;border-radius:4px;font-weight:700">3</div></div>`;
      return { output: `${css}\n\n<!-- HTML -->\n${html}`, preview };
    }
  },

  "css-border-radius-builder": {
    form: `
      <label class="check-row">
        <input id="uniform" type="checkbox" onchange="var c=document.getElementById('corner-fields'),u=document.getElementById('uniform-field');c.style.display=this.checked?'none':'';u.style.display=this.checked?'':'none';">
        <span>Use uniform value</span>
      </label>
      <div id="uniform-field" style="display:none">
        <div class="field">
          <label for="radius">Border radius</label>
          <div style="display:flex;gap:4px">
            <input id="radius" type="number" value="8" style="flex:1">
            <select style="width:56px;flex:none" id="radius-unit">
              <option value="px" selected>px</option>
              <option value="rem">rem</option>
              <option value="%">%</option>
            </select>
          </div>
        </div>
      </div>
      <div id="corner-fields">
        <div style="display:flex;gap:14px">
          <div class="field" style="flex:1">
            <label for="tl">Top-left</label>
            <div style="display:flex;gap:4px">
              <input id="tl" type="number" value="8" style="flex:1">
              <select style="width:56px;flex:none" id="tl-unit">
                <option value="px" selected>px</option>
                <option value="rem">rem</option>
                <option value="%">%</option>
              </select>
            </div>
          </div>
          <div class="field" style="flex:1">
            <label for="tr">Top-right</label>
            <div style="display:flex;gap:4px">
              <input id="tr" type="number" value="8" style="flex:1">
              <select style="width:56px;flex:none" id="tr-unit">
                <option value="px" selected>px</option>
                <option value="rem">rem</option>
                <option value="%">%</option>
              </select>
            </div>
          </div>
        </div>
        <div style="display:flex;gap:14px;margin-top:14px">
          <div class="field" style="flex:1">
            <label for="br">Bottom-right</label>
            <div style="display:flex;gap:4px">
              <input id="br" type="number" value="8" style="flex:1">
              <select style="width:56px;flex:none" id="br-unit">
                <option value="px" selected>px</option>
                <option value="rem">rem</option>
                <option value="%">%</option>
              </select>
            </div>
          </div>
          <div class="field" style="flex:1">
            <label for="bl">Bottom-left</label>
            <div style="display:flex;gap:4px">
              <input id="bl" type="number" value="8" style="flex:1">
              <select style="width:56px;flex:none" id="bl-unit">
                <option value="px" selected>px</option>
                <option value="rem">rem</option>
                <option value="%">%</option>
              </select>
            </div>
          </div>
        </div>
      </div>`,
    generate(root) {
      const uniform = root.querySelector("#uniform").checked;
      let css;
      if (uniform) {
        const v = root.querySelector("#radius").value || "0";
        const u = root.querySelector("#radius-unit").value;
        css = `border-radius: ${v}${u};`;
      } else {
        css = `border-radius: ${root.querySelector("#tl").value || "0"}${root.querySelector("#tl-unit").value} ${root.querySelector("#tr").value || "0"}${root.querySelector("#tr-unit").value} ${root.querySelector("#br").value || "0"}${root.querySelector("#br-unit").value} ${root.querySelector("#bl").value || "0"}${root.querySelector("#bl-unit").value};`;
      }
      const preview = `<div style="width:200px;height:120px;background:linear-gradient(135deg,#6366f1,#a855f7);${css}margin:1rem auto"></div>`;
      return { output: css, preview };
    }
  },

  "url-slug-generator": {
    form: `
      <div class="field-grid">
        ${textarea({ id: "slugSource", label: "Title or heading", value: "How to Build a Static Website with GitHub Pages", full: true })}
      </div>`,
    generate(root) {
      const input = root.querySelector("#slugSource").value.trim();
      const slug = input
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/[\s_]+/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-+|-+$/g, "");
      return { output: slug || "(enter text to generate a slug)" };
    }
  },

  "html-heading-hierarchy-checker": {
    form: `
      <div class="field-grid">
        ${textarea({
          id: "htmlInput",
          label: "Paste HTML",
          value: "<h1>Page Title</h1>\n<h2>Section One</h2>\n<h3>Subsection A</h3>\n<h2>Section Two</h2>\n<h4>Problem subsection</h4>",
          help: "Paste HTML containing heading tags (h1-h6) to analyze."
        })}
      </div>`,
    generate(root) {
      const html = root.querySelector("#htmlInput").value;
      const regex = /<h([1-6])[^>]*>(.*?)<\/h\1>/gi;
      const headings = [];
      let match;
      while ((match = regex.exec(html)) !== null) {
        headings.push({ level: parseInt(match[1], 10), text: match[2].replace(/<[^>]*>/g, "").trim() });
      }
      if (headings.length === 0) return { output: "No headings found." };
      const lines = [];
      let hasH1 = false;
      headings.forEach((h, i) => {
        if (h.level === 1) hasH1 = true;
        const indent = "  ".repeat(h.level - 1);
        let line = `${indent}H${h.level}: ${h.text}`;
        if (i > 0) {
          const prev = headings[i - 1];
          if (h.level > prev.level + 1) {
            const skipped = [];
            for (let l = prev.level + 1; l < h.level; l++) skipped.push(`H${l}`);
            line = `${indent}H${h.level}: SKIPPED ${skipped.join(", ")} — ${h.text}`;
          }
        }
        lines.push(line);
      });
      return { output: (hasH1 ? "" : "MISSING H1\n\n") + lines.join("\n") };
    }
  },

  "reading-time-estimator": {
    form: `
      <div class="field-grid">
        ${textarea({
          id: "readingContent",
          label: "Paste your content",
          value: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.",
          help: "Paste or type text to estimate reading time."
        })}
        ${field({ id: "wpm", label: "Words per minute", value: "225", type: "number", help: "Average adult reading speed is 200–250 wpm." })}
      </div>`,
    generate(root) {
      const content = root.querySelector("#readingContent").value.trim();
      const wpm = Number(root.querySelector("#wpm").value) || 225;
      const words = content ? content.split(/\s+/).length : 0;
      const minutes = words / wpm;
      const readingTime = minutes < 1 ? "< 1 min read" : `${Math.max(1, Math.round(minutes))} min read`;
      return {
        output: `Word count: ${words}\nReading time: ${readingTime}\n(at ${wpm} words per minute)`
      };
    }
  },

  "viewport-meta-tag-generator": {
    form: `
      <div class="field-grid">
        ${select({
          id: "vpWidth",
          label: "Width",
          value: "device-width",
          options: [
            { label: "device-width", value: "device-width" },
            { label: "414", value: "414" },
            { label: "768", value: "768" },
            { label: "1024", value: "1024" }
          ]
        })}
        ${field({ id: "vpScale", label: "initial-scale", value: "1.0", type: "number", attrs: "step=\"0.1\"" })}
        ${checkbox({ id: "vpScalable", label: "user-scalable", checked: true })}
        ${field({ id: "vpThemeColor", label: "theme-color", value: "#181715", type: "color" })}
        ${field({ id: "vpAppleIcon", label: "apple-touch-icon path", value: "/icons/apple-touch-icon.png" })}
        ${field({ id: "vpSiteName", label: "apple-mobile-web-app-title", value: "" })}
      </div>`,
    generate(root) {
      const width = root.querySelector("#vpWidth").value;
      const scale = root.querySelector("#vpScale").value || "1.0";
      const scalable = root.querySelector("#vpScalable").checked;
      const themeColor = root.querySelector("#vpThemeColor").value.trim();
      const appleIcon = root.querySelector("#vpAppleIcon").value.trim();
      const siteName = root.querySelector("#vpSiteName").value.trim();
      let viewport = `width=${width}, initial-scale=${scale}`;
      if (!scalable) viewport += ", user-scalable=no";
      const tags = [`<meta name="viewport" content="${viewport}">`];
      if (themeColor) tags.push(`<meta name="theme-color" content="${themeColor}">`);
      if (appleIcon) tags.push(`<link rel="apple-touch-icon" href="${appleIcon}">`);
      if (siteName) tags.push(`<meta name="apple-mobile-web-app-title" content="${siteName}">`);
      return { output: tags.join("\n") };
    }
  },

  "dns-record-quick-reference": {
    form: `
      <div class="field-grid">
        ${field({ id: "dnsDomain", label: "Domain name", value: "www.example.com", full: true, help: "Protocol, path, and trailing slash are stripped automatically." })}
      </div>`,
    generate(root) {
      let domain = root.querySelector("#dnsDomain").value.trim();
      domain = domain.replace(/^https?:\/\//, "").replace(/\/.*$/, "").trim();
      if (!domain) domain = "www.example.com";
      const apex = domain.replace(/^www\./, "");
      const lines = [
        `DNS records for: ${domain}`,
        "",
        `A       ${domain} → 185.199.108.153`,
        `        Points domain to an IPv4 address.`,
        "",
        `AAAA    ${domain} → 2606:50c0:8000::153`,
        `        Points domain to an IPv6 address.`,
        "",
        `CNAME   www → ${apex}`,
        `        Aliases one domain to another.`,
        "",
        `MX      ${domain} → mail.${apex} (priority 10)`,
        `        Mail server for the domain.`,
        "",
        `TXT     ${domain} → "v=spf1 include:_spf.${apex} ~all"`,
        `        Text records for verification and SPF.`
      ];
      return { output: lines.join("\n") };
    }
  },

  "html-entity-quick-reference": {
    form: `
      <div class="field-grid">
        ${field({ id: "entitySearch", label: "Search", type: "text", value: "", attrs: "placeholder=\"Search entities...\"" })}
      </div>`,
    generate(root) {
      const entities = [
        { char: "©", entity: "&amp;copy;", name: "Copyright", category: "Symbols" },
        { char: "®", entity: "&amp;reg;", name: "Registered", category: "Symbols" },
        { char: "™", entity: "&amp;trade;", name: "Trademark", category: "Symbols" },
        { char: "—", entity: "&amp;mdash;", name: "Em Dash", category: "Dashes" },
        { char: "–", entity: "&amp;ndash;", name: "En Dash", category: "Dashes" },
        { char: "…", entity: "&amp;hellip;", name: "Ellipsis", category: "Punctuation" },
        { char: "←", entity: "&amp;larr;", name: "Left Arrow", category: "Arrows" },
        { char: "→", entity: "&amp;rarr;", name: "Right Arrow", category: "Arrows" },
        { char: "↑", entity: "&amp;uarr;", name: "Up Arrow", category: "Arrows" },
        { char: "↓", entity: "&amp;darr;", name: "Down Arrow", category: "Arrows" },
        { char: "«", entity: "&amp;laquo;", name: "Left Double Quote", category: "Quotes" },
        { char: "»", entity: "&amp;raquo;", name: "Right Double Quote", category: "Quotes" },
        { char: "×", entity: "&amp;times;", name: "Multiply", category: "Math" },
        { char: "÷", entity: "&amp;divide;", name: "Divide", category: "Math" },
        { char: "±", entity: "&amp;plusmn;", name: "Plus-Minus", category: "Math" },
        { char: "°", entity: "&amp;deg;", name: "Degree", category: "Math" },
        { char: "€", entity: "&amp;euro;", name: "Euro", category: "Currency" },
        { char: "£", entity: "&amp;pound;", name: "Pound", category: "Currency" },
        { char: "¥", entity: "&amp;yen;", name: "Yen", category: "Currency" },
        { char: "&", entity: "&amp;amp;", name: "Ampersand", category: "Symbols" },
        { char: "<", entity: "&amp;lt;", name: "Less Than", category: "Symbols" },
        { char: ">", entity: "&amp;gt;", name: "Greater Than", category: "Symbols" },
        { char: "“”", entity: "&amp;quot;", name: "Double Quote", category: "Quotes" },
        { char: "'", entity: "&amp;apos;", name: "Single Quote", category: "Quotes" },
        { char: " ", entity: "&amp;nbsp;", name: "Non-Breaking Space", category: "Punctuation" }
      ];
      const decodeEntity = (s) => s.replace(/&amp;/g, "&");
      const search = root.querySelector("#entitySearch").value.trim().toLowerCase();
      const filtered = search
        ? entities.filter((e) =>
            e.name.toLowerCase().includes(search) ||
            e.category.toLowerCase().includes(search) ||
            e.entity.toLowerCase().includes(search)
          )
        : entities;
      let html;
      if (!search) {
        const groups = {};
        entities.forEach((e) => {
          if (!groups[e.category]) groups[e.category] = [];
          groups[e.category].push(e);
        });
        html = Object.entries(groups).map(([cat, items]) => `
          <div class="entity-category">
            <h4>${htmlEscape(cat)}</h4>
            <table>
              ${items.map((e) => `<tr class="entity-row" data-entity="${attrEscape(decodeEntity(e.entity))}">
                <td class="entity-char">${e.char}</td>
                <td class="entity-code">${e.entity}</td>
                <td class="entity-name">${htmlEscape(e.name)}</td>
              </tr>`).join("")}
            </table>
          </div>
        `).join("");
      } else {
        html = `<table>
          ${filtered.map((e) => `<tr class="entity-row" data-entity="${attrEscape(decodeEntity(e.entity))}">
            <td class="entity-char">${e.char}</td>
            <td class="entity-code">${e.entity}</td>
            <td class="entity-name">${htmlEscape(e.name)}</td>
          </tr>`).join("")}
        </table>`;
      }
      const preview = root.querySelector("[data-role='preview']");
      if (!preview.dataset.entityReady) {
        preview.dataset.entityReady = "true";
        preview.addEventListener("click", (e) => {
          const row = e.target.closest(".entity-row");
          if (row && row.dataset.entity) {
            navigator.clipboard.writeText(row.dataset.entity).catch(() => {});
          }
        });
      }
      return { output: "", preview: html };
    }
  },

  "css-cascade-layer-planner": {
    form: `
      <div class="field-grid">
        ${select({
          id: "layerPreset",
          label: "Site type",
          value: "simple",
          options: [
            { label: "Simple site", value: "simple" },
            { label: "Component library", value: "components" },
            { label: "Utility-first CSS", value: "utility" },
            { label: "Custom", value: "custom" }
          ]
        })}
      </div>
      <div class="check-grid" id="layerChecks">
        ${checkbox({ id: "layerReset", label: "reset / normalize", checked: true })}
        ${checkbox({ id: "layerBase", label: "base (typography, colors)", checked: true })}
        ${checkbox({ id: "layerLayout", label: "layout (grid, spacing)", checked: true })}
        ${checkbox({ id: "layerComponents", label: "components (cards, buttons)", checked: true })}
        ${checkbox({ id: "layerUtilities", label: "utilities (overrides)", checked: true })}
        ${checkbox({ id: "layerThemes", label: "themes (dark mode, brand)", checked: false })}
      </div>`,
    generate(root) {
      const preset = root.querySelector("#layerPreset").value;
      const layerIds = ["layerReset","layerBase","layerLayout","layerComponents","layerUtilities","layerThemes"];
      const layerNames = { layerReset: "reset", layerBase: "base", layerLayout: "layout", layerComponents: "components", layerUtilities: "utilities", layerThemes: "themes" };
      const layerGuides = {
        reset: "Normalize or reset rules here. Remove default margins and set box-sizing.",
        base: "HTML element defaults, typography, color variables, and link styles.",
        layout: "Container, grid, spacing, and section layout rules.",
        components: "Cards, buttons, forms, navigation, and other reusable components.",
        utilities: "Small override classes: .hidden, .centered, .sr-only, spacing helpers.",
        themes: "Theme variations: dark mode, brand skins, high-contrast settings."
      };
      let layers;
      if (preset !== "custom") {
        const presets = {
          simple: ["reset","base","layout","components","utilities"],
          components: ["reset","base","layout","components","utilities","themes"],
          utility: ["reset","base","components","utilities"]
        };
        layers = presets[preset];
        layerIds.forEach(id => {
          const cb = root.querySelector(`#${id}`);
          if (cb) cb.checked = layers.includes(layerNames[id]);
        });
      } else {
        layers = layerIds.filter(id => root.querySelector(`#${id}`).checked).map(id => layerNames[id]);
      }
      if (layers.length === 0) return { output: "Select at least one layer." };
      const orderDecl = `@layer ${layers.join(", ")};`;
      const cssBlocks = layers.map(l =>
        `/* ── ${l} ── */\n@layer ${l} {\n  /* ${layerGuides[l] || ""} */\n}`
      ).join("\n\n");
      return { output: `${orderDecl}\n\n${cssBlocks}\n\n/* Layer order: later layers override earlier ones.\n   Unlayered styles always beat layered styles.\n   !important in earlier layers beats !important in later layers (reverse of normal). */` };
    }
  },

  "css-content-visibility-generator": {
    form: `
      <div class="field-grid">
        ${select({
          id: "cvScenario",
          label: "Content type",
          value: "articles",
          options: [
            { label: "Article list / blog feed", value: "articles" },
            { label: "Card grid (products, posts)", value: "cards" },
            { label: "Documentation sections", value: "docs" },
            { label: "Comment thread", value: "comments" },
            { label: "Custom", value: "custom" }
          ]
        })}
        ${field({ id: "cvHeight", label: "Estimated height px", value: "400", type: "number", help: "contain-intrinsic-size. Use a value close to the average content height." })}
        ${field({ id: "cvSelector", label: "Selector", value: ".content-section", full: true })}
      </div>`,
    generate(root) {
      const scenario = root.querySelector("#cvScenario").value;
      const height = root.querySelector("#cvHeight").value || "400";
      const selector = root.querySelector("#cvSelector").value.trim() || ".content-section";
      const defaults = { articles: "300", cards: "350", docs: "500", comments: "200", custom: height };
      const h = defaults[scenario];
      return { output: `${selector} {
  content-visibility: auto;
  contain-intrinsic-size: auto ${h}px;
}

/* How it works:
   content-visibility: auto skips rendering for off-screen content.
   contain-intrinsic-size gives the browser an estimated height so the
   scrollbar stays stable before the section is rendered.

   When the section approaches the viewport, the browser renders it fully.

   Browser support: Chrome 85+, Edge 85+, Firefox 125+, Safari 18.2+ */` };
    }
  },

  "css-overscroll-behavior-generator": {
    form: `
      <div class="field-grid">
        ${select({
          id: "osScenario",
          label: "Scenario",
          value: "body",
          options: [
            { label: "Body (prevent pull-to-refresh)", value: "body" },
            { label: "Modal / drawer overlay", value: "modal" },
            { label: "Sidebar navigation", value: "sidebar" },
            { label: "Horizontal carousel", value: "carousel" },
            { label: "Custom", value: "custom" }
          ]
        })}
        ${select({
          id: "osBehavior",
          label: "Behavior",
          value: "contain",
          options: [
            { label: "contain (stop chaining, keep bounce)", value: "contain" },
            { label: "none (no chaining, no bounce)", value: "none" },
            { label: "auto (browser default)", value: "auto" }
          ]
        })}
        ${select({
          id: "osAxis",
          label: "Axis",
          value: "both",
          options: [
            { label: "both (x and y)", value: "both" },
            { label: "x (horizontal only)", value: "x" },
            { label: "y (vertical only)", value: "y" }
          ]
        })}
        ${field({ id: "osSelector", label: "Selector", value: "body", full: true })}
      </div>`,
    generate(root) {
      const scenario = root.querySelector("#osScenario").value;
      const behavior = root.querySelector("#osBehavior").value;
      const axis = root.querySelector("#osAxis").value;
      const presets = { body: "body", modal: ".modal-overlay", sidebar: ".sidebar", carousel: ".carousel-track", custom: ".overscroll-target" };
      const presetSelector = root.querySelector("#osSelector").value.trim();
      const selector = scenario === "custom" ? (presetSelector || ".overscroll-target") : presets[scenario];
      const prop = axis === "both" ? `overscroll-behavior: ${behavior};` : `overscroll-behavior-${axis}: ${behavior};`;
      const warnings = [];
      if (scenario === "body" && behavior === "none") warnings.push("Caution: overscroll-behavior: none on body disables pull-to-refresh entirely.");
      const warnText = warnings.length ? `\n\n/* ${warnings.join(" ")} */` : "";
      return { output: `${selector} {
  ${prop}
}${warnText}

/* contain — stops scroll chaining but keeps visual bounce.
   none — prevents scroll chaining and bounce effects.
   auto — browser default overscroll behavior. */` };
    }
  },

  "html-popover-generator": {
    form: `
      <div class="field-grid">
        ${field({ id: "popoverId", label: "Popover ID", value: "my-popover" })}
        ${field({ id: "popoverButton", label: "Button text", value: "Open popover" })}
        ${textarea({ id: "popoverContent", label: "Popover content (HTML)", value: "<p>This is a popover message.</p>" })}
        ${select({
          id: "popoverPosition",
          label: "Anchor position",
          value: "auto",
          options: [
            { label: "auto (browser default)", value: "auto" },
            { label: "top", value: "top" },
            { label: "bottom", value: "bottom" },
            { label: "left", value: "left" },
            { label: "right", value: "right" }
          ]
        })}
        ${checkbox({ id: "popoverManual", label: "Manual (no auto-close on outside click)", checked: false })}
      </div>`,
    generate(root) {
      const id = root.querySelector("#popoverId").value.trim() || "my-popover";
      const button = root.querySelector("#popoverButton").value.trim() || "Open popover";
      const content = root.querySelector("#popoverContent").value.trim();
      const position = root.querySelector("#popoverPosition").value;
      const manual = root.querySelector("#popoverManual").checked ? " manual" : "";
      const posCSS = position !== "auto"
        ? `\n  [popover] { position-area: ${position}; }`
        : "";
      return { output: `<button popovertarget="${attrEscape(id)}">${htmlEscape(button)}</button>

<div id="${attrEscape(id)}" popover${manual}>
  ${content}
</div>

<style>
  [popover] {
    padding: 1rem;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    max-width: 320px;
  }${posCSS}
</style>

<!-- Browser support: Chrome 114+, Edge 114+, Safari 17+, Firefox 125+.
     Browsers without popover support show the content inline as static HTML. -->` };
    }
  },

  "iframe-sandbox-allow-generator": {
    form: `
      <div class="field-grid">
        ${select({
          id: "sxUseCase",
          label: "Embed type",
          value: "youtube",
          options: [
            { label: "YouTube / video", value: "youtube" },
            { label: "Google Maps", value: "maps" },
            { label: "Form widget", value: "form" },
            { label: "Payment / checkout", value: "payment" },
            { label: "Generic third-party", value: "generic" },
            { label: "Custom", value: "custom" }
          ]
        })}
        ${field({ id: "sxSrc", label: "Iframe URL", value: "https://www.youtube.com/embed/dQw4w9WgXcQ", full: true })}
        ${field({ id: "sxTitle", label: "Iframe title", value: "Embedded content", full: true })}
      </div>
      <div class="check-grid">
        ${checkbox({ id: "sxScripts", label: "allow-scripts", checked: true })}
        ${checkbox({ id: "sxSameOrigin", label: "allow-same-origin" })}
        ${checkbox({ id: "sxForms", label: "allow-forms" })}
        ${checkbox({ id: "sxPopups", label: "allow-popups" })}
        ${checkbox({ id: "sxPresentation", label: "allow-presentation" })}
        ${checkbox({ id: "sxTopNav", label: "allow-top-navigation" })}
      </div>
      <div class="check-grid">
        ${checkbox({ id: "sxCamera", label: "camera" })}
        ${checkbox({ id: "sxMicrophone", label: "microphone" })}
        ${checkbox({ id: "sxGeolocation", label: "geolocation" })}
        ${checkbox({ id: "sxFullscreen", label: "fullscreen" })}
        ${checkbox({ id: "sxPayment", label: "payment" })}
      </div>`,
    generate(root) {
      const useCase = root.querySelector("#sxUseCase").value;
      const sandboxIds = ["sxScripts","sxSameOrigin","sxForms","sxPopups","sxPresentation","sxTopNav"];
      const sandboxNames = { sxScripts: "allow-scripts", sxSameOrigin: "allow-same-origin", sxForms: "allow-forms", sxPopups: "allow-popups", sxPresentation: "allow-presentation", sxTopNav: "allow-top-navigation" };
      const allowPermIds = ["sxCamera","sxMicrophone","sxGeolocation","sxFullscreen","sxPayment"];
      const presets = {
        youtube: { sandbox: ["sxScripts","sxSameOrigin","sxPresentation"], allow: ["sxFullscreen"] },
        maps: { sandbox: ["sxScripts","sxSameOrigin"], allow: [] },
        form: { sandbox: ["sxScripts","sxSameOrigin","sxForms"], allow: [] },
        payment: { sandbox: ["sxScripts","sxSameOrigin","sxForms"], allow: ["sxPayment"] },
        generic: { sandbox: ["sxScripts","sxSameOrigin","sxPopups"], allow: [] },
        custom: { sandbox: sandboxIds.filter(id => root.querySelector(`#${id}`).checked), allow: allowPermIds.filter(id => root.querySelector(`#${id}`).checked) }
      };
      const config = presets[useCase];
      if (useCase !== "custom") {
        sandboxIds.forEach(id => { const cb = root.querySelector(`#${id}`); if (cb) cb.checked = config.sandbox.includes(id); });
        allowPermIds.forEach(id => { const cb = root.querySelector(`#${id}`); if (cb) cb.checked = config.allow.includes(id); });
      }
      const sandbox = config.sandbox.map(id => sandboxNames[id]).filter(Boolean);
      const allow = config.allow.map(id => id.replace("sx", "").toLowerCase()).filter(Boolean);
      const src = root.querySelector("#sxSrc").value.trim();
      const title = root.querySelector("#sxTitle").value.trim();
      const attrs = [
        `src="${attrEscape(src)}"`,
        `title="${attrEscape(title)}"`,
        `width="100%"`,
        sandbox.length ? `sandbox="${sandbox.join(" ")}"` : "",
        allow.length ? `allow="${allow.join("; ")}"` : "",
        `allowfullscreen`,
        `referrerpolicy="strict-origin-when-cross-origin"`,
        `loading="lazy"`
      ].filter(Boolean);
      let warn = sandbox.includes("allow-scripts") && sandbox.includes("allow-same-origin")
        ? "\n\n<!-- Warning: allow-scripts + allow-same-origin can remove sandbox protection. Only use both when the embed needs same-origin script access. -->"
        : "";
      return { output: `<iframe\n    ${attrs.join("\n    ")}\n  ></iframe>${warn}` };
    }
  },

  "static-sitemap-xml-builder": {
    form: `
      <div class="field-grid">
        ${textarea({
          id: "sitemapUrls",
          label: "URL list",
          value: "https://example.com/|2025-01-15|monthly|0.8\nhttps://example.com/about/|2025-01-10|monthly|0.5\nhttps://example.com/tools/|2025-01-20|weekly|0.9",
          help: "One URL per line: url|lastmod|changefreq|priority. Lastmod, changefreq, and priority are optional."
        })}
      </div>`,
    generate(root) {
      const lines = root.querySelector("#sitemapUrls").value.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
      const validFreqs = ["always","hourly","daily","weekly","monthly","yearly","never"];
      const urls = lines.map(line => {
        const [url, lastmod, changefreq, priority] = line.split("|").map(s => s.trim());
        if (!url) return "";
        const freq = validFreqs.includes(changefreq) ? changefreq : null;
        const prio = priority && !isNaN(parseFloat(priority)) ? parseFloat(priority) : null;
        let entry = `  <url>\n    <loc>${attrEscape(normalizeUrl(url))}</loc>`;
        if (lastmod) entry += `\n    <lastmod>${attrEscape(lastmod)}</lastmod>`;
        if (freq) entry += `\n    <changefreq>${freq}</changefreq>`;
        if (prio !== null) entry += `\n    <priority>${prio}</priority>`;
        entry += `\n  </url>`;
        return entry;
      }).filter(Boolean);
      if (urls.length === 0) return { output: "Add URLs to generate a sitemap." };
      return { output: `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join("\n")}\n</urlset>` };
    }
  },

  "github-pages-workflow-generator": {
    form: `
      <div class="field-grid">
        ${select({
          id: "wfType",
          label: "Site type",
          value: "static",
          options: [
            { label: "Plain HTML / static files", value: "static" },
            { label: "Vite", value: "vite" },
            { label: "Astro", value: "astro" },
            { label: "Custom", value: "custom" }
          ]
        })}
        ${field({ id: "wfBuildCmd", label: "Build command", value: "npm run build" })}
        ${field({ id: "wfOutputDir", label: "Output directory", value: "dist" })}
        ${field({ id: "wfNodeVersion", label: "Node version", value: "22" })}
        ${checkbox({ id: "wfCNAME", label: "Include CNAME placeholder step", checked: true })}
      </div>`,
    generate(root) {
      const type = root.querySelector("#wfType").value;
      const presets = {
        static: { build: "", outDir: "." },
        vite: { build: "npm run build", outDir: "dist" },
        astro: { build: "npm run build", outDir: "dist" },
        custom: {
          build: root.querySelector("#wfBuildCmd").value.trim() || "npm run build",
          outDir: root.querySelector("#wfOutputDir").value.trim() || "dist"
        }
      };
      const config = presets[type];
      const nodeVersion = root.querySelector("#wfNodeVersion").value.trim() || "22";
      const includeCNAME = root.querySelector("#wfCNAME").checked;
      let buildStep = "";
      if (config.build) {
        buildStep = `\n\n      - name: Install dependencies\n        run: npm ci\n\n      - name: Build\n        run: ${config.build}`;
      }
      let cnameStep = "";
      if (includeCNAME) {
        cnameStep = `\n\n      - name: Write CNAME placeholder\n        run: echo "example.com" > ${config.outDir}/CNAME`;
      }
      let createCnameIfDir = "";
      if (includeCNAME && config.outDir !== ".") {
        createCnameIfDir = `\n      - name: Ensure output directory\n        run: mkdir -p ${config.outDir}`;
      }
      const yaml = `name: Deploy to GitHub Pages

on:
  push:
    branches:
      - main

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: false

jobs:
  deploy:
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: \${{ steps.deployment.outputs.page_url }}
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: "${nodeVersion}"${buildStep}${createCnameIfDir}${cnameStep}

      - uses: actions/configure-pages@v4

      - uses: actions/upload-pages-artifact@v3
        with:
          path: ${config.outDir}

      - uses: actions/deploy-pages@v4`;
      return { output: yaml };
    }
  },

  "speculation-rules-generator": {
    form: `
      <div class="field-grid">
        ${select({
          id: "specType",
          label: "Speculation type",
          value: "prerender",
          options: [
            { label: "Prerender (full page render)", value: "prerender" },
            { label: "Prefetch (document only)", value: "prefetch" }
          ]
        })}
        ${select({
          id: "specSource",
          label: "Source type",
          value: "list",
          options: [
            { label: "URL list", value: "list" },
            { label: "Document rules (same-origin links)", value: "document-rules" }
          ]
        })}
        ${textarea({
          id: "specUrls",
          label: "URLs to include",
          value: "/about/\n/tools/\n/faq/",
          help: "One URL per line. Only used for list source type."
        })}
        ${select({
          id: "specEagerness",
          label: "Eagerness",
          value: "moderate",
          options: [
            { label: "conservative (hover / focus)", value: "conservative" },
            { label: "moderate (hover + 200ms)", value: "moderate" },
            { label: "eager (immediate)", value: "eager" }
          ]
        })}
      </div>`,
    generate(root) {
      const specType = root.querySelector("#specType").value;
      const source = root.querySelector("#specSource").value;
      const eagerness = root.querySelector("#specEagerness").value;
      const urls = root.querySelector("#specUrls").value.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
      let rules;
      if (source === "list") {
        rules = {
          [specType]: urls.map(url => {
            const entry = { source: "list", urls: [url] };
            if (eagerness !== "moderate") entry.eagerness = eagerness;
            return entry;
          }).filter(r => r.urls[0])
        };
      } else {
        rules = {
          [specType]: [{
            source: "document",
            where: {
              href_matches: "/*"
            }
          }]
        };
        if (eagerness !== "moderate") rules[specType][0].eagerness = eagerness;
      }
      if (Object.keys(rules[specType]).length === 0 || (Array.isArray(rules[specType]) && rules[specType].length === 0)) {
        return { output: "Add at least one URL, or switch to document rules." };
      }
      return { output: `<script type="speculationrules">\n${JSON.stringify(rules, null, 2)}\n</script>\n\n<!-- Place in <head> or near the end of <body>.\n     Chrome 109+ and Edge 109+ support Speculation Rules.\n     Other browsers ignore the script tag — safe as progressive enhancement.\n     Prerendering = full page fetch and render (fastest, more bandwidth).\n     Prefetching = document resource only (lighter, less bandwidth). -->` };
    }
  },

  "permissions-policy-generator": {
    form: `
      <div class="field-grid">
        ${select({
          id: "ppPreset",
          label: "Policy preset",
          value: "minimal",
          options: [
            { label: "Minimal (deny all)", value: "minimal" },
            { label: "Media site (camera, mic, fullscreen)", value: "media" },
            { label: "Payment page", value: "payment" },
            { label: "Custom", value: "custom" }
          ]
        })}
      </div>
      <div class="check-grid" style="margin-top:12px">
        <label style="font-weight:700;display:block;margin-bottom:6px">Browser features</label>
        ${[
          { id: "ppCamera", label: "camera" },
          { id: "ppMicrophone", label: "microphone" },
          { id: "ppGeolocation", label: "geolocation" },
          { id: "ppFullscreen", label: "fullscreen" },
          { id: "ppPayment", label: "payment" },
          { id: "ppAutoplay", label: "autoplay" },
          { id: "ppDisplayCapture", label: "display-capture" },
          { id: "ppWakeLock", label: "screen-wake-lock" }
        ].map((f) => `
          <div class="field" style="display:flex;align-items:center;gap:8px">
            <label for="${f.id}" style="min-width:130px">${f.label}</label>
            <select id="${f.id}" style="flex:1">
              <option value="deny">Deny</option>
              <option value="self">Allow self</option>
              <option value="*">Allow *</option>
            </select>
          </div>
        `).join("")}
      </div>`,
    generate(root) {
      const preset = root.querySelector("#ppPreset").value;
      const features = [
        { id: "ppCamera", name: "camera" },
        { id: "ppMicrophone", name: "microphone" },
        { id: "ppGeolocation", name: "geolocation" },
        { id: "ppFullscreen", name: "fullscreen" },
        { id: "ppPayment", name: "payment" },
        { id: "ppAutoplay", name: "autoplay" },
        { id: "ppDisplayCapture", name: "display-capture" },
        { id: "ppWakeLock", name: "screen-wake-lock" }
      ];
      const presets = {
        minimal: {},
        media: { ppCamera: "self", ppFullscreen: "self", ppAutoplay: "self" },
        payment: { ppPayment: "self", ppFullscreen: "self" },
        custom: null
      };
      if (preset !== "custom" && presets[preset]) {
        Object.entries(presets[preset]).forEach(([id, val]) => {
          const sel = root.querySelector(`#${id}`);
          if (sel) sel.value = val;
        });
        features.forEach((f) => {
          if (!presets[preset][f.id]) {
            const sel = root.querySelector(`#${f.id}`);
            if (sel) sel.value = "deny";
          }
        });
      }
      const directives = features.map((f) => {
        const val = root.querySelector(`#${f.id}`).value;
        if (val === "deny") return `${f.name}=()`;
        if (val === "self") return `${f.name}=(self)`;
        return `${f.name}=*`;
      });
      const header = `Permissions-Policy: ${directives.join(", ")}`;
      const allowAttrs = features.filter((f) => {
        const val = root.querySelector(`#${f.id}`).value;
        return val !== "deny";
      }).map((f) => {
        const val = root.querySelector(`#${f.id}`).value;
        return val === "*" ? `${f.name} *` : `${f.name} 'self'`;
      });
      const metaTag = `<meta http-equiv="Permissions-Policy" content="${directives.join(", ")}">`;
      let notes = "Use this as an HTTP header or the meta tag equivalent.\n\n";
      notes += "Per-iframe allow override:\n<iframe allow=\"" + allowAttrs.join("; ") + "\" ...>\n\n";
      notes += "Static hosting notes:\n";
      notes += "- Netlify / Cloudflare Pages / Vercel: add the header in your config file.\n";
      notes += "- GitHub Pages: custom headers are not supported. Use the meta tag above.\n";
      notes += "- The meta tag works in all modern browsers for most directives.";
      return { output: `${header}\n\n${metaTag}\n\n${notes}` };
    }
  },

  "csp-starter-policy-generator": {
    form: `
      <div class="field-grid">
        ${select({
          id: "cspPreset",
          label: "Site type",
          value: "static",
          options: [
            { label: "Plain static site (self only)", value: "static" },
            { label: "Static + CDN (Bootstrap, Tailwind)", value: "cdn" },
            { label: "Static + analytics + fonts", value: "analytics" },
            { label: "Static + embeds (YouTube, maps)", value: "embeds" },
            { label: "Custom", value: "custom" }
          ]
        })}
      </div>
      <div class="check-grid" style="margin-top:12px">
        <label style="font-weight:700;display:block;margin-bottom:6px">Additional sources</label>
        ${checkbox({ id: "cspGAnalytics", label: "Google Analytics / Tag Manager" })}
        ${checkbox({ id: "cspGFonts", label: "Google Fonts" })}
        ${checkbox({ id: "cspCDN", label: "CDN (cdn.jsdelivr.net, unpkg.com)" })}
        ${checkbox({ id: "cspYouTube", label: "YouTube embeds" })}
        ${checkbox({ id: "cspMaps", label: "Google Maps embeds" })}
        ${checkbox({ id: "cspInlines", label: "Allow inline styles (unsafe-inline)" })}
      </div>`,
    generate(root) {
      const preset = root.querySelector("#cspPreset").value;
      const presets = {
        static: [],
        cdn: ["cspCDN"],
        analytics: ["cspGAnalytics", "cspGFonts"],
        embeds: ["cspYouTube", "cspMaps", "cspGFonts"],
        custom: null
      };
      if (preset !== "custom" && presets[preset]) {
        ["cspGAnalytics","cspGFonts","cspCDN","cspYouTube","cspMaps","cspInlines"].forEach((id) => {
          const cb = root.querySelector(`#${id}`);
          if (cb) cb.checked = presets[preset].includes(id);
        });
      }
      const defaultSrc = ["'self'"];
      const scriptSrc = ["'self'"];
      const styleSrc = ["'self'"];
      const imgSrc = ["'self'", "data:"];
      const fontSrc = ["'self'"];
      const frameSrc = ["'self'"];
      const connectSrc = ["'self'"];
      if (root.querySelector("#cspGAnalytics").checked) {
        scriptSrc.push("https://www.googletagmanager.com", "https://www.google-analytics.com");
        connectSrc.push("https://www.google-analytics.com");
        imgSrc.push("https://www.google-analytics.com");
      }
      if (root.querySelector("#cspGFonts").checked) {
        styleSrc.push("https://fonts.googleapis.com");
        fontSrc.push("https://fonts.gstatic.com");
      }
      if (root.querySelector("#cspCDN").checked) {
        scriptSrc.push("https://cdn.jsdelivr.net", "https://unpkg.com");
        styleSrc.push("https://cdn.jsdelivr.net", "https://unpkg.com");
      }
      if (root.querySelector("#cspYouTube").checked) {
        frameSrc.push("https://www.youtube.com", "https://www.youtube-nocookie.com");
      }
      if (root.querySelector("#cspMaps").checked) {
        frameSrc.push("https://www.google.com/maps");
        imgSrc.push("https://*.googleapis.com");
        scriptSrc.push("https://maps.googleapis.com");
      }
      if (root.querySelector("#cspInlines").checked) {
        styleSrc.push("'unsafe-inline'");
      }
      const dirs = [
        `default-src ${defaultSrc.join(" ")};`,
        `script-src ${scriptSrc.join(" ")};`,
        `style-src ${styleSrc.join(" ")};`,
        `img-src ${imgSrc.join(" ")};`,
        `font-src ${fontSrc.join(" ")};`,
        `frame-src ${frameSrc.join(" ")};`,
        `connect-src ${connectSrc.join(" ")};`,
        "base-uri 'self';",
        "form-action 'self';"
      ];
      const csp = dirs.join(" ");
      const reportOnly = `Content-Security-Policy-Report-Only: ${csp}`;
      const enforced = `Content-Security-Policy: ${csp}`;
      const metaTag = `<meta http-equiv="Content-Security-Policy" content="${attrEscape(csp)}">`;
      let notes = "1. Deploy the Report-Only header first and check the browser console for violations.\n";
      notes += "2. When no violations appear, switch to the enforce header or meta tag.\n";
      notes += "3. GitHub Pages: Custom HTTP headers are not supported. Use the meta tag.\n";
      notes += "4. frame-ancestors and report-uri do not work via meta tag — use headers for those.\n";
      notes += "5. unsafe-inline for scripts weakens XSS protection. Avoid it when possible.";
      return { output: `${reportOnly}\n\n${enforced}\n\n${metaTag}\n\n${notes}` };
    }
  }
};

document.querySelectorAll("[data-tool-id]").forEach((root) => {
  const id = root.dataset.toolId;
  const config = tools[id];
  if (!config) {
    root.innerHTML = `<p>This tool is not available yet.</p>`;
    return;
  }
  mountTool(root, config);
});
