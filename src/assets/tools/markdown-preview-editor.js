import { textarea, checkbox, htmlEscape } from "../tool-core.js";

const defaultMarkdown = [
  "# Hello World",
  "",
  "This is **bold** and *italic*.",
  "",
  "- List item 1",
  "- List item 2",
  "",
  "[Link](https://example.com)",
  "",
  "`inline code`",
  "",
  "> Blockquote",
  "",
  "---",
  "",
  "## Code",
  "```js",
  "console.log('hi');",
  "```"
].join("\n");

export default {
  form: `
    <div class="field-grid">
      ${textarea({ id: "mdInput", label: "Markdown input", value: defaultMarkdown, full: true })}
    </div>
    <div class="field-grid">
      ${checkbox({ id: "mdSplit", label: "Split editor/preview", checked: true })}
      ${checkbox({ id: "mdGfm", label: "GitHub-Flavored Markdown (tables, task lists)", checked: true })}
    </div>`,
  generate(root) {
    const input = root.querySelector("#mdInput").value;
    const split = root.querySelector("#mdSplit").checked;
    const gfm = root.querySelector("#mdGfm").checked;

    if (!input) return { output: "", preview: "" };

    const html = parseMarkdown(input, gfm);
    const wordCount = input.split(/\s+/).filter(Boolean).length;
    const charCount = input.length;

    const info = `Words: ${wordCount} | Characters: ${charCount} | Lines: ${input.split("\n").length}`;
    const output = html;

    const preview = `<div style="display:${split?'grid':'block'};grid-template-columns:1fr 1fr;gap:12px">
      ${split ? `<div style="border:1px solid #e5e7eb;border-radius:8px;padding:12px;background:#f9fafb;font-family:monospace;font-size:13px;white-space:pre-wrap;overflow-y:auto;max-height:500px">${htmlEscape(input)}</div>` : ""}
      <div style="border:1px solid #e5e7eb;border-radius:8px;padding:16px;background:#fff;overflow-y:auto;max-height:500px;line-height:1.7;font-size:15px;color:#374151" class="md-preview">${html}</div>
    </div>
    <div style="margin-top:8px;font-size:11px;color:#6b7280">${info}</div>`;

    return { output, preview };
  }
};

function parseMarkdown(md, gfm) {
  let html = htmlEscape(md);
  // Code blocks (must be first)
  html = html.replace(/```(\w*)\n([\s\S]*?)```/g, (_, lang, code) => `<pre><code class="language-${lang}">${code.trim()}</code></pre>`);
  // Inline code
  html = html.replace(/`([^`]+)`/g, "<code>$1</code>");
  // Headers
  html = html.replace(/^#### (.+)$/gm, "<h4>$1</h4>");
  html = html.replace(/^### (.+)$/gm, "<h3>$1</h3>");
  html = html.replace(/^## (.+)$/gm, "<h2>$1</h2>");
  html = html.replace(/^# (.+)$/gm, "<h1>$1</h1>");
  // Bold and italic
  html = html.replace(/\*\*\*(.+?)\*\*\*/g, "<strong><em>$1</em></strong>");
  html = html.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  html = html.replace(/\*(.+?)\*/g, "<em>$1</em>");
  // Images
  html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img alt="$1" src="$2" style="max-width:100%">');
  // Links
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
  // Horizontal rule
  html = html.replace(/^---$/gm, "<hr>");
  // Blockquote
  html = html.replace(/^> (.+)$/gm, "<blockquote>$1</blockquote>");
  // Unordered lists
  html = html.replace(/^[\-\*] (.+)$/gm, "<li>$1</li>");
  html = html.replace(/(<li>.*<\/li>\n?)+/g, "<ul>$&</ul>");
  // Ordered lists
  html = html.replace(/^\d+\. (.+)$/gm, "<li>$1</li>");
  // GFM tables
  if (gfm) {
    html = html.replace(/^\|(.+)\|\n\|[-\s|]+\|\n((?:^\|.+\|\n?)+)/gm, (_, header, rows) => {
      const hcells = header.split("|").filter(c => c.trim());
      const rrows = rows.trim().split("\n").map(r => r.split("|").filter(c => c.trim()));
      const thead = "<thead><tr>" + hcells.map(c => `<th>${c.trim()}</th>`).join("") + "</tr></thead>";
      const tbody = "<tbody>" + rrows.map(r => "<tr>" + r.map(c => `<td>${c.trim()}</td>`).join("") + "</tr>").join("") + "</tbody>";
      return `<table>${thead}${tbody}</table>`;
    });
    // Task lists
    html = html.replace(/<li>\[ \] (.+?)<\/li>/g, '<li><input type="checkbox" disabled> $1</li>');
    html = html.replace(/<li>\[x\] (.+?)<\/li>/g, '<li><input type="checkbox" checked disabled> $1</li>');
  }
  // Paragraphs: wrap remaining text blocks
  html = html.replace(/\n\n/g, "</p><p>");
  html = "<p>" + html + "</p>";
  html = html.replace(/<p>\s*<\/p>/g, "");
  html = html.replace(/<p>(<(?:h[1-4]|ul|ol|pre|blockquote|hr|table|img)[\s\S]*?)<\/p>/g, "$1");
  return html;
}
