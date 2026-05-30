import { field, select, checkbox, textarea, htmlEscape } from "../tool-core.js";

export default {
  form: `
    <div class="field-grid">
      ${select({ id: "ciConditionType", label: "Condition type", options: [
        {label:"style() — CSS variable/media query",value:"style"},
        {label:"media() — Media feature",value:"media"},
        {label:"supports() — Feature detection",value:"supports"}
      ], value: "style" })}
      ${field({ id: "ciCondition", label: "Condition", help: "style: --variant: large | media: width >= 768px | supports: (display: grid)", value: "--variant: large" })}
    </div>
    <div class="field-grid">
      ${field({ id: "ciTrue", label: "Value when true", value: "300px" })}
      ${field({ id: "ciFalse", label: "Value when false", value: "150px" })}
    </div>
    <div class="field-grid">
      ${field({ id: "ciProperty", label: "CSS property", value: "width" })}
      ${field({ id: "ciSelector", label: "Selector", value: ".responsive-card" })}
    </div>
    <div class="field-grid">
      ${field({ id: "ciFallback", label: "Fallback value (for unsupported browsers)", value: "150px" })}
      ${checkbox({ id: "ciToggle", label: "Show both states in preview", checked: true })}
    </div>`,
  generate(root) {
    const condType = root.querySelector("#ciConditionType").value;
    const condition = root.querySelector("#ciCondition").value.trim();
    const trueVal = root.querySelector("#ciTrue").value.trim() || "300px";
    const falseVal = root.querySelector("#ciFalse").value.trim() || "150px";
    const property = root.querySelector("#ciProperty").value.trim() || "width";
    const selector = root.querySelector("#ciSelector").value.trim() || ".responsive-card";
    const fallback = root.querySelector("#ciFallback").value.trim() || "150px";
    const showToggle = root.querySelector("#ciToggle").checked;

    const condFn = condType === "media" ? "media" : condType === "supports" ? "supports" : "style";
    const condStr = condFn === "media" ? `media(${condition})` : condFn === "supports" ? `supports(${condition})` : `style(${condition})`;
    const ifExpr = `if(${condStr}: ${trueVal} else ${falseVal})`;

    const lines = [];
    lines.push("/* CSS if() function — Chrome 137+ (style), Chrome 142+ (media/supports) */");
    lines.push("/* Inline conditional values in CSS. Evaluate a condition and pick one of two values. */");
    lines.push("");
    lines.push(`${selector} {`);
    lines.push(`  ${property}: ${fallback}; /* fallback for browsers without if() */`);
    lines.push(`  ${property}: ${ifExpr};`);
    lines.push(`}`);
    lines.push("");
    lines.push("/* Browser support: */");
    lines.push("/* style() conditions: Chrome 137+, Edge 137+ */");
    lines.push("/* media()/supports() conditions: Chrome 142+, Edge 142+ */");
    lines.push("/* Firefox and Safari support is in development. Always provide a fallback value. */");
    lines.push("");
    lines.push("/* How it works: */");
    lines.push(`/* 1. Browser evaluates ${condStr} */`);
    lines.push(`/* 2. If true  → ${property}: ${trueVal} */`);
    lines.push(`/* 3. If false → ${property}: ${falseVal} */`);
    if (condType === "style") {
      lines.push("");
      lines.push("/* Toggle the condition in HTML: */");
      lines.push(`/* <div style="--variant: large"> → width: ${trueVal} */`);
      lines.push(`/* <div style="--variant: small"> → width: ${falseVal} */`);
    }

    // Preview
    const previewCards = showToggle ? `
      <div style="display:flex;gap:12px;flex-wrap:wrap">
        <div style="flex:1;min-width:150px;border:1px solid #22c55e;border-radius:10px;padding:16px;background:#f0fdf4;text-align:center">
          <div style="font-size:12px;font-weight:600;color:#15803d;margin-bottom:8px">Condition: TRUE</div>
          <div style="background:#fff;border:1px solid #d1d5db;border-radius:6px;padding:12px;${property}:${trueVal};margin:0 auto;display:inline-block;max-width:100%;overflow:hidden">
            <div style="font-size:13px;font-weight:600">${trueVal}</div>
          </div>
          <div style="font-size:11px;color:#6b7280;margin-top:6px">${property}: ${trueVal}</div>
        </div>
        <div style="flex:1;min-width:150px;border:1px solid #ef4444;border-radius:10px;padding:16px;background:#fef2f2;text-align:center">
          <div style="font-size:12px;font-weight:600;color:#dc2626;margin-bottom:8px">Condition: FALSE</div>
          <div style="background:#fff;border:1px solid #d1d5db;border-radius:6px;padding:12px;${property}:${falseVal};margin:0 auto;display:inline-block;max-width:100%;overflow:hidden">
            <div style="font-size:13px;font-weight:600">${falseVal}</div>
          </div>
          <div style="font-size:11px;color:#6b7280;margin-top:6px">${property}: ${falseVal}</div>
        </div>
      </div>
    ` : `
      <div style="border:1px solid #e5e7eb;border-radius:10px;padding:16px;background:#f9fafb;text-align:center">
        <div style="font-size:13px;margin-bottom:8px">True state: <code style="background:#f3f4f6;padding:1px 4px;border-radius:3px">${property}: ${trueVal}</code></div>
        <div style="background:#fff;border:1px dashed #d1d5db;border-radius:6px;padding:12px;${property}:${trueVal};margin:0 auto;display:inline-block;max-width:100%"></div>
      </div>
    `;

    const preview = `<div>
      <p style="margin:0 0 10px;font-size:12px;color:#6b7280">Condition: <code style="background:#f3f4f6;padding:1px 4px;border-radius:3px">${condStr}</code></p>
      ${previewCards}
      <p style="margin:8px 0 0;font-size:11px;color:#6b7280">CSS if() lets you write conditional values inline, replacing many @media and @container query patterns with a single declaration.</p>
    </div>`;

    return { output: lines.join("\n"), preview };
  }
};
