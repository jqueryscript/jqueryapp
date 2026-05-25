import { field, textarea, select, checkbox, htmlEscape, attrEscape, normalizeUrl } from "../tool-core.js";

export default {
    form: `
      <div class="field-grid">
        ${select({ id: "iaType", label: "Input type", options: [
          { label: "text", value: "text" },
          { label: "email", value: "email" },
          { label: "url", value: "url" },
          { label: "number", value: "number" },
          { label: "tel", value: "tel" },
          { label: "password", value: "password" },
          { label: "date", value: "date" },
          { label: "search", value: "search" },
          { label: "file", value: "file" }
        ], value: "text" })}
        ${field({ id: "iaName", label: "name attribute", value: "field-name" })}
        ${field({ id: "iaPlaceholder", label: "placeholder", value: "Enter value..." })}
        ${field({ id: "iaId", label: "id attribute", value: "field-id" })}
        ${checkbox({ id: "iaRequired", label: "required", checked: false })}
        ${checkbox({ id: "iaDisabled", label: "disabled", checked: false })}
        ${field({ id: "iaAutocomplete", label: "autocomplete", value: "", help: "e.g. email, name, tel" })}
        ${field({ id: "iaPattern", label: "pattern", value: "", help: "e.g. [0-9]{3}-[0-9]{2}" })}
        ${field({ id: "iaMin", label: "min", value: "", type: "number" })}
        ${field({ id: "iaMax", label: "max", value: "", type: "number" })}
        ${field({ id: "iaStep", label: "step", value: "" })}
        ${field({ id: "iaMinlength", label: "minlength", value: "", type: "number" })}
        ${field({ id: "iaMaxlength", label: "maxlength", value: "", type: "number" })}
      </div>`,
    generate(root) {
      const type = root.querySelector("#iaType").value;
      const name = root.querySelector("#iaName").value;
      const placeholder = root.querySelector("#iaPlaceholder").value;
      const id = root.querySelector("#iaId").value;
      const required = root.querySelector("#iaRequired").checked;
      const disabled = root.querySelector("#iaDisabled").checked;
      const autocomplete = root.querySelector("#iaAutocomplete").value;
      const pattern = root.querySelector("#iaPattern").value;
      const min = root.querySelector("#iaMin").value;
      const max = root.querySelector("#iaMax").value;
      const step = root.querySelector("#iaStep").value;
      const minlength = root.querySelector("#iaMinlength").value;
      const maxlength = root.querySelector("#iaMaxlength").value;
      let input = '<input type="' + attrEscape(type) + '" name="' + attrEscape(name || "field-name") + '"';
      if (id) input += ' id="' + attrEscape(id) + '"';
      if (placeholder) input += ' placeholder="' + attrEscape(placeholder) + '"';
      if (required) input += " required";
      if (disabled) input += " disabled";
      if (autocomplete) input += ' autocomplete="' + attrEscape(autocomplete) + '"';
      if (pattern) input += ' pattern="' + attrEscape(pattern) + '"';
      if (min) input += ' min="' + attrEscape(min) + '"';
      if (max) input += ' max="' + attrEscape(max) + '"';
      if (step) input += ' step="' + attrEscape(step) + '"';
      if (minlength) input += ' minlength="' + attrEscape(minlength) + '"';
      if (maxlength) input += ' maxlength="' + attrEscape(maxlength) + '"';
      input += ">";
      let label;
      if (id) {
        label = '<label for="' + attrEscape(id) + '">' + htmlEscape(name || "Field") + '</label>';
      } else {
        label = '<!-- Add a label element with a for attribute matching the input id -->';
      }
      const output = label + "\n" + input;
      return { output };
    }
  };
