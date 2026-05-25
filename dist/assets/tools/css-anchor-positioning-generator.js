import { field, textarea, select, checkbox, htmlEscape, attrEscape, normalizeUrl } from "../tool-core.js";

export default {
    form: `
      <div class="field-grid">
        ${field({ id: "apAnchorName", label: "Anchor name", value: "--my-anchor" })}
        ${field({ id: "apAnchorSelector", label: "Anchor element selector", value: ".trigger" })}
        ${select({ id: "apPositionArea", label: "Position area", options: [{label:"top",value:"top"},{label:"bottom",value:"bottom"},{label:"left",value:"left"},{label:"right",value:"right"},{label:"top left",value:"top left"},{label:"top right",value:"top right"},{label:"bottom left",value:"bottom left"},{label:"bottom right",value:"bottom right"}], value: "top"})}
        ${field({ id: "apTargetSelector", label: "Positioned element selector", value: ".tooltip" })}
        ${field({ id: "apInset", label: "Inset spacing", value: "0.5rem" })}
      </div>`,
    generate(root) {
      const anchorName = root.querySelector("#apAnchorName").value.trim() || "--my-anchor";
      const anchorSelector = root.querySelector("#apAnchorSelector").value.trim() || ".trigger";
      const positionArea = root.querySelector("#apPositionArea").value;
      const targetSelector = root.querySelector("#apTargetSelector").value.trim() || ".tooltip";
      const inset = root.querySelector("#apInset").value.trim() || "0.5rem";
      const areaParts = positionArea.split(" ");
      let fallbackCSS = "";
      areaParts.forEach((part) => {
        if (part === "top") fallbackCSS += "  bottom: 100%; margin-bottom: " + attrEscape(inset) + ";\n";
        if (part === "bottom") fallbackCSS += "  top: 100%; margin-top: " + attrEscape(inset) + ";\n";
        if (part === "left") fallbackCSS += "  right: 100%; margin-right: " + attrEscape(inset) + ";\n";
        if (part === "right") fallbackCSS += "  left: 100%; margin-left: " + attrEscape(inset) + ";\n";
      });
      const output = `/* CSS Anchor Positioning */
/* Browser support: Chrome 125+, Edge 125+, Safari (partial).
   Use with a fallback positioning approach. */

/* Anchor element */
${anchorSelector} {
  anchor-name: ${anchorName};
}

/* Positioned element */
${targetSelector} {
  position: fixed;
  position-anchor: ${anchorName};
  position-area: ${positionArea};
}

/* Fallback using absolute/relative positioning */
/*
${anchorSelector} {
  position: relative;
}

${targetSelector} {
  position: absolute;
${fallbackCSS}}
*/`;
      return { output };
    }
  };
