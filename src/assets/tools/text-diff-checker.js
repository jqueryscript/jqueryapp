import { textarea, checkbox, select, htmlEscape } from "../tool-core.js";

export default {
  form: `
    <div class="field-grid">
      ${textarea({ id: "tdLeft", label: "Original text", value: "The quick brown fox\njumps over the lazy dog\nnear the riverbank.", full: true })}
    </div>
    <div class="field-grid">
      ${textarea({ id: "tdRight", label: "Changed text", value: "The quick brown cat\njumps over the lazy dog\nnear the river.\nNew line added.", full: true })}
    </div>
    <div class="field-grid">
      ${select({ id: "tdMode", label: "Diff mode", options: [
        {label:"Line-by-line",value:"line"},
        {label:"Side-by-side",value:"side"}
      ], value: "line" })}
      ${checkbox({ id: "tdIgnoreCase", label: "Ignore case", checked: false })}
    </div>`,
  generate(root) {
    const left = root.querySelector("#tdLeft").value;
    const right = root.querySelector("#tdRight").value;
    const mode = root.querySelector("#tdMode").value;
    const ignoreCase = root.querySelector("#tdIgnoreCase").checked;

    if (!left && !right) return { output: "Enter text in both fields to compare.", preview: "" };

    const lLines = left.split("\n");
    const rLines = right.split("\n");
    const compare = (a, b) => ignoreCase ? a.toLowerCase() === b.toLowerCase() : a === b;
    const lines = [];
    let added = 0, removed = 0;

    // Simple LCS diff
    const maxLen = Math.max(lLines.length, rLines.length);
    const result = [];
    for (let i = 0; i < maxLen; i++) {
      if (i < lLines.length && i < rLines.length) {
        if (compare(lLines[i], rLines[i])) {
          result.push({ type: "same", left: lLines[i], right: rLines[i] });
        } else {
          result.push({ type: "change", left: lLines[i], right: rLines[i] });
          added++; removed++;
        }
      } else if (i < lLines.length) {
        result.push({ type: "removed", left: lLines[i], right: "" });
        removed++;
      } else {
        result.push({ type: "added", left: "", right: rLines[i] });
        added++;
      }
    }

    lines.push(`Lines: ${rLines.length} (${added} added, ${removed} removed)`);
    lines.push("---");
    result.forEach(r => {
      const prefix = r.type === "same" ? "  " : r.type === "added" ? "+ " : r.type === "removed" ? "- " : "~ ";
      if (r.type === "added") lines.push(`+ ${r.right}`);
      else if (r.type === "removed") lines.push(`- ${r.left}`);
      else if (r.type === "change") { lines.push(`- ${r.left}`); lines.push(`+ ${r.right}`); }
      else lines.push(`  ${r.left}`);
    });

    const renderRow = (r,i) => {
      const bg = r.type === "added" ? "#dcfce7" : r.type === "removed" ? "#fef2f2" : r.type === "change" ? "#fef3c7" : "transparent";
      const prefix = r.type === "added" ? "+" : r.type === "removed" ? "−" : r.type === "change" ? "~" : "";
      return mode === "side"
        ? `<tr style="background:${bg}"><td style="width:4%;padding:4px 8px;font-family:monospace;font-size:12px;color:#6b7280">${prefix}</td><td style="width:48%;padding:4px 8px;font-family:monospace;font-size:12px">${r.left||""}</td><td style="width:48%;padding:4px 8px;font-family:monospace;font-size:12px">${r.right||""}</td></tr>`
        : `<tr style="background:${bg}"><td style="width:4%;padding:4px 8px;font-family:monospace;font-size:12px;color:${r.type==="added"?"#15803d":r.type==="removed"?"#dc2626":"#6b7280"}">${prefix}</td><td style="padding:4px 8px;font-family:monospace;font-size:12px">${r.type==="added"?r.right:r.type==="removed"?r.left:r.right||r.left}</td></tr>`;
    };

    const preview = `<div style="border:1px solid #e5e7eb;border-radius:8px;overflow:hidden">
      <div style="background:#f0fdf4;padding:8px 14px;font-size:12px;color:#15803d;font-weight:600">${added} added · ${removed} removed</div>
      <table style="width:100%;border-collapse:collapse">${result.map(renderRow).join("")}</table>
    </div>`;

    return { output: lines.join("\n"), preview };
  }
};
