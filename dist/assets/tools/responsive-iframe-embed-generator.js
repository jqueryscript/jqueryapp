import { field, textarea, select, checkbox, htmlEscape, attrEscape, normalizeUrl } from "../tool-core.js";

export default {
    form: `
      <div class="field-grid">
        ${field({ id: "src", label: "Iframe URL", value: "https://www.youtube.com/embed/dQw4w9WgXcQ", full: true })}
        ${field({ id: "title", label: "Iframe title", value: "Video tutorial", full: true })}
        ${select({
          id: "ratio",
          label: "Aspect ratio",
          value: "16 / 9",
          options: [
            { label: "16:9", value: "16 / 9" },
            { label: "4:3", value: "4 / 3" },
            { label: "1:1", value: "1 / 1" },
            { label: "21:9", value: "21 / 9" }
          ]
        })}
        ${field({ id: "className", label: "Wrapper class", value: "embed-frame" })}
        ${checkbox({ id: "lazy", label: "Lazy load iframe", checked: true })}
        ${checkbox({ id: "sandbox", label: "Add common sandbox permissions" })}
      </div>`,
    generate(root) {
      const src = root.querySelector("#src").value.trim();
      const title = root.querySelector("#title").value.trim();
      const ratio = root.querySelector("#ratio").value;
      const className = root.querySelector("#className").value.trim() || "embed-frame";
      const lazy = root.querySelector("#lazy").checked;
      const sandbox = root.querySelector("#sandbox").checked;
      const iframeAttrs = [
        `src="${attrEscape(src)}"`,
        `title="${attrEscape(title)}"`,
        lazy ? `loading="lazy"` : "",
        `referrerpolicy="strict-origin-when-cross-origin"`,
        sandbox ? `sandbox="allow-scripts allow-same-origin allow-presentation"` : "",
        `allowfullscreen`
      ].filter(Boolean).join("\n    ");
      return {
        output: `<div class="${attrEscape(className)}">\n  <iframe\n    ${iframeAttrs}\n  ></iframe>\n</div>\n\n<style>\n.${className} {\n  width: 100%;\n  aspect-ratio: ${ratio};\n}\n\n.${className} iframe {\n  width: 100%;\n  height: 100%;\n  border: 0;\n  display: block;\n}\n</style>`
      };
    }
  };
