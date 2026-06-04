import { textarea, checkbox, select, field, htmlEscape } from "../tool-core.js";

export default {
  form: `
    <div class="field-grid">
      ${select({ id: "yjcDir", label: "Direction", options: [
        {label:"YAML → JSON",value:"yaml2json"},
        {label:"JSON → YAML",value:"json2yaml"}
      ], value: "yaml2json" })}
      ${field({ id: "yjcIndent", label: "Indent spaces", type: "number", value: "2", attrs: 'style="width:56px;flex:none"' })}
    </div>
    <div class="field-grid">
      ${textarea({ id: "yjcInput", label: "Input", value: 'name: example\nversion: 1\nitems:\n  - id: 1\n    active: true\n  - id: 2\n    active: false', full: true })}
    </div>`,
  generate(root) {
    const dir = root.querySelector("#yjcDir").value;
    const indent = parseInt(root.querySelector("#yjcIndent").value) || 2;
    const input = root.querySelector("#yjcInput").value.trim();

    if (!input) return { output: "Paste YAML or JSON to get started.", preview: "" };

    try {
      if (dir === "yaml2json") {
        const json = yamlToJson(input);
        const output = JSON.stringify(json, null, indent);
        return { output, preview: `<div style="padding:14px;background:#f0fdf4;border:1px solid #22c55e;border-radius:8px"><span style="color:#15803d;font-weight:600">YAML → JSON</span><div style="font-size:12px;color:#6b7280;margin-top:4px">${Object.keys(json).length} top-level keys · ${JSON.stringify(json).length} chars</div></div>` };
      } else {
        const parsed = JSON.parse(input);
        const output = jsonToYaml(parsed, indent);
        return { output, preview: `<div style="padding:14px;background:#f0fdf4;border:1px solid #22c55e;border-radius:8px"><span style="color:#15803d;font-weight:600">JSON → YAML</span></div>` };
      }
    } catch (e) {
      return { output: `✗ Conversion failed: ${e.message}`, preview: `<div style="padding:14px;background:#fef2f2;border:1px solid #ef4444;border-radius:8px;color:#dc2626">${e.message}</div>` };
    }
  }
};

function yamlToJson(yaml) {
  const lines = yaml.split("\n").filter(l => !l.trim().startsWith("#"));
  const stack = [{ obj: {}, key: "" }];
  let currentIndent = 0;

  for (const line of lines) {
    if (!line.trim()) continue;
    const trimmed = line.trimStart();
    const indent = line.length - trimmed.length;
    const isListItem = trimmed.startsWith("- ");

    while (indent < currentIndent && stack.length > 1) {
      stack.pop();
      currentIndent -= 2;
    }

    const parent = stack[stack.length - 1].obj;

    if (isListItem) {
      const value = trimmed.slice(2).trim();
      const arrKey = stack[stack.length - 1].key || "root";
      if (!Array.isArray(parent)) {
        const arr = [];
        for (const k of Object.keys(parent)) arr.push(parent[k]);
        stack[stack.length - 1].obj = arr;
      }
      const parsed = parseYamlValue(value);
      (stack[stack.length - 1].obj).push(typeof parsed === "string" ? parseYamlValue(value) : parsed);
    } else {
      const colonIdx = trimmed.indexOf(":");
      if (colonIdx >= 0) {
        const key = trimmed.slice(0, colonIdx).trim();
        const val = trimmed.slice(colonIdx + 1).trim();
        if (val) {
          parent[key] = parseYamlValue(val);
        } else {
          parent[key] = {};
          stack.push({ obj: parent[key], key });
          currentIndent = indent + 2;
        }
      }
    }
  }
  return stack[0].obj;
}

function parseYamlValue(v) {
  if (v === "true" || v === "false") return v === "true";
  if (v === "null" || v === "~") return null;
  if (/^-?\d+\.?\d*$/.test(v)) return Number(v);
  if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) return v.slice(1, -1);
  return v;
}

function jsonToYaml(obj, indent, depth = 0) {
  const pad = " ".repeat(depth * indent);
  if (Array.isArray(obj)) {
    return obj.map(item => {
      if (typeof item === "object" && item !== null) {
        const inner = jsonToYaml(item, indent, depth + 1);
        const firstLine = inner.split("\n")[0];
        return `${pad}- ${firstLine.trimStart()}\n${inner.split("\n").slice(1).join("\n")}`;
      }
      return `${pad}- ${JSON.stringify(item)}`;
    }).join("\n");
  }
  return Object.entries(obj).map(([k, v]) => {
    if (typeof v === "object" && v !== null) {
      return `${pad}${k}:\n${jsonToYaml(v, indent, depth + 1)}`;
    }
    return `${pad}${k}: ${JSON.stringify(v)}`;
  }).join("\n");
}
