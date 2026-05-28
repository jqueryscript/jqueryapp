import { field, textarea, select, checkbox, htmlEscape, attrEscape, normalizeUrl } from "../tool-core.js";

export default {
    form: `
      <div class="field-grid">
        ${field({ id: "cmBase", label: "Base color (hex)", value: "#3b82f6", type: "color" })}
        ${select({ id: "cmOutput", label: "Output type", options: [{label:"All variants",value:"all"},{label:"Hover (lighter)",value:"hover"},{label:"Active (darker)",value:"active"},{label:"Subtle background tint",value:"tint"},{label:"Border color",value:"border"},{label:"Muted text",value:"muted"}], value: "all" })}
      </div>`,
    generate(root) {
      const base = root.querySelector("#cmBase").value;
      const outputType = root.querySelector("#cmOutput").value;
      const variants = {
        hover: { label: "--color-hover", value: `color-mix(in oklab, ${base}, white 20%)`, comment: "Hover state (lighter)" },
        active: { label: "--color-active", value: `color-mix(in oklab, ${base}, black 20%)`, comment: "Active state (darker)" },
        tint: { label: "--color-bg-tint", value: `color-mix(in oklab, white 90%, ${base} 10%)`, comment: "Subtle background tint" },
        border: { label: "--color-border", value: `color-mix(in oklab, ${base}, black 30%)`, comment: "Border color" },
        muted: { label: "--color-muted-text", value: `color-mix(in oklab, ${base}, white 40%)`, comment: "Muted text color" }
      };
      const keys = outputType === "all" ? Object.keys(variants) : [outputType];
      const lines = [":root {"];
      keys.forEach((key) => {
        const v = variants[key];
        lines.push(`  ${v.label}: ${v.value}; /* ${v.comment} */`);
      });
      lines.push("}", "", "/* Browser support: Chrome 111+, Edge 111+, Safari 16.2+, Firefox 113+ */");

      const swatchKeys = outputType === "all" ? Object.keys(variants) : [outputType];
      const swatches = swatchKeys.map(key => {
        const v = variants[key];
        const resolveColor = (expr) => {
          // Simple visual approximation for preview: mix base with white/black based on percentage
          if (expr.includes("white 90%")) return base; // tint: mostly white bg, show base as text
          if (expr.includes("white 40%")) return base; // muted text
          return base;
        };
        // Generate an approximation color for the swatch
        let swatchColor = base;
        if (v.value.includes("white 20%")) swatchColor = base; // hover — slightly lighter
        if (v.value.includes("black 20%")) swatchColor = base; // active — slightly darker
        if (v.value.includes("white 90%")) swatchColor = base; // tint
        if (v.value.includes("black 30%")) swatchColor = base; // border
        if (v.value.includes("white 40%")) swatchColor = base; // muted
        return `<div style="display:flex;align-items:center;gap:8px;padding:4px 0"><div style="width:32px;height:32px;border-radius:6px;background:${v.value};border:1px solid #e5e7eb;flex:none"></div><code style="font-size:13px">${v.label}</code></div>`;
      }).join("");

      const preview = `<div style="padding:8px"><p style="margin:0 0 8px;font-size:13px;color:var(--text-secondary)">Base: <span style="display:inline-block;width:14px;height:14px;border-radius:3px;background:${base};vertical-align:middle;border:1px solid #ccc"></span> ${base}</p>${swatches}</div>`;

      return { output: lines.join("\n"), preview };
    }
  };
