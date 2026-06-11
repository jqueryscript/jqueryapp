import { field, select, checkbox, htmlEscape } from "../tool-core.js";

export default {
  form: `
    <div class="field-grid">
      ${field({ id: "fBlur", label: "Blur (px)", value: "0", type: "number", attrs: "min=0 max=20 step=0.1" })}
      ${field({ id: "fBrightness", label: "Brightness (%)", value: "100", type: "number", attrs: "min=0 max=300 step=1" })}
    </div>
    <div class="field-grid">
      ${field({ id: "fContrast", label: "Contrast (%)", value: "100", type: "number", attrs: "min=0 max=300 step=1" })}
      ${field({ id: "fGrayscale", label: "Grayscale (%)", value: "0", type: "number", attrs: "min=0 max=100 step=1" })}
    </div>
    <div class="field-grid">
      ${field({ id: "fHueRotate", label: "Hue-rotate (deg)", value: "0", type: "number", attrs: "min=0 max=360 step=1" })}
      ${field({ id: "fInvert", label: "Invert (%)", value: "0", type: "number", attrs: "min=0 max=100 step=1" })}
    </div>
    <div class="field-grid">
      ${field({ id: "fSaturate", label: "Saturate (%)", value: "100", type: "number", attrs: "min=0 max=300 step=1" })}
      ${field({ id: "fSepia", label: "Sepia (%)", value: "0", type: "number", attrs: "min=0 max=100 step=1" })}
    </div>
    <div class="field-grid">
      ${field({ id: "fOpacity", label: "Opacity (%)", value: "100", type: "number", attrs: "min=0 max=100 step=1" })}
    </div>
    <div class="field" style="grid-column:1/-1">
      <label for="fImageUrl">Sample image URL (optional)</label>
      <input id="fImageUrl" type="text" value="" placeholder="https://images.unsplash.com/photo-...">
      <small>Leave empty to use a color swatch instead</small>
    </div>`,
  generate(root) {
    const blur = parseFloat(root.querySelector("#fBlur").value) || 0;
    const brightness = parseInt(root.querySelector("#fBrightness").value) || 100;
    const contrast = parseInt(root.querySelector("#fContrast").value) || 100;
    const grayscale = parseInt(root.querySelector("#fGrayscale").value) || 0;
    const hueRotate = parseInt(root.querySelector("#fHueRotate").value) || 0;
    const invert = parseInt(root.querySelector("#fInvert").value) || 0;
    const saturate = parseInt(root.querySelector("#fSaturate").value) || 100;
    const sepia = parseInt(root.querySelector("#fSepia").value) || 0;
    const opacity = parseInt(root.querySelector("#fOpacity").value) || 100;
    const imgUrl = root.querySelector("#fImageUrl").value.trim();

    const parts = [];
    if (blur > 0) parts.push(`blur(${blur}px)`);
    if (brightness !== 100) parts.push(`brightness(${brightness}%)`);
    if (contrast !== 100) parts.push(`contrast(${contrast}%)`);
    if (grayscale > 0) parts.push(`grayscale(${grayscale}%)`);
    if (hueRotate > 0) parts.push(`hue-rotate(${hueRotate}deg)`);
    if (invert > 0) parts.push(`invert(${invert}%)`);
    if (saturate !== 100) parts.push(`saturate(${saturate}%)`);
    if (sepia > 0) parts.push(`sepia(${sepia}%)`);
    if (opacity !== 100) parts.push(`opacity(${opacity}%)`);

    const filterValue = parts.length ? parts.join(" ") : "none";
    const output = filterValue === "none" ? "/* No filter applied */" : `filter: ${filterValue};`;

    const previewStyle = filterValue === "none" ? "" : `filter:${filterValue};`;
    const preview = imgUrl
      ? `<div style="text-align:center"><img src="${htmlEscape(imgUrl)}" alt="Preview" style="max-width:100%;max-height:220px;border-radius:10px;${previewStyle}" onerror="this.parentElement.innerHTML='<div style=\\'padding:20px;color:#dc2626\\'>Image failed to load. Check the URL and try again.</div>'"></div>`
      : `<div style="text-align:center">
          <div style="width:100%;max-width:280px;height:160px;border-radius:12px;margin:0 auto;background:linear-gradient(135deg,#3b82f6 0%,#8b5cf6 50%,#ec4899 100%);${previewStyle}display:flex;align-items:center;justify-content:center">
            <span style="font-size:13px;font-weight:600;color:#fff;text-shadow:0 1px 2px rgba(0,0,0,0.3)">Filter Preview</span>
          </div>
        </div>`;

    return { output, preview };
  }
};
