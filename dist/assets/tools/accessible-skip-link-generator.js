import { field, textarea, select, checkbox, htmlEscape, attrEscape, normalizeUrl } from "../tool-core.js";

export default {
    form: `
      ${field({ id: "slTarget", label: "Target selector", value: "#main-content" })}
      ${field({ id: "slText", label: "Link text", value: "Skip to main content" })}
      ${select({ id: "slVisibility", label: "Visibility", options: [
        { label: "Visible on focus only", value: "focus" },
        { label: "Always visible", value: "always" }
      ], value: "focus" })}
      ${field({ id: "slSelector", label: "Link ID", value: "skip-link" })}`,
    generate(root) {
      const target = root.querySelector("#slTarget").value;
      const text = root.querySelector("#slText").value;
      const visibility = root.querySelector("#slVisibility").value;
      const selector = root.querySelector("#slSelector").value;
      const linkId = selector || "skip-link";
      let css;
      if (visibility === "focus") {
        css = '/* Visually hidden until focused */\n' +
          '.' + linkId + ' {\n  position: absolute;\n  width: 1px;\n  height: 1px;\n  padding: 0;\n  margin: -1px;\n' +
          '  overflow: hidden;\n  clip: rect(0, 0, 0, 0);\n  white-space: nowrap;\n  border: 0;\n}\n' +
          '.' + linkId + ':focus {\n  position: fixed;\n  width: auto;\n  height: auto;\n  padding: 0.5rem 1rem;\n' +
          '  margin: 0.5rem;\n  overflow: visible;\n  clip: auto;\n  white-space: normal;\n' +
          '  background: #fff;\n  color: #000;\n  border: 2px solid #333;\n  border-radius: 4px;\n' +
          '  z-index: 9999;\n  outline: 3px solid #2563eb;\n  outline-offset: 2px;\n}';
      } else {
        css = '/* Always visible skip link */\n' +
          '.' + linkId + ' {\n  position: absolute;\n  top: 0;\n  left: 0;\n  padding: 0.5rem 1rem;\n' +
          '  background: #fff;\n  color: #000;\n  border: 2px solid #333;\n  border-radius: 4px;\n' +
          '  z-index: 9999;\n  text-decoration: none;\n}\n' +
          '.' + linkId + ':focus {\n  outline: 3px solid #2563eb;\n  outline-offset: 2px;\n}';
      }
      const output = '<!-- Skip link HTML -->\n' +
        '<a id="' + attrEscape(linkId) + '" class="' + attrEscape(linkId) + '" href="' + attrEscape(target) + '">' + htmlEscape(text) + '</a>\n\n' +
        '<!-- CSS -->\n<style>\n' + css + '\n</style>\n\n' +
        '<!-- Note: Add tabindex="-1" to the target element (' + htmlEscape(target) + ') so it receives focus when the skip link is activated. -->';
      return { output };
    }
  };
