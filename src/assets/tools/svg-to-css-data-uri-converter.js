import { textarea, select, checkbox, htmlEscape } from "../tool-core.js";

export default {
  form: `
    <div class="field-grid">
      ${textarea({ id: "sduInput", label: "Paste SVG markup", value: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/></svg>', full: true, attrs: 'style="min-height:120px;font-family:monospace"' })}
    </div>
    <div class="field-grid">
      ${select({ id: "sduFormat", label: "Output format", options: [
        {label:"URL-encoded (smaller, readable)",value:"url"},
        {label:"Base64 (compact, binary-safe)",value:"base64"}
      ], value: "url" })}
      ${select({ id: "sduContext", label: "CSS context", options: [
        {label:"background-image",value:"bg"},
        {label:"<img> src",value:"img"},
        {label:"Raw data URI only",value:"raw"}
      ], value: "bg" })}
    </div>`,
  generate(root) {
    const svg = root.querySelector("#sduInput").value.trim();
    const format = root.querySelector("#sduFormat").value;
    const context = root.querySelector("#sduContext").value;

    if (!svg) return { output: "Paste SVG markup.", preview: "" };

    let dataUri = "";
    if (format === "url") {
      const encoded = svg
        .replace(/#/g, "%23")
        .replace(/"/g, "'")
        .replace(/</g, "%3C")
        .replace(/>/g, "%3E")
        .replace(/\s+/g, " ");
      dataUri = `data:image/svg+xml,${encoded}`;
    } else {
      const b64 = btoa(unescape(encodeURIComponent(svg)));
      dataUri = `data:image/svg+xml;base64,${b64}`;
    }

    const lines = [];
    if (context === "bg") {
      lines.push(`background-image: url("${dataUri}");`);
      lines.push("background-repeat: no-repeat;");
    } else if (context === "img") {
      lines.push(`<img src="${dataUri}" alt="icon">`);
    } else {
      lines.push(dataUri);
    }

    const preview = `<div style="text-align:center">
      <div style="display:inline-block;width:64px;height:64px;background-image:url('${dataUri}');background-size:contain;background-repeat:no-repeat;background-position:center;border:1px solid #e5e7eb;border-radius:8px;margin-bottom:8px"></div>
      <div style="font-size:12px;color:#6b7280">Preview &middot; ${format === "url" ? "URL-encoded" : "Base64"} &middot; ${(dataUri.length/1024).toFixed(1)} KB</div>
    </div>`;

    return { output: lines.join("\n"), preview };
  }
};
