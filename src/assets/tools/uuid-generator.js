import { field, checkbox, select, htmlEscape } from "../tool-core.js";

export default {
  form: `
    <div class="field-grid">
      ${select({ id: "uuidVersion", label: "UUID version", options: [
        {label:"v4 (random — recommended)",value:"v4"},
        {label:"v7 (time-ordered)",value:"v7"}
      ], value: "v4" })}
      ${field({ id: "uuidCount", label: "Number to generate", type: "number", value: "5", attrs: "min=1 max=100" })}
    </div>
    <div class="field-grid">
      ${checkbox({ id: "uuidUpper", label: "Uppercase", checked: false })}
      ${checkbox({ id: "uuidHyphens", label: "Include hyphens", checked: true })}
    </div>`,
  generate(root) {
    const version = root.querySelector("#uuidVersion").value;
    const count = Math.min(100, Math.max(1, parseInt(root.querySelector("#uuidCount").value) || 5));
    const upper = root.querySelector("#uuidUpper").checked;
    const hyphens = root.querySelector("#uuidHyphens").checked;

    const uuids = [];
    for (let i = 0; i < count; i++) {
      let uuid = version === "v4" ? crypto.randomUUID() : generateV7();
      if (!hyphens) uuid = uuid.replace(/-/g, "");
      if (upper) uuid = uuid.toUpperCase();
      uuids.push(uuid);
    }

    const output = uuids.join("\n");
    const preview = `<div style="border:1px solid #e5e7eb;border-radius:8px;overflow:hidden">
      <div style="background:#f0fdf4;padding:8px 14px;font-size:12px;color:#15803d;font-weight:600">${count} UUID${version === "v4" ? " v4" : " v7"} generated</div>
      <div style="padding:14px;font-family:monospace;font-size:13px;line-height:1.8">${uuids.map((u,i) => `<div style="display:flex;gap:8px"><span style="color:#6b7280">${i+1}.</span>${u}</div>`).join("")}</div>
    </div>`;

    return { output, preview };
  }
};

function generateV7() {
  const ts = Date.now();
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  bytes[0] = (ts >> 40) & 0xff;
  bytes[1] = (ts >> 32) & 0xff;
  bytes[2] = (ts >> 24) & 0xff;
  bytes[3] = (ts >> 16) & 0xff;
  bytes[4] = (ts >> 8) & 0xff;
  bytes[5] = ts & 0xff;
  bytes[6] = (bytes[6] & 0x0f) | 0x70;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = [...bytes].map(b => b.toString(16).padStart(2, "0")).join("");
  return `${hex.slice(0,8)}-${hex.slice(8,12)}-${hex.slice(12,16)}-${hex.slice(16,20)}-${hex.slice(20)}`;
}
