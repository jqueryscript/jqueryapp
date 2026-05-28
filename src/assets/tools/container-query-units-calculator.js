import { field, select, htmlEscape } from "../tool-core.js";

export default {
  form: `
    <div class="field-grid">
      ${field({ id: "cqMin", label: "Minimum size (px)", type: "number", help: "Smallest value for the property. e.g. 16 (for 16px)", value: "16" })}
      ${field({ id: "cqMax", label: "Maximum size (px)", type: "number", help: "Largest value for the property. e.g. 48 (for 48px)", value: "48" })}
    </div>
    <div class="field-grid">
      ${field({ id: "cqContainerMin", label: "Min container width (px)", type: "number", help: "Container width where the minimum value applies. e.g. 320", value: "320" })}
      ${field({ id: "cqContainerMax", label: "Max container width (px)", type: "number", help: "Container width where the maximum value applies. e.g. 1200", value: "1200" })}
    </div>
    <div class="field-grid">
      ${select({ id: "cqUnit", label: "Container query unit", options: [
        {label:"cqi (container inline size)",value:"cqi"},
        {label:"cqw (container width)",value:"cqw"},
        {label:"cqb (container block size)",value:"cqb"},
        {label:"cqmin (min of cqi/cqb)",value:"cqmin"},
        {label:"cqmax (max of cqi/cqb)",value:"cqmax"}
      ], value: "cqi" })}
      ${field({ id: "cqProp", label: "CSS property", help: "e.g. font-size, padding, gap, margin", value: "font-size" })}
    </div>`,
  generate(root) {
    const minVal = parseFloat(root.querySelector("#cqMin").value) || 16;
    const maxVal = parseFloat(root.querySelector("#cqMax").value) || 48;
    const containerMin = parseFloat(root.querySelector("#cqContainerMin").value) || 320;
    const containerMax = parseFloat(root.querySelector("#cqContainerMax").value) || 1200;
    const unit = root.querySelector("#cqUnit").value;
    const prop = root.querySelector("#cqProp").value.trim() || "font-size";

    if (containerMin >= containerMax) {
      return { output: "The minimum container width must be less than the maximum container width." };
    }

    const range = containerMax - containerMin;
    const valueRange = maxVal - minVal;
    const slope = valueRange / range;
    const intercept = minVal - slope * containerMin;

    const lines = [
      `/* ${prop} using container query units */`,
      `/* ${minVal}px at ${containerMin}px container width */`,
      `/* ${maxVal}px at ${containerMax}px container width */`,
      "",
      `${prop}: clamp(`,
      `  ${minVal}px,`,
      `  calc(${intercept.toFixed(3)}px + ${(slope * 100).toFixed(3)}${unit}),`,
      `  ${maxVal}px`,
      `);`,
      "",
      "/* === Required Container Setup === */",
      "/* The parent container must have container-type set: */",
      "/* .container { container-type: inline-size; } */",
      "",
      "/* === Fallback Note === */",
      "/* If no query container ancestor exists, the browser falls back */",
      "/* to the initial containing block size (viewport), which may */",
      "/* produce values far larger than expected. Always test. */",
      "",
      "/* Browser support: Chrome 105+, Firefox 110+, Safari 16+, Edge 105+ */"
    ];

    return { output: lines.join("\n") };
  }
};
