import { field, textarea, select, checkbox, htmlEscape, attrEscape, normalizeUrl } from "../tool-core.js";

export default {
    form: `
      <div class="field-grid">
        ${select({ id: "elType", label: "Link type", options: [{label:"Standard external link",value:"external"},{label:"Affiliate / sponsored link",value:"sponsored"},{label:"User-generated content link",value:"ugc"},{label:"Untrusted / nofollow link",value:"nofollow"},{label:"Internal link",value:"internal"}], value: "external" })}
        ${field({ id: "elUrl", label: "Destination URL", value: "https://example.com/page" })}
        ${field({ id: "elText", label: "Link text", value: "Visit Example" })}
        ${checkbox({ id: "elNewTab", label: "Open in new tab", checked: true })}
        ${checkbox({ id: "elAria", label: "Add aria-label for screen readers", checked: false })}
        ${field({ id: "elAriaLabel", label: "aria-label text", value: "Visit Example (opens in new tab)" })}
      </div>`,
    generate(root) {
      const linkType = root.querySelector("#elType").value;
      const url = root.querySelector("#elUrl").value.trim();
      const text = root.querySelector("#elText").value.trim();
      const newTab = root.querySelector("#elNewTab").checked;
      const useAria = root.querySelector("#elAria").checked;
      const ariaLabel = root.querySelector("#elAriaLabel").value.trim();
      const attrs = [`href="${attrEscape(url)}"`];
      let relParts = [];
      const comments = [];
      if (linkType === "external") {
        if (newTab) {
          attrs.push('target="_blank"');
          relParts.push("noopener", "noreferrer");
          comments.push("target=\"_blank\" opens the link in a new tab. rel=\"noopener noreferrer\" prevents the new page from accessing window.opener.");
        } else {
          comments.push("Standard external link. No target or rel overrides.");
        }
      } else if (linkType === "sponsored") {
        relParts.push("sponsored");
        comments.push("rel=\"sponsored\" identifies paid or sponsored links.");
        if (newTab) { attrs.push('target="_blank"'); relParts.push("noopener"); }
      } else if (linkType === "ugc") {
        relParts.push("ugc", "noopener");
        comments.push("rel=\"ugc\" marks user-generated content links.");
        if (newTab) { attrs.push('target="_blank"'); }
      } else if (linkType === "nofollow") {
        relParts.push("nofollow", "noopener");
        comments.push("rel=\"nofollow\" tells search engines not to follow or pass authority.");
        if (newTab) { attrs.push('target="_blank"'); }
      } else if (linkType === "internal") {
        comments.push("Internal link: no rel or target attributes needed.");
      }
      if (relParts.length) attrs.push(`rel="${relParts.join(" ")}"`);
      if (useAria && ariaLabel) attrs.push(`aria-label="${attrEscape(ariaLabel)}"`);
      const tag = `<a ${attrs.join(" ")}>${htmlEscape(text)}</a>`;
      const commentBlock = comments.length ? `\n\n<!-- ${comments.join(" ")} -->` : "";
      return { output: tag + commentBlock };
    }
  };
