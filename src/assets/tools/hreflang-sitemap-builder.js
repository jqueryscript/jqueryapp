import { textarea, field, checkbox, htmlEscape, attrEscape } from "../tool-core.js";

export default {
  form: `
    <div class="field-grid">
      ${textarea({ id: "hsPairs", label: "Locale / URL pairs", help: "One pair per line. Format: language-code|absolute-url. Example: en|https://example.com/page/", value: "en|https://example.com/page/\nde|https://example.com/de/seite/\nfr|https://example.com/fr/page/" })}
    </div>
    <div class="field-grid">
      ${field({ id: "hsDefault", label: "x-default URL (optional)", help: "URL for language selector or global landing page." })}
      ${checkbox({ id: "hsReciprocal", label: "Validate reciprocity", checked: true })}
    </div>`,
  generate(root) {
    const rawPairs = root.querySelector("#hsPairs").value.trim();
    const xDefault = root.querySelector("#hsDefault").value.trim();
    const validateReciprocity = root.querySelector("#hsReciprocal").checked;

    if (!rawPairs) {
      return { output: "Enter locale/URL pairs, one per line. Format: language-code|absolute-url. Example: en|https://example.com/page/" };
    }

    const pairs = rawPairs.split("\n").map(line => {
      const parts = line.split("|");
      if (parts.length < 2) return null;
      return { lang: parts[0].trim(), url: parts.slice(1).join("|").trim() };
    }).filter(Boolean);

    if (!pairs.length) {
      return { output: "No valid pairs found. Use the format: language-code|absolute-url (one per line)." };
    }

    // Group by URL (each unique URL is a page with alternates)
    const urlMap = {};
    pairs.forEach(p => {
      if (!urlMap[p.url]) urlMap[p.url] = [];
      urlMap[p.url].push(p.lang);
    });

    const warnings = [];

    // Reciprocity check: each locale URL must list the same set of languages
    if (validateReciprocity) {
      const urlKeys = Object.keys(urlMap);
      if (urlKeys.length > 1) {
        const refSet = new Set(urlMap[urlKeys[0]]);
        urlKeys.forEach(url => {
          const langSet = new Set(urlMap[url]);
          for (const lang of refSet) {
            if (!langSet.has(lang)) {
              warnings.push(`Reciprocity issue: URL "${url}" is missing language "${lang}". Each page in the group should link to every other version.`);
            }
          }
          for (const lang of langSet) {
            if (!refSet.has(lang)) {
              warnings.push(`Extra language: URL "${url}" has language "${lang}" not found in the first URL's set.`);
            }
          }
        });
      }
    }

    // Build XML sitemap
    const lines = [];
    lines.push('<?xml version="1.0" encoding="UTF-8"?>');
    lines.push('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"');
    lines.push('         xmlns:xhtml="http://www.w3.org/1999/xhtml">');

    const seenUrls = new Set();
    pairs.forEach(p => {
      if (seenUrls.has(p.url)) return;
      seenUrls.add(p.url);
      const alternates = pairs.filter(a => a.url === p.url);
      lines.push("  <url>");
      lines.push(`    <loc>${attrEscape(p.url)}</loc>`);
      alternates.forEach(alt => {
        lines.push(`    <xhtml:link rel="alternate" hreflang="${attrEscape(alt.lang)}" href="${attrEscape(alt.url)}"/>`);
      });
      if (xDefault) {
        lines.push(`    <xhtml:link rel="alternate" hreflang="x-default" href="${attrEscape(xDefault)}"/>`);
      }
      lines.push("  </url>");
    });

    lines.push("</urlset>");

    if (warnings.length) {
      lines.unshift("<!--", "=== Reciprocity Warnings ===", ...warnings.map(w => "  " + w), "-->\n");
    }

    lines.push(
      "",
      "<!-- Deployment checklist: -->",
      "<!-- 1. Save as sitemap-hreflang.xml or include in your main sitemap. -->",
      "<!-- 2. Verify all URLs are absolute and served over HTTPS. -->",
      "<!-- 3. Each page listed must also have hreflang link tags in its HTML head. -->",
      "<!-- 4. Submit to Google Search Console and check the International Targeting report. -->"
    );

    return { output: lines.join("\n") };
  }
};
