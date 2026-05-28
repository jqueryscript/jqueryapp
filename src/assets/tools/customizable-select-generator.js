import { field, textarea, select, checkbox, htmlEscape } from "../tool-core.js";

export default {
  form: `
    <div class="field-grid">
      ${textarea({ id: "csOptions", label: "Options (one per line)", help: "Format: value|Label. First option is default.", value: "us|United States\nuk|United Kingdom\nde|Germany\nfr|France\njp|Japan" })}
      ${field({ id: "csName", label: "Select name attribute", value: "country" })}
    </div>
    <div class="field-grid">
      ${select({ id: "csPickerIcon", label: "Picker icon style", options: [{label:"Chevron (default)",value:"chevron"},{label:"Custom SVG",value:"svg"},{label:"None",value:"none"}], value: "chevron" })}
      ${select({ id: "csCheckmark", label: "Checkmark style", options: [{label:"Checkmark",value:"check"},{label:"Dot",value:"dot"},{label:"None",value:"none"}], value: "check" })}
    </div>
    <div class="field-grid">
      ${checkbox({ id: "csClosed", label: "Style closed state", checked: true })}
      ${checkbox({ id: "csFallback", label: "Include browser fallback note", checked: true })}
    </div>`,
  generate(root) {
    const raw = root.querySelector("#csOptions").value.trim();
    const name = root.querySelector("#csName").value.trim() || "select-name";
    const pickerIcon = root.querySelector("#csPickerIcon").value;
    const checkmark = root.querySelector("#csCheckmark").value;
    const showClosed = root.querySelector("#csClosed").checked;
    const showFallback = root.querySelector("#csFallback").checked;

    const options = raw.split("\n").map(line => {
      const [val, label] = line.split("|");
      return { value: (val || "").trim(), label: (label || val || "").trim() };
    }).filter(o => o.label);

    if (!options.length) {
      return { output: "Enter at least one option. Format: value|Label (one per line)." };
    }

    const lines = [];
    lines.push("/* === Customizable Select (Chrome 135+) === */");

    // HTML
    lines.push("");
    lines.push("<!-- HTML -->");
    lines.push(`<select name="${htmlEscape(name)}" class="custom-select">`);
    options.forEach(o => {
      lines.push(`  <option value="${htmlEscape(o.value)}">${htmlEscape(o.label)}</option>`);
    });
    lines.push("</select>");
    lines.push(`<!-- Include selectedcontent to display the selected label -->`);
    lines.push(`<div class="selected-display">Selected: <selectedcontent></selectedcontent></div>`);

    // CSS
    lines.push("");
    lines.push("/* --- Base Select CSS --- */");
    lines.push(".custom-select {");
    lines.push("  appearance: base-select;");
    lines.push("  font: inherit;");
    lines.push("  padding: 8px 36px 8px 12px;");
    lines.push("  border: 1px solid var(--color-border, #ccc);");
    lines.push("  border-radius: 8px;");
    lines.push("  background: var(--color-surface, #fff);");
    lines.push("  color: var(--color-text, #333);");
    lines.push("  cursor: pointer;");
    lines.push("}");
    lines.push("");

    // Picker icon
    if (pickerIcon !== "none") {
      lines.push("/* --- Picker Icon --- */");
      if (pickerIcon === "chevron") {
        lines.push(".custom-select::picker-icon {");
        lines.push("  content: '';");
        lines.push("  width: 10px;");
        lines.push("  height: 10px;");
        lines.push("  border-right: 2px solid currentColor;");
        lines.push("  border-bottom: 2px solid currentColor;");
        lines.push("  transform: rotate(45deg);");
        lines.push("  margin-right: 12px;");
        lines.push("  transition: transform 0.2s;");
        lines.push("}");
      } else {
        lines.push(".custom-select::picker-icon {");
        lines.push("  content: url(\"data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20'><path d='M6 8l4 4 4-4' fill='none' stroke='currentColor' stroke-width='1.5'/></svg>\");");
        lines.push("  width: 18px;");
        lines.push("  height: 18px;");
        lines.push("  margin-right: 8px;");
        lines.push("}");
      }
      lines.push("");
    }

    // Checkmark
    if (checkmark !== "none") {
      lines.push("/* --- Option Checkmark --- */");
      lines.push(".custom-select option::checkmark {");
      if (checkmark === "dot") {
        lines.push("  content: '';");
        lines.push("  width: 8px;");
        lines.push("  height: 8px;");
        lines.push("  border-radius: 50%;");
        lines.push("  background: var(--color-accent, #2563eb);");
      } else {
        lines.push("  content: '✓';");
        lines.push("  color: var(--color-accent, #2563eb);");
        lines.push("  font-weight: bold;");
      }
      lines.push("  margin-right: 8px;");
      lines.push("}");
      lines.push("");
    }

    // Picker popover
    lines.push("/* --- Picker Popover --- */");
    lines.push(".custom-select::picker(select) {");
    lines.push("  border: 1px solid var(--color-border, #ddd);");
    lines.push("  border-radius: 8px;");
    lines.push("  box-shadow: 0 4px 16px rgba(0,0,0,0.12);");
    lines.push("  padding: 4px 0;");
    lines.push("  background: var(--color-surface, #fff);");
    lines.push("}");
    lines.push("");
    lines.push("/* --- Option Items --- */");
    lines.push(".custom-select option {");
    lines.push("  padding: 8px 12px;");
    lines.push("  cursor: pointer;");
    lines.push("}");
    lines.push(".custom-select option:hover {");
    lines.push("  background: var(--color-bg-hover, #f0f4ff);");
    lines.push("}");
    lines.push("");

    // Closed state
    if (showClosed) {
      lines.push("/* --- Closed State --- */");
      lines.push("/* Style the select when picker is not open */");
      lines.push(".custom-select:not(:open) {");
      lines.push("  /* Styles applied when picker is closed */");
      lines.push("}");
      lines.push(".custom-select:open::picker-icon {");
      lines.push("  transform: rotate(-135deg);");
      lines.push("}");
      lines.push("");
    }

    // Fallback
    if (showFallback) {
      lines.push(
        "/* === Browser Support === */",
        "/* Customizable select requires Chrome 135+ with \"Experimental Web Platform Features\" enabled. */",
        "/* Older browsers show a standard native select — the base-select appearance is ignored. */",
        "/* Use @supports for progressive enhancement: */",
        "/* @supports (appearance: base-select) { .custom-select { ... } } */",
        "/* For production, keep option text readable without custom CSS — fallback is readable native select. */"
      );
    }

    const optionItems = options.map(o => `<option value="${htmlEscape(o.value)}">${htmlEscape(o.label)}</option>`).join("\n");
    const preview = `<div style="max-width:320px;margin:0 auto">
      <p style="font-size:12px;color:#6b7280;margin:0 0 4px">Preview (Chrome 135+)</p>
      <select class="custom-select-preview" style="appearance:base-select;font:inherit;padding:8px 36px 8px 12px;border:1px solid #d1d5db;border-radius:8px;background:#fff;color:#333;cursor:pointer;width:100%">
        ${optionItems}
      </select>
      <style>
        .custom-select-preview::picker(select){border:1px solid #d1d5db;border-radius:8px;box-shadow:0 4px 16px rgba(0,0,0,0.12);padding:4px 0;background:#fff}
        .custom-select-preview option{padding:8px 12px;cursor:pointer}
        .custom-select-preview option:hover{background:#f0f4ff}
      </style>
    </div>`;
    return { output: lines.join("\n"), preview };
  }
};
