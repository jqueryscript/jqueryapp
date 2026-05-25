import { field, textarea, select, checkbox, htmlEscape, attrEscape, normalizeUrl } from "../tool-core.js";

export default {
    form: `
      <div class="field-grid">
        ${select({ id: "plType", label: "Resource type", options: [{label:"font",value:"font"},{label:"image",value:"image"},{label:"style (CSS)",value:"style"},{label:"script",value:"script"},{label:"fetch",value:"fetch"}], value: "font"})}
        ${field({ id: "plHref", label: "Resource URL", value: "/assets/font.woff2" })}
        ${checkbox({ id: "plCrossorigin", label: "crossorigin (required for fonts)", checked: true })}
        ${field({ id: "plTypeAttr", label: "MIME type", value: "font/woff2" })}
      </div>`,
    generate(root) {
      const type = root.querySelector("#plType").value;
      const href = root.querySelector("#plHref").value.trim();
      const crossorigin = root.querySelector("#plCrossorigin").checked;
      const typeAttr = root.querySelector("#plTypeAttr").value.trim();
      const attrs = [`rel="preload"`, `href="${attrEscape(href)}"`, `as="${attrEscape(type)}"`];
      if (crossorigin) attrs.push("crossorigin");
      if (typeAttr && (type === "font" || type === "fetch")) {
        attrs.push(`type="${attrEscape(typeAttr)}"`);
      }
      let output = `<link ${attrs.join(" ")}>`;
      if (type === "image") {
        output += `\n<!-- For responsive images, add imagesrcset and imagesizes:\n     <link rel="preload" as="image" href="..." imagesrcset="..." imagesizes="..."> -->`;
      }
      output += `\n\n<!-- Place this tag in <head> before the CSS or JS that uses this resource. -->`;
      return { output };
    }
  };
