import { field, textarea, select, checkbox, htmlEscape, attrEscape, normalizeUrl } from "../tool-core.js";

export default {
    form: `
      <div class="field-grid">
        ${field({ id: "ldSelector", label: "Root selector", value: ":root" })}
        ${checkbox({ id: "ldColorScheme", label: "Set color-scheme on root", checked: true })}
        ${field({ id: "ldLightBg", label: "Background (light)", value: "#ffffff" })}
        ${field({ id: "ldDarkBg", label: "Background (dark)", value: "#1a1a2e" })}
        ${field({ id: "ldLightText", label: "Text color (light)", value: "#1a1a2e" })}
        ${field({ id: "ldDarkText", label: "Text color (dark)", value: "#e5e7eb" })}
        ${field({ id: "ldLightAccent", label: "Accent / border (light)", value: "#e5e7eb" })}
        ${field({ id: "ldDarkAccent", label: "Accent / border (dark)", value: "#334155" })}
      </div>`,
    generate(root) {
      const rootSelector = root.querySelector("#ldSelector").value.trim() || ":root";
      const colorScheme = root.querySelector("#ldColorScheme").checked;
      const lightBg = root.querySelector("#ldLightBg").value.trim() || "#ffffff";
      const darkBg = root.querySelector("#ldDarkBg").value.trim() || "#1a1a2e";
      const lightText = root.querySelector("#ldLightText").value.trim() || "#1a1a2e";
      const darkText = root.querySelector("#ldDarkText").value.trim() || "#e5e7eb";
      const lightAccent = root.querySelector("#ldLightAccent").value.trim() || "#e5e7eb";
      const darkAccent = root.querySelector("#ldDarkAccent").value.trim() || "#334155";
      const lines = [];
      lines.push(`<!-- Meta tag for color-scheme -->`);
      lines.push(`<meta name="color-scheme" content="light dark">`);
      lines.push("");
      lines.push(`/* CSS with light-dark() function */`);
      lines.push(`${rootSelector} {`);
      if (colorScheme) lines.push(`  color-scheme: light dark;`);
      lines.push(`  --bg: light-dark(${lightBg}, ${darkBg});`);
      lines.push(`  --text: light-dark(${lightText}, ${darkText});`);
      lines.push(`  --accent: light-dark(${lightAccent}, ${darkAccent});`);
      lines.push(`}`);
      lines.push("");
      lines.push(`/* Usage example */`);
      lines.push(`body {`);
      lines.push(`  background: ${lightBg}; /* fallback */`);
      lines.push(`  background: var(--bg);`);
      lines.push(`  color: ${lightText}; /* fallback */`);
      lines.push(`  color: var(--text);`);
      lines.push(`}`);
      lines.push("");
      lines.push(`/* Browser support: Chrome 123+, Edge 123+, Safari 17.5+, Firefox 120+ */`);
      lines.push(`/* Fallback: set the light value directly first, override with light-dark(). */`);
      return { output: lines.join("\n") };
    }
  };
