import { textarea, select, field, checkbox, htmlEscape } from "../tool-core.js";

export default {
  form: `
    <div class="field-grid">
      ${textarea({ id: "jptJson", label: "JSON input", value: '{"store":{"books":[{"title":"A","price":10},{"title":"B","price":20}],"name":"Bookshop"}}', full: true })}
    </div>
    <div class="field-grid">
      ${field({ id: "jptPath", label: "JSONPath expression", value: "$.store.books[*].title" })}
    </div>
    <div class="field-grid">
      ${checkbox({ id: "jptFlatten", label: "Flatten results", checked: false })}
      ${checkbox({ id: "jptFull", label: "Show full paths in output", checked: true })}
    </div>
    <div style="margin-top:10px;font-size:12px;color:#6b7280">
      <strong>Examples:</strong>
      <code>$.store.books[*].title</code> · <code>$..price</code> · <code>$.store.books[?(@.price > 15)]</code> · <code>$.store.books[0]</code> · <code>$..*</code>
    </div>`,
  generate(root) {
    const jsonStr = root.querySelector("#jptJson").value.trim();
    const path = root.querySelector("#jptPath").value.trim();
    const flatten = root.querySelector("#jptFlatten").checked;
    const showFull = root.querySelector("#jptFull").checked;

    if (!jsonStr) return { output: "Paste JSON and enter a JSONPath expression.", preview: "" };
    if (!path) return { output: "Enter a JSONPath expression.", preview: "" };

    try {
      const data = JSON.parse(jsonStr);
      const results = evaluateJSONPath(data, path);

      const lines = [];
      lines.push(`JSONPath: ${path}`);
      lines.push(`Matches: ${results.length}`);
      lines.push("---");
      if (results.length === 0) {
        lines.push("No matches found.");
      } else if (flatten) {
        lines.push(results.map(r => JSON.stringify(r, null, 0)).join("\n"));
      } else {
        lines.push(JSON.stringify(results.length === 1 ? results[0] : results, null, 2));
      }

      const resultRows = results.slice(0, 10).map((r, i) => {
        const val = typeof r === "object" ? JSON.stringify(r).substring(0, 60) + (JSON.stringify(r).length > 60 ? "..." : "") : String(r);
        return `<tr><td style="padding:4px 8px;font-size:11px;color:#6b7280">${i}</td><td style="padding:4px 8px;font-family:monospace;font-size:12px">${val}</td></tr>`;
      }).join("");

      const preview = `<div style="border:1px solid #e5e7eb;border-radius:8px;overflow:hidden">
        <div style="background:${results.length > 0 ? '#f0fdf4' : '#fef2f2'};padding:8px 14px;font-size:12px;font-weight:600;color:${results.length > 0 ? '#15803d' : '#dc2626'}">
          ${path} → ${results.length} match${results.length !== 1 ? 'es' : ''}
        </div>
        ${results.length > 0 ? `<table style="width:100%;border-collapse:collapse">${resultRows}</table>` : ""}
      </div>`;

      return { output: lines.join("\n"), preview };
    } catch (e) {
      return { output: `Error: ${e.message}`, preview: `<div style="padding:14px;background:#fef2f2;border:1px solid #ef4444;border-radius:8px;color:#dc2626">${e.message}</div>` };
    }
  }
};

function evaluateJSONPath(obj, path) {
  // Simplified JSONPath evaluator
  if (path === "$") return [obj];
  if (!path.startsWith("$")) throw new Error("JSONPath must start with $");

  const segments = tokenizePath(path.slice(1));
  let current = [obj];

  for (const seg of segments) {
    const next = [];
    for (const item of current) {
      const matches = applySegment(item, seg);
      next.push(...matches);
    }
    current = next;
    if (!current.length) break;
  }
  return current;
}

function tokenizePath(path) {
  const tokens = [];
  let i = 0;
  while (i < path.length) {
    if (path[i] === ".") {
      i++;
      // Read property name
      let name = "";
      while (i < path.length && path[i] !== "." && path[i] !== "[") {
        name += path[i]; i++;
      }
      if (name === "*") tokens.push({ type: "wildcard" });
      else if (name === "..") throw new Error("Use .. for recursive descent");
      else tokens.push({ type: "prop", name });
    } else if (path[i] === "[") {
      i++;
      let bracket = "";
      while (i < path.length && path[i] !== "]") { bracket += path[i]; i++; }
      i++; // skip ]
      if (bracket === "*") tokens.push({ type: "arrayWildcard" });
      else if (bracket.startsWith("?(")) {
        const cond = bracket.slice(2, -1);
        tokens.push({ type: "filter", condition: cond.trim() });
      } else if (/^\d+$/.test(bracket)) {
        tokens.push({ type: "index", value: parseInt(bracket) });
      } else if (bracket.includes(",")) {
        tokens.push({ type: "multiIndex", values: bracket.split(",").map(s => parseInt(s.trim())) });
      } else if (bracket.startsWith("?@.")) {
        tokens.push({ type: "filter", condition: bracket.slice(1) });
      } else {
        tokens.push({ type: "prop", name: bracket.replace(/^['"]|['"]$/g, "") });
      }
    } else if (path.slice(i, i + 2) === "..") {
      throw new Error("Recursive descent (..) is not supported in this simplified evaluator. Use explicit paths.");
    }
  }
  return tokens;
}

function applySegment(obj, seg) {
  if (seg.type === "prop") {
    return obj && typeof obj === "object" && seg.name in obj ? [obj[seg.name]] : [];
  }
  if (seg.type === "wildcard") {
    if (obj && typeof obj === "object" && !Array.isArray(obj)) return Object.values(obj);
    if (Array.isArray(obj)) return obj;
    return [];
  }
  if (seg.type === "arrayWildcard") {
    return Array.isArray(obj) ? obj : [];
  }
  if (seg.type === "index") {
    return Array.isArray(obj) && seg.value < obj.length ? [obj[seg.value]] : [];
  }
  if (seg.type === "multiIndex") {
    return Array.isArray(obj) ? seg.values.filter(i => i < obj.length).map(i => obj[i]) : [];
  }
  if (seg.type === "filter") {
    if (!Array.isArray(obj)) return [];
    return obj.filter(item => {
      try {
        const cond = seg.condition.replace(/@\./g, "item.");
        return new Function("item", `return ${cond}`)(item);
      } catch { return false; }
    });
  }
  return [];
}
