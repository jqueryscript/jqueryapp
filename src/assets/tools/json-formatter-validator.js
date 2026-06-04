import { field, textarea, checkbox, select, htmlEscape } from "../tool-core.js";

export default {
  form: `
    <div class="field-grid">
      ${textarea({ id: "jfvInput", label: "Paste JSON", value: '{"name":"example","version":1,"items":[{"id":1,"active":true},{"id":2,"active":false}]}', full: true })}
    </div>
    <div class="field-grid">
      ${select({ id: "jfvAction", label: "Action", options: [
        {label:"Format (pretty-print)",value:"format"},
        {label:"Validate only",value:"validate"},
        {label:"Minify / compact",value:"minify"},
        {label:"Tree view",value:"tree"}
      ], value: "format" })}
      ${field({ id: "jfvIndent", label: "Indent spaces", type: "number", value: "2", attrs: 'style="width:56px;flex:none"' })}
    </div>
    <div class="field-grid">
      ${checkbox({ id: "jfvSort", label: "Sort keys alphabetically", checked: false })}
      ${checkbox({ id: "jfvTrailing", label: "Detect trailing commas", checked: true })}
    </div>`,
  generate(root) {
    const input = root.querySelector("#jfvInput").value.trim();
    const action = root.querySelector("#jfvAction").value;
    const indent = parseInt(root.querySelector("#jfvIndent").value) || 2;
    const sort = root.querySelector("#jfvSort").checked;
    const trailing = root.querySelector("#jfvTrailing").checked;

    if (!input) return { output: "Paste JSON to get started.", preview: "" };

    try {
      // Fix trailing commas
      let cleaned = input;
      if (trailing) cleaned = input.replace(/,(\s*[}\]])/g, "$1");
      const parsed = JSON.parse(cleaned);
      const sorted = sort ? sortKeys(parsed) : parsed;

      let output = "";
      if (action === "validate") {
        output = `✓ Valid JSON\n\nType: ${Array.isArray(sorted) ? "Array" : typeof sorted === "object" ? "Object" : typeof sorted}\n${Array.isArray(sorted) ? `Items: ${sorted.length}` : `Keys: ${Object.keys(sorted).length}`}\nSize: ${(input.length / 1024).toFixed(1)} KB`;
      } else if (action === "minify") {
        output = JSON.stringify(sorted);
      } else if (action === "tree") {
        output = buildTree(sorted);
      } else {
        output = JSON.stringify(sorted, null, indent);
      }

      const preview = action === "validate"
        ? `<div style="padding:16px;background:#f0fdf4;border:1px solid #22c55e;border-radius:8px;text-align:center"><span style="color:#15803d;font-size:18px;font-weight:700">✓ Valid JSON</span><div style="color:#6b7280;font-size:13px;margin-top:4px">${Array.isArray(sorted) ? `${sorted.length} items` : `${Object.keys(sorted).length} keys`} · ${(input.length/1024).toFixed(1)} KB</div></div>`
        : "";

      return { output, preview };
    } catch (e) {
      const msg = e.message;
      const lineCol = msg.match(/position (\d+)/);
      const pos = lineCol ? parseInt(lineCol[1]) : -1;
      let preview = `<div style="padding:16px;background:#fef2f2;border:1px solid #ef4444;border-radius:8px"><span style="color:#dc2626;font-size:16px;font-weight:700">✗ Invalid JSON</span><div style="color:#6b7280;font-size:13px;margin-top:4px">${msg}`;
      if (pos >= 0) {
        const ctx = input.substring(Math.max(0, pos - 20), Math.min(input.length, pos + 20));
        preview += `<div style="font-family:monospace;font-size:12px;margin-top:6px;background:#fff;padding:6px;border-radius:4px">...${ctx}...</div>`;
      }
      preview += "</div>";
      return { output: `✗ Invalid JSON\n\n${msg}\n${pos >= 0 ? `Error near position ${pos}` : ""}`, preview };
    }
  }
};

function sortKeys(obj) {
  if (Array.isArray(obj)) return obj.map(sortKeys);
  if (obj && typeof obj === "object") {
    return Object.keys(obj).sort().reduce((acc, k) => { acc[k] = sortKeys(obj[k]); return acc; }, {});
  }
  return obj;
}

function buildTree(obj, prefix = "") {
  if (Array.isArray(obj)) {
    return obj.map((v, i) => `${prefix}[${i}]: ${typeof v === "object" ? (Array.isArray(v) ? `Array(${v.length})` : `Object(${Object.keys(v).length})`) : JSON.stringify(v)}` + (typeof v === "object" ? "\n" + buildTree(v, prefix + "  ") : "")).join("\n");
  }
  if (obj && typeof obj === "object") {
    return Object.entries(obj).map(([k, v]) => `${prefix}${k}: ${typeof v === "object" ? (Array.isArray(v) ? `Array(${v.length})` : `Object(${Object.keys(v).length})`) : JSON.stringify(v)}` + (typeof v === "object" ? "\n" + buildTree(v, prefix + "  ") : "")).join("\n");
  }
  return JSON.stringify(obj);
}
