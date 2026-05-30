import { field, select, checkbox, htmlEscape } from "../tool-core.js";

export default {
  form: `
    <div class="field-grid">
      ${field({ id: "ccBg", label: "Background color", value: "#3b82f6", type: "color" })}
      ${select({ id: "ccMode", label: "Contrast mode", options: [{label:"Auto (pick any)",value:"auto"},{label:"High (max contrast)",value:"high"}], value: "auto" })}
    </div>
    <div class="field-grid">
      ${field({ id: "ccLight", label: "Light text color", value: "#ffffff", type: "color" })}
      ${field({ id: "ccDark", label: "Dark text color", value: "#111827", type: "color" })}
    </div>
    <div class="field-grid">
      ${field({ id: "ccColor3", label: "Third candidate color", value: "#fbbf24", type: "color", attrs: 'style="width:56px;flex:none"' })}
      ${field({ id: "ccSelector", label: "CSS selector", value: ".card" })}
    </div>
    <div class="field-grid">
      ${checkbox({ id: "ccVar", label: "Use CSS custom property", checked: true })}
      ${field({ id: "ccVarName", label: "Variable name", value: "--card-bg", attrs: 'style="width:120px;flex:none"' })}
    </div>`,
  generate(root) {
    const bg = root.querySelector("#ccBg").value.trim() || "#3b82f6";
    const mode = root.querySelector("#ccMode").value;
    const light = root.querySelector("#ccLight").value.trim() || "#ffffff";
    const dark = root.querySelector("#ccDark").value.trim() || "#111827";
    const color3 = root.querySelector("#ccColor3").value.trim() || "#fbbf24";
    const selector = root.querySelector("#ccSelector").value.trim() || ".card";
    const useVar = root.querySelector("#ccVar").checked;
    const varName = root.querySelector("#ccVarName").value.trim() || "--card-bg";

    const maxArg = mode === "high" ? " to max" : "";
    const funcCall = `contrast-color(${bg} vs ${light}, ${dark}${maxArg})`;

    const lines = [];
    if (useVar) {
      lines.push(`/* Custom property with contrast-color() fallback */`);
      lines.push(`${selector} {`);
      lines.push(`  ${varName}: ${bg};`);
      lines.push(`  background: var(${varName});`);
      lines.push(`  color: ${funcCall};`);
      if (color3) lines.push(`  /* Additional candidate: ${color3} */`);
      lines.push(`}`);
    } else {
      lines.push(`/* Direct contrast-color() usage */`);
      lines.push(`${selector} {`);
      lines.push(`  background: ${bg};`);
      lines.push(`  color: ${funcCall};`);
      if (color3) lines.push(`  /* Additional candidate: ${color3} */`);
      lines.push(`}`);
    }
    lines.push("");
    lines.push("/* Fallback for browsers without contrast-color() */");
    lines.push(`${selector} {`);
    lines.push(`  background: ${bg};`);
    lines.push(`  color: ${light}; /* fallback */`);
    lines.push(`  @supports (color: contrast-color(${bg} vs ${light}, ${dark}${maxArg})) {`);
    lines.push(`    color: ${funcCall};`);
    lines.push(`  }`);
    lines.push(`}`);
    lines.push("");
    lines.push("/* Browser support: Baseline 2026 (Chrome 132+, Edge 132+, Safari 19+, Firefox 136+) */");
    lines.push("/* contrast-color() automatically selects the text color with the best contrast ratio. */");
    lines.push("/* High mode picks the candidate with the maximum possible contrast. */");

    // Preview: compute actual contrast ratios and show which color wins
    const hexToRgb = (hex) => {
      const r = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return r ? { r: parseInt(r[1], 16), g: parseInt(r[2], 16), b: parseInt(r[3], 16) } : null;
    };
    const luminance = (rgb) => {
      if (!rgb) return 0;
      const [rs, gs, bs] = [rgb.r, rgb.g, rgb.b].map(c => {
        const s = c / 255;
        return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
      });
      return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
    };
    const contrast = (a, b) => {
      const la = luminance(a), lb = luminance(b);
      return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
    };
    const bgRgb = hexToRgb(bg);
    const candidates = [light, dark];
    if (color3 && color3 !== light && color3 !== dark) candidates.push(color3);
    const ratios = candidates.map(c => ({ color: c, ratio: contrast(hexToRgb(c), bgRgb) }));
    const winner = mode === "high"
      ? ratios.reduce((a, b) => a.ratio > b.ratio ? a : b)
      : ratios.reduce((a, b) => a.ratio > b.ratio ? a : b);

    const swatches = candidates.map(c => {
      const r = ratios.find(x => x.color === c);
      const isWin = c === winner.color;
      return `<div style="display:flex;align-items:center;gap:8px;padding:4px 0">
        <div style="width:24px;height:24px;border-radius:50%;background:${c};border:2px solid ${isWin ? '#22c55e' : '#e5e7eb'};flex:none"></div>
        <span style="font-size:13px;font-family:monospace;${isWin ? 'font-weight:700' : ''}">${c}</span>
        <span style="font-size:12px;color:#6b7280">${r.ratio.toFixed(2)}:1${isWin ? ' ✓' : ''}</span>
      </div>`;
    }).join("");

    const preview = `<div style="display:flex;gap:12px;flex-wrap:wrap;align-items:flex-start">
      <div style="flex:1;min-width:180px;background:${bg};border-radius:10px;padding:20px;text-align:center">
        <div style="color:${winner.color};margin-bottom:8px">
          <div style="font-size:24px;font-weight:700">Aa</div>
          <div style="font-size:14px;margin-top:4px">Selected text color: <code style="background:rgba(0,0,0,0.1);padding:1px 4px;border-radius:3px">${winner.color}</code></div>
          <div style="font-size:11px;margin-top:6px;opacity:0.8">Contrast: ${winner.ratio.toFixed(2)}:1 ${winner.ratio >= 4.5 ? '(AA ✓)' : winner.ratio >= 3 ? '(large only)' : '(fails)'}</div>
        </div>
      </div>
      <div style="flex:1;min-width:160px;border:1px solid #e5e7eb;border-radius:10px;padding:12px;background:#f9fafb">
        <div style="font-size:12px;font-weight:600;margin-bottom:8px;color:#374151">Candidate contrast ratios</div>
        ${swatches}
        <div style="margin-top:8px;padding-top:8px;border-top:1px solid #e5e7eb;font-size:11px;color:#6b7280">${mode === "high" ? "High mode: maximum contrast wins" : "Auto mode: best contrast wins"}</div>
      </div>
    </div>`;

    return { output: lines.join("\n"), preview };
  }
};
