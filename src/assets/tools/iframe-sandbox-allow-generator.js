import { field, textarea, select, checkbox, htmlEscape, attrEscape, normalizeUrl } from "../tool-core.js";

export default {
    form: `
      <div class="field-grid">
        ${select({
          id: "sxUseCase",
          label: "Embed type",
          value: "youtube",
          options: [
            { label: "YouTube / video", value: "youtube" },
            { label: "Google Maps", value: "maps" },
            { label: "Form widget", value: "form" },
            { label: "Payment / checkout", value: "payment" },
            { label: "Generic third-party", value: "generic" },
            { label: "Custom", value: "custom" }
          ]
        })}
        ${field({ id: "sxSrc", label: "Iframe URL", value: "https://www.youtube.com/embed/dQw4w9WgXcQ", full: true })}
        ${field({ id: "sxTitle", label: "Iframe title", value: "Embedded content", full: true })}
      </div>
      <div class="check-grid">
        ${checkbox({ id: "sxScripts", label: "allow-scripts", checked: true })}
        ${checkbox({ id: "sxSameOrigin", label: "allow-same-origin" })}
        ${checkbox({ id: "sxForms", label: "allow-forms" })}
        ${checkbox({ id: "sxPopups", label: "allow-popups" })}
        ${checkbox({ id: "sxPresentation", label: "allow-presentation" })}
        ${checkbox({ id: "sxTopNav", label: "allow-top-navigation" })}
      </div>
      <div class="check-grid">
        ${checkbox({ id: "sxCamera", label: "camera" })}
        ${checkbox({ id: "sxMicrophone", label: "microphone" })}
        ${checkbox({ id: "sxGeolocation", label: "geolocation" })}
        ${checkbox({ id: "sxFullscreen", label: "fullscreen" })}
        ${checkbox({ id: "sxPayment", label: "payment" })}
      </div>`,
    generate(root) {
      const useCase = root.querySelector("#sxUseCase").value;
      const sandboxIds = ["sxScripts","sxSameOrigin","sxForms","sxPopups","sxPresentation","sxTopNav"];
      const sandboxNames = { sxScripts: "allow-scripts", sxSameOrigin: "allow-same-origin", sxForms: "allow-forms", sxPopups: "allow-popups", sxPresentation: "allow-presentation", sxTopNav: "allow-top-navigation" };
      const allowPermIds = ["sxCamera","sxMicrophone","sxGeolocation","sxFullscreen","sxPayment"];
      const presets = {
        youtube: { sandbox: ["sxScripts","sxSameOrigin","sxPresentation"], allow: ["sxFullscreen"] },
        maps: { sandbox: ["sxScripts","sxSameOrigin"], allow: [] },
        form: { sandbox: ["sxScripts","sxSameOrigin","sxForms"], allow: [] },
        payment: { sandbox: ["sxScripts","sxSameOrigin","sxForms"], allow: ["sxPayment"] },
        generic: { sandbox: ["sxScripts","sxSameOrigin","sxPopups"], allow: [] },
        custom: { sandbox: sandboxIds.filter(id => root.querySelector(`#${id}`).checked), allow: allowPermIds.filter(id => root.querySelector(`#${id}`).checked) }
      };
      const config = presets[useCase];
      if (useCase !== "custom") {
        sandboxIds.forEach(id => { const cb = root.querySelector(`#${id}`); if (cb) cb.checked = config.sandbox.includes(id); });
        allowPermIds.forEach(id => { const cb = root.querySelector(`#${id}`); if (cb) cb.checked = config.allow.includes(id); });
      }
      const sandbox = config.sandbox.map(id => sandboxNames[id]).filter(Boolean);
      const allow = config.allow.map(id => id.replace("sx", "").toLowerCase()).filter(Boolean);
      const src = root.querySelector("#sxSrc").value.trim();
      const title = root.querySelector("#sxTitle").value.trim();
      const attrs = [
        `src="${attrEscape(src)}"`,
        `title="${attrEscape(title)}"`,
        `width="100%"`,
        sandbox.length ? `sandbox="${sandbox.join(" ")}"` : "",
        allow.length ? `allow="${allow.join("; ")}"` : "",
        `allowfullscreen`,
        `referrerpolicy="strict-origin-when-cross-origin"`,
        `loading="lazy"`
      ].filter(Boolean);
      let warn = sandbox.includes("allow-scripts") && sandbox.includes("allow-same-origin")
        ? "\n\n<!-- Warning: allow-scripts + allow-same-origin can remove sandbox protection. Only use both when the embed needs same-origin script access. -->"
        : "";
      return { output: `<iframe\n    ${attrs.join("\n    ")}\n  ></iframe>${warn}` };
    }
  };
