import { field, textarea, select, checkbox, htmlEscape, attrEscape, normalizeUrl } from "../tool-core.js";

export default {
    form: `
      <div class="field-grid">
        ${select({
          id: "layerPreset",
          label: "Site type",
          value: "simple",
          options: [
            { label: "Simple site", value: "simple" },
            { label: "Component library", value: "components" },
            { label: "Utility-first CSS", value: "utility" },
            { label: "Custom", value: "custom" }
          ]
        })}
      </div>
      <div class="check-grid" id="layerChecks">
        ${checkbox({ id: "layerReset", label: "reset / normalize", checked: true })}
        ${checkbox({ id: "layerBase", label: "base (typography, colors)", checked: true })}
        ${checkbox({ id: "layerLayout", label: "layout (grid, spacing)", checked: true })}
        ${checkbox({ id: "layerComponents", label: "components (cards, buttons)", checked: true })}
        ${checkbox({ id: "layerUtilities", label: "utilities (overrides)", checked: true })}
        ${checkbox({ id: "layerThemes", label: "themes (dark mode, brand)", checked: false })}
      </div>`,
    generate(root) {
      const preset = root.querySelector("#layerPreset").value;
      const layerIds = ["layerReset","layerBase","layerLayout","layerComponents","layerUtilities","layerThemes"];
      const layerNames = { layerReset: "reset", layerBase: "base", layerLayout: "layout", layerComponents: "components", layerUtilities: "utilities", layerThemes: "themes" };
      const layerGuides = {
        reset: "Normalize or reset rules here. Remove default margins and set box-sizing.",
        base: "HTML element defaults, typography, color variables, and link styles.",
        layout: "Container, grid, spacing, and section layout rules.",
        components: "Cards, buttons, forms, navigation, and other reusable components.",
        utilities: "Small override classes: .hidden, .centered, .sr-only, spacing helpers.",
        themes: "Theme variations: dark mode, brand skins, high-contrast settings."
      };
      let layers;
      if (preset !== "custom") {
        const presets = {
          simple: ["reset","base","layout","components","utilities"],
          components: ["reset","base","layout","components","utilities","themes"],
          utility: ["reset","base","components","utilities"]
        };
        layers = presets[preset];
        layerIds.forEach(id => {
          const cb = root.querySelector(`#${id}`);
          if (cb) cb.checked = layers.includes(layerNames[id]);
        });
      } else {
        layers = layerIds.filter(id => root.querySelector(`#${id}`).checked).map(id => layerNames[id]);
      }
      if (layers.length === 0) return { output: "Select at least one layer." };
      const orderDecl = `@layer ${layers.join(", ")};`;
      const cssBlocks = layers.map(l =>
        `/* ── ${l} ── */\n@layer ${l} {\n  /* ${layerGuides[l] || ""} */\n}`
      ).join("\n\n");
      return { output: `${orderDecl}\n\n${cssBlocks}\n\n/* Layer order: later layers override earlier ones.\n   Unlayered styles always beat layered styles.\n   !important in earlier layers beats !important in later layers (reverse of normal). */` };
    }
  };
