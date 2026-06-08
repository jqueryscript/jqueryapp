import { field, checkbox, textarea, htmlEscape } from "../tool-core.js";

export default {
  form: `
    <div class="field-grid">
      ${field({ id: "tsInput", label: "Timestamp or date", value: Date.now().toString(), help: "Enter a Unix timestamp (seconds or ms) or ISO date" })}
      ${checkbox({ id: "tsNow", label: "Use current time", checked: true })}
    </div>
    <div class="field-grid">
      ${checkbox({ id: "tsMs", label: "Input is in milliseconds", checked: true })}
      ${checkbox({ id: "tsUtc", label: "Show UTC", checked: false })}
    </div>`,
  generate(root) {
    const input = root.querySelector("#tsInput").value.trim();
    const useNow = root.querySelector("#tsNow").checked;
    const isMs = root.querySelector("#tsMs").checked;
    const showUtc = root.querySelector("#tsUtc").checked;

    let ts;
    if (useNow) {
      ts = Date.now();
      root.querySelector("#tsInput").value = ts;
    } else {
      ts = /^\d+$/.test(input) ? parseInt(input) : new Date(input).getTime();
    }
    if (!isMs && ts < 1e12) ts *= 1000;

    const d = new Date(ts);
    const sec = Math.floor(ts / 1000);
    const lines = [
      `Unix seconds: ${sec}`,
      `Unix milliseconds: ${ts}`,
      `ISO 8601 (UTC): ${d.toISOString()}`,
      `Local: ${d.toString()}`,
      `UTC: ${d.toUTCString()}`,
      `Day of week: ${d.toLocaleDateString("en-US", { weekday: "long" })}`,
      `Timezone offset: ${-d.getTimezoneOffset() / 60} hours`,
    ];

    const preview = `<div style="border:1px solid #e5e7eb;border-radius:8px;overflow:hidden">
      <div style="background:#f0fdf4;padding:10px 14px;font-size:13px;font-weight:600;color:#15803d">${d.toLocaleString()}</div>
      <div style="padding:14px;display:grid;grid-template-columns:140px 1fr;gap:6px 12px;font-size:12px">
        <span style="color:#6b7280">Unix seconds</span><span style="font-family:monospace">${sec}</span>
        <span style="color:#6b7280">Unix ms</span><span style="font-family:monospace">${ts}</span>
        <span style="color:#6b7280">ISO 8601</span><span style="font-family:monospace">${d.toISOString()}</span>
        <span style="color:#6b7280">UTC</span><span style="font-family:monospace">${d.toUTCString()}</span>
        <span style="color:#6b7280">Timezone</span><span style="font-family:monospace">UTC${d.getTimezoneOffset() <= 0 ? "+" : ""}${-d.getTimezoneOffset() / 60}h</span>
      </div>
    </div>`;

    return { output: lines.join("\n"), preview };
  }
};
