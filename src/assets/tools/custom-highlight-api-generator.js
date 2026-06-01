import { field, textarea, select, checkbox, htmlEscape } from "../tool-core.js";

export default {
  form: `
    <div class="field-grid">
      ${field({ id: "chRanges", label: "CSS selector(s) to highlight", value: ".search-match", help: "One or more comma-separated selectors" })}
      ${field({ id: "chName", label: "Highlight name", value: "search-highlight" })}
    </div>
    <div class="field-grid">
      ${field({ id: "chBg", label: "Background color", value: "#fef08a", type: "color" })}
      ${field({ id: "chColor", label: "Text color", value: "inherit" })}
    </div>
    <div class="field-grid">
      ${field({ id: "chPriority", label: "Priority (0-100)", type: "number", value: "10" })}
      ${select({ id: "chType", label: "Highlight type", options: [
        {label:"Highlight",value:"highlight"},
        {label:"Spelling error",value:"spelling-error"},
        {label:"Grammar error",value:"grammar-error"}
      ], value: "highlight" })}
    </div>`,
  generate(root) {
    const ranges = root.querySelector("#chRanges").value.trim() || ".search-match";
    const name = root.querySelector("#chName").value.trim() || "search-highlight";
    const bg = root.querySelector("#chBg").value.trim() || "#fef08a";
    const color = root.querySelector("#chColor").value.trim() || "inherit";
    const priority = root.querySelector("#chPriority").value || "10";
    const type = root.querySelector("#chType").value;

    const lines = [];
    lines.push("// Custom Highlights API — Baseline 2026");
    lines.push("// Browser: Chrome 105+, Edge 105+, Safari 17.2+, Firefox ✗ (planned)");
    lines.push("// Style arbitrary text ranges without modifying the DOM.");
    lines.push("");
    lines.push("/* CSS: Highlight pseudo-element */");
    lines.push(`::highlight(${name}) {`);
    lines.push(`  background-color: ${bg};`);
    if (color !== "inherit") lines.push(`  color: ${color};`);
    lines.push(`}`);
    lines.push("");
    lines.push("/* JavaScript: Create and apply highlight ranges */");
    lines.push(`const highlight = new Highlight();`);
    lines.push(`CSS.highlights.set('${name}', highlight);`);
    lines.push("");
    lines.push("// Find text nodes matching the selector and create ranges");
    lines.push(`document.querySelectorAll('${ranges}').forEach(el => {`);
    lines.push("  const range = new StaticRange({");
    lines.push("    startContainer: el.firstChild || el,");
    lines.push("    startOffset: 0,");
    lines.push("    endContainer: el.firstChild || el,");
    lines.push("    endOffset: (el.textContent || '').length");
    lines.push("  });");
    lines.push("  highlight.add(range);");
    lines.push("});");
    lines.push("");
    lines.push("// Notes:");
    lines.push("// 1. Highlights paint over the rendered page without affecting layout or DOM.");
    lines.push("// 2. Multiple highlights can overlap — use priority to control stacking.");
    lines.push("// 3. Useful for find-in-page, search result highlighting, and syntax highlighting.");
    lines.push("// 4. Unlike Selection API, highlights persist and don't interfere with user selection.");

    let overlayColor = bg;
    try {
      const hex = bg.replace("#", "");
      overlayColor = `rgba(${parseInt(hex.slice(0,2),16)},${parseInt(hex.slice(2,4),16)},${parseInt(hex.slice(4,6),16)},0.4)`;
    } catch {}

    const preview = `<div style="border:1px solid #e5e7eb;border-radius:10px;overflow:hidden">
      <div style="padding:16px;font-size:14px;line-height:1.8;background:#fff">
        <p style="margin:0">The quick brown fox <mark style="background:${bg};color:${color};border-radius:2px;padding:0 2px">jumps over</mark> the lazy dog. Custom Highlights API styles <mark style="background:${bg};color:${color};border-radius:2px;padding:0 2px">text ranges</mark> without touching the DOM.</p>
      </div>
      <div style="background:#f9fafb;padding:8px 14px;font-size:11px;color:#6b7280;border-top:1px solid #e5e7eb">
        ::highlight(${name}) &middot; priority: ${priority} &middot; type: ${type}
      </div>
    </div>`;

    return { output: lines.join("\n"), preview };
  }
};
