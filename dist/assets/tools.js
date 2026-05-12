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
  root.innerHTML = `
    <div class="tool-layout">
      <form class="tool-panel" data-role="form">
        ${config.form}
      </form>
      <div class="result-box">
        <div class="result-header">
          <h2>Output</h2>
          <button class="copy-button" type="button" data-role="copy">Copy</button>
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
    copy.textContent = "Copied";
    setTimeout(() => {
      copy.textContent = "Copy";
    }, 1200);
  });

  update();
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
        ${textarea({ id: "description", label: "Description", value: "Client-side tools for beginner web developers, site owners, and blog publishers.", full: true })}
        ${field({ id: "url", label: "Page URL", value: "https://www.jquery.app/en/tools/" })}
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
