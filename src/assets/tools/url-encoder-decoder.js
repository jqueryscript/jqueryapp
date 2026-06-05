import { textarea, select, checkbox, htmlEscape } from "../tool-core.js";

export default {
  form: `
    <div class="field-grid">
      ${select({ id: "ueDir", label: "Direction", options: [
        {label:"Encode (text → URL-encoded)",value:"encode"},
        {label:"Decode (URL-encoded → text)",value:"decode"}
      ], value: "encode" })}
      ${select({ id: "ueMode", label: "Mode", options: [
        {label:"encodeURIComponent (full encoding)",value:"component"},
        {label:"encodeURI (preserve URL structure)",value:"uri"}
      ], value: "component" })}
    </div>
    <div class="field-grid">
      ${textarea({ id: "ueInput", label: "Input", value: "https://example.com/search?q=hello world&lang=en&tag=css+html", full: true })}
    </div>`,
  generate(root) {
    const dir = root.querySelector("#ueDir").value;
    const mode = root.querySelector("#ueMode").value;
    const input = root.querySelector("#ueInput").value;

    if (!input) return { output: "Enter text to encode or decode.", preview: "" };

    try {
      let output = "";
      if (dir === "encode") {
        output = mode === "component" ? encodeURIComponent(input) : encodeURI(input);
      } else {
        output = mode === "component" ? decodeURIComponent(input) : decodeURI(input);
      }

      const preview = `<div style="border:1px solid #e5e7eb;border-radius:8px;overflow:hidden">
        <div style="background:#f0fdf4;padding:8px 14px;font-size:12px;color:#15803d;font-weight:600">${dir === "encode" ? "Encoded" : "Decoded"} · ${mode === "component" ? "Full (component)" : "URL-safe (uri)"}</div>
        <div style="padding:14px;font-family:monospace;font-size:13px;word-break:break-all;background:#fff;max-height:200px;overflow-y:auto">${output}</div>
      </div>`;

      return { output, preview };
    } catch (e) {
      return { output: `Error: ${e.message}`, preview: `<div style="padding:14px;background:#fef2f2;border:1px solid #ef4444;border-radius:8px;color:#dc2626">${e.message}</div>` };
    }
  }
};
