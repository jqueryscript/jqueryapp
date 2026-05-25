import { field, textarea, select, checkbox, htmlEscape, attrEscape, normalizeUrl } from "../tool-core.js";

export default {
    form: `
      ${select({ id: "lpPhysical", label: "Physical property", options: [
        { label: "margin-left", value: "margin-left" },
        { label: "margin-right", value: "margin-right" },
        { label: "margin-top", value: "margin-top" },
        { label: "margin-bottom", value: "margin-bottom" },
        { label: "padding-left", value: "padding-left" },
        { label: "padding-right", value: "padding-right" },
        { label: "padding-top", value: "padding-top" },
        { label: "padding-bottom", value: "padding-bottom" },
        { label: "border-left", value: "border-left" },
        { label: "border-right", value: "border-right" },
        { label: "border-top", value: "border-top" },
        { label: "border-bottom", value: "border-bottom" },
        { label: "left", value: "left" },
        { label: "right", value: "right" },
        { label: "top", value: "top" },
        { label: "bottom", value: "bottom" },
        { label: "width", value: "width" },
        { label: "height", value: "height" },
        { label: "text-align: left", value: "text-align: left" },
        { label: "text-align: right", value: "text-align: right" }
      ], value: "margin-left" })}
      ${field({ id: "lpValue", label: "Value", value: "1rem" })}
      ${field({ id: "lpSelector", label: "Selector", value: ".component" })}`,
    generate(root) {
      const physical = root.querySelector("#lpPhysical").value;
      const value = root.querySelector("#lpValue").value;
      const selector = root.querySelector("#lpSelector").value || ".component";
      const mapping = {
        "margin-left": "margin-inline-start",
        "margin-right": "margin-inline-end",
        "margin-top": "margin-block-start",
        "margin-bottom": "margin-block-end",
        "padding-left": "padding-inline-start",
        "padding-right": "padding-inline-end",
        "padding-top": "padding-block-start",
        "padding-bottom": "padding-block-end",
        "border-left": "border-inline-start",
        "border-right": "border-inline-end",
        "border-top": "border-block-start",
        "border-bottom": "border-block-end",
        "left": "inset-inline-start",
        "right": "inset-inline-end",
        "top": "inset-block-start",
        "bottom": "inset-block-end",
        "width": "inline-size",
        "height": "block-size",
        "text-align: left": "text-align: start",
        "text-align: right": "text-align: end"
      };
      const logical = mapping[physical] || physical;
      let physDecl, logDecl;
      if (physical.startsWith("text-align")) {
        const alignValue = physical.split(": ")[1];
        physDecl = selector + ' {\n  text-align: ' + alignValue + ';\n}';
        logDecl = selector + ' {\n  text-align: ' + (alignValue === "left" ? "start" : "end") + ';\n}';
      } else {
        physDecl = selector + ' {\n  ' + physical + ': ' + value + ';\n}';
        logDecl = selector + ' {\n  ' + logical + ': ' + value + ';\n}';
      }
      const output = '/* CSS Logical Properties Converter\n' +
        '   Physical to Logical Property Mapping\n' +
        '   ' + physical + ' -> ' + logical + '\n' +
        '   Browser support: Supported in modern browsers (Chrome 111+, Firefox 109+, Safari 15.4+). */\n\n' +
        '/* Physical */\n' + physDecl + '\n\n/* Logical */\n' + logDecl;
      return { output };
    }
  };
