import { field, textarea, select, checkbox, htmlEscape, attrEscape, normalizeUrl } from "../tool-core.js";

export default {
    form: `
      <div class="field-grid">
        ${select({
          id: "ppPreset",
          label: "Policy preset",
          value: "minimal",
          options: [
            { label: "Minimal (deny all)", value: "minimal" },
            { label: "Media site (camera, mic, fullscreen)", value: "media" },
            { label: "Payment page", value: "payment" },
            { label: "Custom", value: "custom" }
          ]
        })}
      </div>
      <div class="check-grid" style="margin-top:12px">
        <label style="font-weight:700;display:block;margin-bottom:6px">Browser features</label>
        ${[
          { id: "ppCamera", label: "camera" },
          { id: "ppMicrophone", label: "microphone" },
          { id: "ppGeolocation", label: "geolocation" },
          { id: "ppFullscreen", label: "fullscreen" },
          { id: "ppPayment", label: "payment" },
          { id: "ppAutoplay", label: "autoplay" },
          { id: "ppDisplayCapture", label: "display-capture" },
          { id: "ppWakeLock", label: "screen-wake-lock" }
        ].map((f) => `
          <div class="field" style="display:flex;align-items:center;gap:8px">
            <label for="${f.id}" style="min-width:130px">${f.label}</label>
            <select id="${f.id}" style="flex:1">
              <option value="deny">Deny</option>
              <option value="self">Allow self</option>
              <option value="*">Allow *</option>
            </select>
          </div>
        `).join("")}
      </div>`,
    generate(root) {
      const preset = root.querySelector("#ppPreset").value;
      const features = [
        { id: "ppCamera", name: "camera" },
        { id: "ppMicrophone", name: "microphone" },
        { id: "ppGeolocation", name: "geolocation" },
        { id: "ppFullscreen", name: "fullscreen" },
        { id: "ppPayment", name: "payment" },
        { id: "ppAutoplay", name: "autoplay" },
        { id: "ppDisplayCapture", name: "display-capture" },
        { id: "ppWakeLock", name: "screen-wake-lock" }
      ];
      const presets = {
        minimal: {},
        media: { ppCamera: "self", ppFullscreen: "self", ppAutoplay: "self" },
        payment: { ppPayment: "self", ppFullscreen: "self" },
        custom: null
      };
      if (preset !== "custom" && presets[preset]) {
        Object.entries(presets[preset]).forEach(([id, val]) => {
          const sel = root.querySelector(`#${id}`);
          if (sel) sel.value = val;
        });
        features.forEach((f) => {
          if (!presets[preset][f.id]) {
            const sel = root.querySelector(`#${f.id}`);
            if (sel) sel.value = "deny";
          }
        });
      }
      const directives = features.map((f) => {
        const val = root.querySelector(`#${f.id}`).value;
        if (val === "deny") return `${f.name}=()`;
        if (val === "self") return `${f.name}=(self)`;
        return `${f.name}=*`;
      });
      const header = `Permissions-Policy: ${directives.join(", ")}`;
      const allowAttrs = features.filter((f) => {
        const val = root.querySelector(`#${f.id}`).value;
        return val !== "deny";
      }).map((f) => {
        const val = root.querySelector(`#${f.id}`).value;
        return val === "*" ? `${f.name} *` : `${f.name} 'self'`;
      });
      const metaTag = `<meta http-equiv="Permissions-Policy" content="${directives.join(", ")}">`;
      let notes = "Use this as an HTTP header or the meta tag equivalent.\n\n";
      notes += "Per-iframe allow override:\n<iframe allow=\"" + allowAttrs.join("; ") + "\" ...>\n\n";
      notes += "Static hosting notes:\n";
      notes += "- Netlify / Cloudflare Pages / Vercel: add the header in your config file.\n";
      notes += "- GitHub Pages: custom headers are not supported. Use the meta tag above.\n";
      notes += "- The meta tag works in all modern browsers for most directives.";
      return { output: `${header}\n\n${metaTag}\n\n${notes}` };
    }
  };
