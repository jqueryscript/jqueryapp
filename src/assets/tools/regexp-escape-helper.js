import { field, textarea, select, checkbox, htmlEscape } from "../tool-core.js";

export default {
  form: `
    <div class="field-grid">
      ${textarea({ id: "reInput", label: "String(s) to escape (one per line)", value: "example.com?q=hello&lang=en\nprice: $19.99 (tax included)\n./node_modules/@scope/package", full: true })}
    </div>
    <div class="field-grid">
      ${checkbox({ id: "reShowOld", label: "Show old manual escape for comparison", checked: true })}
      ${checkbox({ id: "reShowFull", label: "Show full RegExp usage example", checked: false })}
    </div>`,
  generate(root) {
    const input = root.querySelector("#reInput").value.trim();
    const inputs = input ? input.split("\n").filter(Boolean) : ["example.com?q=hello"];
    const showOld = root.querySelector("#reShowOld").checked;
    const showFull = root.querySelector("#reShowFull").checked;

    const lines = [];
    lines.push("// RegExp.escape() — Baseline 2025");
    lines.push("// Browser: Chrome 132+, Edge 132+, Safari 18.2+, Firefox 138+");
    lines.push("// Escapes special regex characters in a string for safe pattern matching.");
    lines.push("");

    inputs.forEach((str, i) => {
      const trimmed = str.trim();
      lines.push(`// Input: "${trimmed}"`);
      lines.push(`const escaped${i} = RegExp.escape("${trimmed}");`);
      // Show result
      const escaped = trimmed.replace(/[.*+?^${}()|[\]\\\/]/g, "\\$&");
      lines.push(`// Escaped: "${escaped}"`);
      lines.push("");
    });

    if (showOld) {
      lines.push("// Old manual approach (no longer needed):");
      lines.push("// str.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\\\$&');");
      lines.push("// RegExp.escape() is simpler, standardized, and handles edge cases consistently.");
      lines.push("");
    }

    if (showFull) {
      lines.push("// Usage: Build a dynamic RegExp safely");
      lines.push("function searchPattern(userInput) {");
      lines.push("  const escaped = RegExp.escape(userInput);");
      lines.push("  return new RegExp(escaped, 'gi');");
      lines.push("}");
      lines.push("const pattern = searchPattern('example.com?q=');");
      lines.push("pattern.test('Visit example.com?q=search'); // true");
    }

    lines.push("");
    lines.push("// Notes:");
    lines.push("// 1. RegExp.escape() escapes: ^ $ \\ . * + ? ( ) [ ] { } | /");
    lines.push("// 2. Essential for building dynamic regex from user input (search, filters, URL matching).");
    lines.push("// 3. Replaces error-prone manual escape functions used in libraries for years.");

    const rows = inputs.map(s => {
      const t = s.trim();
      const e = t.replace(/[.*+?^${}()|[\]\\\/]/g, "\\$&");
      return `<tr><td style="padding:5px 10px;font-family:monospace;font-size:12px;word-break:break-all">${t}</td><td style="padding:5px 10px;font-family:monospace;font-size:12px;color:#8b5cf6">${e}</td></tr>`;
    }).join("");

    const preview = `<div style="border:1px solid #e5e7eb;border-radius:10px;overflow:hidden">
      <table style="width:100%;border-collapse:collapse">
        <thead><tr style="background:#f9fafb;font-size:11px;color:#6b7280;text-align:left">
          <th style="padding:5px 10px">Input</th><th style="padding:5px 10px">RegExp.escape()</th>
        </tr></thead>
        <tbody>${rows}</tbody>
      </table>
    </div>`;

    return { output: lines.join("\n"), preview };
  }
};
