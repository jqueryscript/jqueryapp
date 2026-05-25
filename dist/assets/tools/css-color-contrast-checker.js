import { field, textarea, select, checkbox, htmlEscape, attrEscape, normalizeUrl } from "../tool-core.js";

export default {
    form: `
      <div class="field-grid">
        ${field({ id: "fgColor", label: "Foreground color", value: "#333333", type: "color" })}
        ${field({ id: "bgColor", label: "Background color", value: "#ffffff", type: "color" })}
      </div>`,
    generate(root) {
      const fg = root.querySelector("#fgColor").value;
      const bg = root.querySelector("#bgColor").value;
      const ratio = contrastRatio(fg, bg);
      const lines = [
        `Contrast ratio: ${ratio.toFixed(2)}:1`,
        "",
        "WCAG AA:",
        `  Normal text (4.5:1): ${ratio >= 4.5 ? "PASS" : "FAIL"}`,
        `  Large text (3:1):    ${ratio >= 3 ? "PASS" : "FAIL"}`,
        "",
        "WCAG AAA:",
        `  Normal text (7:1):   ${ratio >= 7 ? "PASS" : "FAIL"}`,
        `  Large text (4.5:1):  ${ratio >= 4.5 ? "PASS" : "FAIL"}`
      ].join("\n");
      const preview = `<div style="padding:1rem;background-color:${bg};color:${fg};font-size:1.25rem;border-radius:4px;border:1px solid #ddd">Sample Text</div>`;
      return { output: lines, preview };
    }
  };
