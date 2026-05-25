import { field, textarea, select, checkbox, htmlEscape, attrEscape, normalizeUrl } from "../tool-core.js";

export default {
    form: `
      <div class="field-grid">
        ${textarea({ id: "slugSource", label: "Title or heading", value: "How to Build a Static Website with GitHub Pages", full: true })}
      </div>`,
    generate(root) {
      const input = root.querySelector("#slugSource").value.trim();
      const slug = input
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/[\s_]+/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-+|-+$/g, "");
      return { output: slug || "(enter text to generate a slug)" };
    }
  };
