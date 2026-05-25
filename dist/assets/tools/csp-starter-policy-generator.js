import { field, textarea, select, checkbox, htmlEscape, attrEscape, normalizeUrl } from "../tool-core.js";

export default {
    form: `
      <div class="field-grid">
        ${select({
          id: "cspPreset",
          label: "Site type",
          value: "static",
          options: [
            { label: "Plain static site (self only)", value: "static" },
            { label: "Static + CDN (Bootstrap, Tailwind)", value: "cdn" },
            { label: "Static + analytics + fonts", value: "analytics" },
            { label: "Static + embeds (YouTube, maps)", value: "embeds" },
            { label: "Custom", value: "custom" }
          ]
        })}
      </div>
      <div class="check-grid" style="margin-top:12px">
        <label style="font-weight:700;display:block;margin-bottom:6px">Additional sources</label>
        ${checkbox({ id: "cspGAnalytics", label: "Google Analytics / Tag Manager" })}
        ${checkbox({ id: "cspGFonts", label: "Google Fonts" })}
        ${checkbox({ id: "cspCDN", label: "CDN (cdn.jsdelivr.net, unpkg.com)" })}
        ${checkbox({ id: "cspYouTube", label: "YouTube embeds" })}
        ${checkbox({ id: "cspMaps", label: "Google Maps embeds" })}
        ${checkbox({ id: "cspInlines", label: "Allow inline styles (unsafe-inline)" })}
      </div>`,
    generate(root) {
      const preset = root.querySelector("#cspPreset").value;
      const presets = {
        static: [],
        cdn: ["cspCDN"],
        analytics: ["cspGAnalytics", "cspGFonts"],
        embeds: ["cspYouTube", "cspMaps", "cspGFonts"],
        custom: null
      };
      if (preset !== "custom" && presets[preset]) {
        ["cspGAnalytics","cspGFonts","cspCDN","cspYouTube","cspMaps","cspInlines"].forEach((id) => {
          const cb = root.querySelector(`#${id}`);
          if (cb) cb.checked = presets[preset].includes(id);
        });
      }
      const defaultSrc = ["'self'"];
      const scriptSrc = ["'self'"];
      const styleSrc = ["'self'"];
      const imgSrc = ["'self'", "data:"];
      const fontSrc = ["'self'"];
      const frameSrc = ["'self'"];
      const connectSrc = ["'self'"];
      if (root.querySelector("#cspGAnalytics").checked) {
        scriptSrc.push("https://www.googletagmanager.com", "https://www.google-analytics.com");
        connectSrc.push("https://www.google-analytics.com");
        imgSrc.push("https://www.google-analytics.com");
      }
      if (root.querySelector("#cspGFonts").checked) {
        styleSrc.push("https://fonts.googleapis.com");
        fontSrc.push("https://fonts.gstatic.com");
      }
      if (root.querySelector("#cspCDN").checked) {
        scriptSrc.push("https://cdn.jsdelivr.net", "https://unpkg.com");
        styleSrc.push("https://cdn.jsdelivr.net", "https://unpkg.com");
      }
      if (root.querySelector("#cspYouTube").checked) {
        frameSrc.push("https://www.youtube.com", "https://www.youtube-nocookie.com");
      }
      if (root.querySelector("#cspMaps").checked) {
        frameSrc.push("https://www.google.com/maps");
        imgSrc.push("https://*.googleapis.com");
        scriptSrc.push("https://maps.googleapis.com");
      }
      if (root.querySelector("#cspInlines").checked) {
        styleSrc.push("'unsafe-inline'");
      }
      const dirs = [
        `default-src ${defaultSrc.join(" ")};`,
        `script-src ${scriptSrc.join(" ")};`,
        `style-src ${styleSrc.join(" ")};`,
        `img-src ${imgSrc.join(" ")};`,
        `font-src ${fontSrc.join(" ")};`,
        `frame-src ${frameSrc.join(" ")};`,
        `connect-src ${connectSrc.join(" ")};`,
        "base-uri 'self';",
        "form-action 'self';"
      ];
      const csp = dirs.join(" ");
      const reportOnly = `Content-Security-Policy-Report-Only: ${csp}`;
      const enforced = `Content-Security-Policy: ${csp}`;
      const metaTag = `<meta http-equiv="Content-Security-Policy" content="${attrEscape(csp)}">`;
      let notes = "1. Deploy the Report-Only header first and check the browser console for violations.\n";
      notes += "2. When no violations appear, switch to the enforce header or meta tag.\n";
      notes += "3. GitHub Pages: Custom HTTP headers are not supported. Use the meta tag.\n";
      notes += "4. frame-ancestors and report-uri do not work via meta tag — use headers for those.\n";
      notes += "5. unsafe-inline for scripts weakens XSS protection. Avoid it when possible.";
      return { output: `${reportOnly}\n\n${enforced}\n\n${metaTag}\n\n${notes}` };
    }
  };
