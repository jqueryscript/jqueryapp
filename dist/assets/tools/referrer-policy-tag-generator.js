import { field, textarea, select, checkbox, htmlEscape, attrEscape, normalizeUrl } from "../tool-core.js";

export default {
    form: `
      <div class="field-grid">
        ${select({ id: "rpPolicy", label: "Referrer Policy", options: [{label:"strict-origin-when-cross-origin (recommended)",value:"strict-origin-when-cross-origin"},{label:"no-referrer (send nothing)",value:"no-referrer"},{label:"no-referrer-when-downgrade",value:"no-referrer-when-downgrade"},{label:"origin (send only origin)",value:"origin"},{label:"origin-when-cross-origin",value:"origin-when-cross-origin"},{label:"same-origin",value:"same-origin"},{label:"strict-origin",value:"strict-origin"},{label:"unsafe-url (send full URL)",value:"unsafe-url"}], value: "strict-origin-when-cross-origin"})}
      </div>`,
    generate(root) {
      const policy = root.querySelector("#rpPolicy").value;
      const descriptions = {
        "strict-origin-when-cross-origin": "Sends the full URL to same-origin destinations, sends only the origin to cross-origin destinations, and sends no Referer header when navigating from HTTPS to HTTP. This is the modern recommended default.",
        "no-referrer": "Never sends the Referer header. No referrer information is included with requests from this page.",
        "no-referrer-when-downgrade": "Sends the full URL for same-origin and HTTPS-to-HTTPS requests. Sends nothing when navigating from HTTPS to HTTP.",
        "origin": "Sends only the origin (scheme + host + port) in all requests, regardless of destination.",
        "origin-when-cross-origin": "Sends the full URL for same-origin requests. Sends only the origin for cross-origin requests.",
        "same-origin": "Sends the full URL for same-origin requests. Sends nothing for cross-origin requests.",
        "strict-origin": "Sends only the origin for all requests. Sends nothing when navigating from HTTPS to HTTP.",
        "unsafe-url": "Sends the full URL for all requests, including cross-origin and HTTPS-to-HTTP. This leaks the full URL and is not recommended."
      };
      const desc = descriptions[policy] || "";
      const output = `<!-- HTTP Header (preferred) -->\nReferrer-Policy: ${policy}\n\n<!-- HTML Meta Tag -->\n<meta name="referrer" content="${policy}">\n\n<!-- Description:\n     ${desc} -->\n\n<!-- Per-element example: -->\n<a href="https://example.com" referrerpolicy="${policy}">Link</a>`;
      return { output };
    }
  };
