import { field, textarea, select, checkbox, htmlEscape, attrEscape, normalizeUrl } from "../tool-core.js";

export default {
    form: `
      <div class="field-grid">
        ${select({ id: "daMode", label: "Accordion mode", options: [{label:"Exclusive (one open at a time)",value:"exclusive"},{label:"Multiple (independent toggles)",value:"multiple"}], value: "exclusive"})}
        ${field({ id: "daName", label: "Group name (for exclusive mode)", value: "faq" })}
        ${textarea({ id: "daItems", label: "Items (one per line: title|content)", value: "What is this tool?|This tool generates HTML details accordion markup.\nHow do I use it?|Enter your items and copy the generated HTML.\nIs JavaScript required?|No. The details element works natively." })}
        ${checkbox({ id: "daStyled", label: "Include CSS styling", checked: true })}
      </div>`,
    generate(root) {
      const mode = root.querySelector("#daMode").value;
      const name = root.querySelector("#daName").value.trim();
      const itemsText = root.querySelector("#daItems").value.trim();
      const styled = root.querySelector("#daStyled").checked;
      const items = itemsText.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
      if (items.length === 0) return { output: "Add at least one item to generate the accordion." };
      const isExclusive = mode === "exclusive";
      const detailsHtml = items.map((line) => {
        const [title, ...contentParts] = line.split("|");
        const content = contentParts.join("|").trim();
        if (!title || !content) return "";
        const nameAttr = isExclusive && name ? ` name="${attrEscape(name)}"` : "";
        return `<details${nameAttr}>\n  <summary>${htmlEscape(title.trim())}</summary>\n  <div class="accordion-content">\n    <p>${htmlEscape(content)}</p>\n  </div>\n</details>`;
      }).filter(Boolean).join("\n\n");
      let css = "";
      if (styled) {
        css = `\n\n<style>
.accordion {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  overflow: hidden;
}

.accordion details {
  border-bottom: 1px solid #e5e7eb;
}

.accordion details:last-child {
  border-bottom: none;
}

.accordion summary {
  cursor: pointer;
  padding: 0.75rem 1rem;
  font-weight: 600;
  background: #f9fafb;
  user-select: none;
}

.accordion summary:hover {
  background: #f3f4f6;
}

.accordion details[open] summary {
  background: #f3f4f6;
  border-bottom: 1px solid #e5e7eb;
}

.accordion-content {
  padding: 1rem;
}

.accordion-content p {
  margin: 0;
  line-height: 1.6;
}
</style>`;
      }
      let modeNote;
      if (isExclusive) {
        modeNote = "Exclusive mode: only one item open at a time (name=\"" + name + "\").";
      } else {
        modeNote = "Multiple mode: each item opens independently.";
      }
      const output = `<div class="accordion">\n${detailsHtml.replace(/\n/g, "\n  ")}\n</div>${css}\n\n<!-- Notes:\n     - ${modeNote}\n     - No JavaScript required. The <details> element works natively.\n     - For multi-open mode, add open="open" to all items to expand all.\n     - For exclusive mode, clicking an item closes any other open item with the same name. -->`;
      const previewItems = items.map((line) => {
        const [title, ...contentParts] = line.split("|");
        const content = contentParts.join("|").trim();
        if (!title || !content) return "";
        const nameAttr = isExclusive && name ? ` name="${attrEscape(name)}"` : "";
        return `<details${nameAttr}><summary style="cursor:pointer;padding:10px 14px;font-weight:600;background:#f9fafb;border:1px solid #e5e7eb;border-radius:6px;margin-bottom:4px;user-select:none">${htmlEscape(title.trim())}</summary><div style="padding:12px 14px;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 6px 6px;margin-top:-4px;margin-bottom:8px"><p style="margin:0">${htmlEscape(content)}</p></div></details>`;
      }).filter(Boolean).join("\n");
      const preview = `<div style="max-width:100%">${previewItems}</div>`;
      return { output, preview };
    }
  };
