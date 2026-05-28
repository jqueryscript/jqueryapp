import { field, select, checkbox, htmlEscape } from "../tool-core.js";

export default {
  form: `
    <div class="field-grid">
      ${field({ id: "frWidth", label: "Outline width (px)", type: "number", value: "3" })}
      ${field({ id: "frOffset", label: "Outline offset (px)", type: "number", value: "2" })}
    </div>
    <div class="field-grid">
      ${field({ id: "frColor", label: "Focus ring color", type: "color", value: "#2563eb" })}
      ${select({ id: "frStyle", label: "Outline style", options: [
        {label:"Solid",value:"solid"},
        {label:"Dashed",value:"dashed"},
        {label:"Dotted",value:"dotted"},
        {label:"Double",value:"double"}
      ], value: "solid" })}
    </div>
    <div class="field-grid">
      ${field({ id: "frSelector", label: "CSS selector", value: ":focus-visible" })}
      ${checkbox({ id: "frBoxShadow", label: "Add box-shadow fallback", checked: true })}
    </div>
    <div class="field-grid">
      ${field({ id: "frBg", label: "Background color (for contrast check)", type: "color", value: "#ffffff", help: "The background color behind the focused element." })}
    </div>`,
  generate(root) {
    const width = root.querySelector("#frWidth").value;
    const offset = root.querySelector("#frOffset").value;
    const color = root.querySelector("#frColor").value;
    const style = root.querySelector("#frStyle").value;
    const selector = root.querySelector("#frSelector").value.trim() || ":focus-visible";
    const addShadow = root.querySelector("#frBoxShadow").checked;
    const bgColor = root.querySelector("#frBg").value;

    const lines = [];

    // Contrast check
    const hexToRgb = (hex) => {
      const r = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return r ? { r: parseInt(r[1],16), g: parseInt(r[2],16), b: parseInt(r[3],16) } : null;
    };
    const relativeLum = (c) => {
      if (!c) return 0;
      const [rs, gs, bs] = [c.r, c.g, c.b].map(v => { const s = v/255; return s <= 0.03928 ? s/12.92 : Math.pow((s+0.055)/1.055, 2.4); });
      return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
    };

    const fg = hexToRgb(color);
    const bg = hexToRgb(bgColor);
    if (fg && bg) {
      const L1 = relativeLum(fg);
      const L2 = relativeLum(bg);
      const cr = (Math.max(L1, L2) + 0.05) / (Math.min(L1, L2) + 0.05);
      if (cr < 3) {
        lines.push(`/* Warning: Focus ring color (${color}) has a contrast ratio of ${cr.toFixed(1)}:1 against background (${bgColor}). */`);
        lines.push("/* WCAG requires at least 3:1 contrast for focus indicators. Consider a higher-contrast color. */", "");
      }
    }

    lines.push(`${selector} {`);
    if (addShadow) {
      lines.push("  outline: none;");
      lines.push(`  box-shadow: 0 0 0 ${width}px ${color};`);
    } else {
      lines.push(`  outline: ${width}px ${style} ${color};`);
      lines.push(`  outline-offset: ${offset}px;`);
    }
    lines.push("}", "");

    lines.push(
      "/* === Usage Notes === */",
      "/* 1. :focus-visible only shows the ring for keyboard navigation, not mouse clicks. */",
      "/* 2. For global focus styles, use :focus-visible on the html or body element. */",
      "/* 3. Never set outline: none without a replacement — it removes the default */",
      "/*    focus indicator, which is an accessibility violation (WCAG 2.4.7). */",
      "/* 4. If using box-shadow fallback, ensure sufficient contrast against all */",
      "/*    potential background colors on the page. */"
    );

    return { output: lines.join("\n") };
  }
};
