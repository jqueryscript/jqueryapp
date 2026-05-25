import { field, textarea, select, checkbox, htmlEscape, attrEscape, normalizeUrl } from "../tool-core.js";

export default {
    form: `
      <div class="field-grid">
        ${select({ id: "ilUseCase", label: "Use case", options: [{label:"LCP hero image",value:"hero"},{label:"Above-the-fold content image",value:"above"},{label:"Article body image",value:"article"},{label:"Gallery thumbnail",value:"gallery"},{label:"Footer / decorative",value:"footer"}], value: "hero"})}
        ${field({ id: "ilSrc", label: "Image URL", value: "/assets/hero.webp" })}
        ${field({ id: "ilAlt", label: "Alt text", value: "Hero image description" })}
        ${field({ id: "ilWidth", label: "Width", value: "1200", type: "number" })}
        ${field({ id: "ilHeight", label: "Height", value: "630", type: "number" })}
      </div>`,
    generate(root) {
      const useCase = root.querySelector("#ilUseCase").value;
      const src = root.querySelector("#ilSrc").value.trim();
      const alt = root.querySelector("#ilAlt").value.trim();
      const width = root.querySelector("#ilWidth").value || "1200";
      const height = root.querySelector("#ilHeight").value || "630";
      let loading, decoding, fp;
      let comment;
      if (useCase === "hero") {
        loading = "eager"; decoding = "sync"; fp = "high";
        comment = "LCP hero image: Load immediately with eager loading and sync decoding to prevent layout shift. fetchpriority=high signals this is the most important image on the page.";
      } else if (useCase === "above") {
        loading = "eager"; decoding = "async"; fp = "";
        comment = "Above-the-fold content: eager loading ensures it is visible immediately. async decoding avoids blocking the main thread.";
      } else if (useCase === "article") {
        loading = "lazy"; decoding = "async"; fp = "";
        comment = "Article body image: lazy loading defers the request until the image approaches the viewport, saving bandwidth for initial page load.";
      } else if (useCase === "gallery") {
        loading = "lazy"; decoding = "async"; fp = "";
        comment = "Gallery thumbnail: lazy loading ensures only visible thumbnails are fetched. async decoding keeps the UI responsive.";
      } else {
        loading = "lazy"; decoding = "async"; fp = "low";
        comment = "Footer / decorative: lazy loading with fetchpriority=low defers this image as much as possible. It is the lowest priority fetch on the page.";
      }
      const attrs = [`src="${attrEscape(src)}"`, `alt="${attrEscape(alt)}"`, `width="${attrEscape(width)}"`, `height="${attrEscape(height)}"`, `loading="${loading}"`, `decoding="${decoding}"`];
      if (fp) attrs.push(`fetchpriority="${fp}"`);
      const output = `<!-- ${comment} -->\n<img\n  ${attrs.join("\n  ")}\n>`;
      return { output };
    }
  };
