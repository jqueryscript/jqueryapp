import { field, select, checkbox, htmlEscape } from "../tool-core.js";

export default {
  form: `
    <div class="field-grid">
      ${select({ id: "gradType", label: "Gradient type", options: [
        {label:"Linear",value:"linear"}, {label:"Radial",value:"radial"}, {label:"Conic",value:"conic"}
      ], value: "linear" })}
      ${field({ id: "gradAngle", label: "Angle (deg)", value: "135", type: "number", attrs: "min=0 max=360 step=1" })}
    </div>
    <div class="field-grid">
      ${field({ id: "stop1", label: "Stop 1 color", value: "#3b82f6", type: "color" })}
      ${field({ id: "pos1", label: "Stop 1 position (%)", value: "0", type: "number", attrs: "min=0 max=100 step=1" })}
    </div>
    <div class="field-grid">
      ${field({ id: "stop2", label: "Stop 2 color", value: "#8b5cf6", type: "color" })}
      ${field({ id: "pos2", label: "Stop 2 position (%)", value: "50", type: "number", attrs: "min=0 max=100 step=1" })}
    </div>
    <div class="field-grid">
      ${field({ id: "stop3", label: "Stop 3 color", value: "#ec4899", type: "color" })}
      ${field({ id: "pos3", label: "Stop 3 position (%)", value: "100", type: "number", attrs: "min=0 max=100 step=1" })}
    </div>
    <div class="field-grid">
      ${checkbox({ id: "gradRepeating", label: "Repeating gradient" })}
    </div>`,
  generate(root) {
    const type = root.querySelector("#gradType").value;
    const angle = parseInt(root.querySelector("#gradAngle").value) || 135;
    const repeating = root.querySelector("#gradRepeating").checked;

    const stops = [];
    for (let i = 1; i <= 3; i++) {
      const color = root.querySelector(`#stop${i}`).value || "#3b82f6";
      const pos = root.querySelector(`#pos${i}`).value || "0";
      stops.push({ color, pos: parseInt(pos) });
    }
    stops.sort((a, b) => a.pos - b.pos);
    const stopStr = stops.map(s => `${s.color} ${s.pos}%`).join(", ");

    let gradValue = "";
    if (type === "linear") {
      const prefix = repeating ? "repeating-linear-gradient" : "linear-gradient";
      gradValue = `${prefix}(${angle}deg, ${stopStr})`;
    } else if (type === "radial") {
      const prefix = repeating ? "repeating-radial-gradient" : "radial-gradient";
      gradValue = `${prefix}(circle, ${stopStr})`;
    } else {
      const prefix = repeating ? "repeating-conic-gradient" : "conic-gradient";
      gradValue = `${prefix}(from ${angle}deg, ${stopStr})`;
    }

    const output = `background: ${gradValue};`;
    const preview = `<div style="width:100%;max-width:340px;height:180px;border-radius:12px;margin:0 auto;background:${gradValue};border:1px solid #e5e7eb"></div>
      <div style="text-align:center;margin-top:8px;font-size:11px;color:#6b7280">${type} · ${stops.map(s => s.color).join(" → ")}</div>`;

    return { output, preview };
  }
};
