import { field, textarea, select, checkbox, htmlEscape, attrEscape, normalizeUrl } from "../tool-core.js";

export default {
    form: `
      ${select({ id: "dvUnit", label: "Viewport unit", options: [
        { label: "dvh (dynamic height)", value: "dvh" },
        { label: "svh (small height)", value: "svh" },
        { label: "lvh (large height)", value: "lvh" },
        { label: "dvw (dynamic width)", value: "dvw" },
        { label: "svw (small width)", value: "svw" },
        { label: "lvw (large width)", value: "lvw" }
      ], value: "dvh" })}
      ${field({ id: "dvValue", label: "Value", value: "100", type: "number" })}
      ${select({ id: "dvProperty", label: "CSS property", options: [
        { label: "min-height", value: "min-height" },
        { label: "height", value: "height" },
        { label: "max-height", value: "max-height" },
        { label: "min-width", value: "min-width" },
        { label: "width", value: "width" },
        { label: "max-width", value: "max-width" }
      ], value: "min-height" })}
      ${field({ id: "dvFallback", label: "Fallback vh/vw value", value: "100", type: "number" })}
      ${field({ id: "dvSelector", label: "Selector", value: ".full-height-section" })}`,
    generate(root) {
      const unit = root.querySelector("#dvUnit").value;
      const value = root.querySelector("#dvValue").value || "100";
      const property = root.querySelector("#dvProperty").value;
      const fallback = root.querySelector("#dvFallback").value || "100";
      const selector = root.querySelector("#dvSelector").value || ".element";
      const fallbackUnit = unit.endsWith("vh") ? "vh" : "vw";
      let behavior;
      if (unit === "dvh") behavior = "dvh adjusts as the viewport dynamically changes (e.g., when the browser chrome shows/hides on mobile).";
      else if (unit === "svh") behavior = "svh uses the smallest possible viewport size. Content stays visible even when the browser chrome is visible.";
      else if (unit === "lvh") behavior = "lvh uses the largest possible viewport size. Content may be hidden behind browser chrome.";
      else if (unit === "dvw") behavior = "dvw adjusts as the viewport dynamically changes width.";
      else if (unit === "svw") behavior = "svw uses the smallest possible viewport width.";
      else behavior = "lvw uses the largest possible viewport width.";
      const output = '/* Dynamic viewport units: ' + unit + '\n' +
        '   Behavior: ' + behavior + '\n' +
        '   Browser support: Supported in modern browsers (Chrome 108+, Firefox 101+, Safari 15.4+). */\n\n' +
        selector + ' {\n  ' + property + ': ' + value + fallbackUnit + ';\n' +
        '  ' + property + ': ' + value + unit + ';\n}';
      const preview = '<div style="font-family:monospace;font-size:0.875rem;line-height:1.6;background:#1e293b;color:#e2e8f0;padding:1rem;border-radius:6px;white-space:pre-wrap">' + htmlEscape(output) + '</div>';
      return { output, preview };
    }
  };
