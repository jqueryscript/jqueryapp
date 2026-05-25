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
      return { output: lines.join("\n") };
    }
  };
