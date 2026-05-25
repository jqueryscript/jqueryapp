import { field, textarea, select, checkbox, htmlEscape, attrEscape, normalizeUrl } from "../tool-core.js";

export default {
    form: `
      <div class="field-grid">
        ${textarea({
          id: "tocHtml",
          label: "Paste HTML with headings",
          value: "<h1>Page Title</h1>\n<h2>Section One</h2>\n<h3>Subsection A</h3>\n<h2>Section Two</h2>\n<h3>Subsection B</h3>",
          help: "Paste HTML containing heading tags (h1-h6)."
        })}
        ${select({ id: "tocMinLevel", label: "Minimum heading level", value: "2", options: [
          { label: "h1", value: "1" },
          { label: "h2", value: "2" },
          { label: "h3", value: "3" }
        ]})}
      </div>`,
    generate(root) {
      const html = root.querySelector("#tocHtml").value;
      const minLevel = parseInt(root.querySelector("#tocMinLevel").value, 10);
      const slugify = (text) => text.toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/[\s_]+/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-+|-+$/g, "");
      const regex = /<h([1-6])[^>]*>(.*?)<\/h\1>/gi;
      const headings = [];
      let match;
      while ((match = regex.exec(html)) !== null) {
        const level = parseInt(match[1], 10);
        if (level < minLevel) continue;
        const text = match[2].replace(/<[^>]*>/g, "").trim();
        if (!text) continue;
        headings.push({ level, text, slug: slugify(text) });
      }
      if (headings.length === 0) return { output: "No headings found at the selected minimum level." };
      const baseLevel = headings[0].level;
      const parts = ["<ul>\n"];
      let curLevel = baseLevel;
      for (let i = 0; i < headings.length; i++) {
        const h = headings[i];
        if (h.level > curLevel) {
          parts.push("<ul>\n");
        } else if (h.level < curLevel) {
          parts.push("</li>\n");
          for (let l = curLevel; l > h.level; l--) {
            parts.push("</ul>\n</li>\n");
          }
        } else if (i > 0) {
          parts.push("</li>\n");
        }
        parts.push(`<li><a href="#${attrEscape(h.slug)}">${htmlEscape(h.text)}</a>`);
        curLevel = h.level;
      }
      parts.push("</li>\n");
      for (let l = curLevel; l > baseLevel; l--) {
        parts.push("</ul>\n</li>\n");
      }
      parts.push("</ul>");
      const toc = parts.join("");
      const idHtml = html.replace(/<h([1-6])([^>]*)>(.*?)<\/h\1>/gi, (m, level, attrs, content) => {
        const text = content.replace(/<[^>]*>/g, "").trim();
        if (/id\s*=/.test(attrs)) return m;
        return `<h${level} id="${slugify(text)}"${attrs}>${content}</h${level}>`;
      });
      return { output: `${toc}\n\n<!-- HTML with heading ids added -->\n${idHtml}` };
    }
  };
