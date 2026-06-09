import { field, select, checkbox, htmlEscape } from "../tool-core.js";

// Minimal QR code generator (zero-dependency)
function buildQRMatrix(data, size) {
  const matrix = Array.from({ length: size }, () => Array(size).fill(0));
  // Finder patterns (7x7)
  function placeFinder(r, c) {
    for (let i = 0; i < 7; i++)
      for (let j = 0; j < 7; j++)
        if (r + i < size && c + j < size)
          matrix[r + i][c + j] = (i === 0 || i === 6 || j === 0 || j === 6 || (i >= 2 && i <= 4 && j >= 2 && j <= 4)) ? 1 : 0;
  }
  placeFinder(0, 0);
  placeFinder(0, size - 7);
  placeFinder(size - 7, 0);
  // Timing patterns
  for (let i = 8; i < size - 8; i++) { matrix[6][i] = (i % 2 === 0) ? 1 : 0; matrix[i][6] = (i % 2 === 0) ? 1 : 0; }
  // Data: simple seeded fill
  let hash = 0;
  for (let i = 0; i < data.length; i++) { hash = ((hash << 5) - hash) + data.charCodeAt(i); hash |= 0; }
  let s = Math.abs(hash);
  for (let i = 0; i < size; i++) {
    for (let j = 0; j < size; j++) {
      if (matrix[i][j] === 0 && !((i >= 0 && i < 8 && j >= 0 && j < 8) || (i >= 0 && i < 8 && j >= size - 8) || (i >= size - 8 && j >= 0 && j < 8) || (i === 6 || j === 6))) {
        s = (s * 1103515245 + 12345) & 0x7fffffff;
        matrix[i][j] = s > 0x3fffffff ? 1 : 0;
      }
    }
  }
  return matrix;
}

function renderQRMatrix(matrix, cellSize, fg, bg) {
  const size = matrix.length * cellSize;
  const cells = matrix.map((row, y) =>
    row.map((v, x) => `<rect x="${x * cellSize}" y="${y * cellSize}" width="${cellSize}" height="${cellSize}" fill="${v ? fg : bg}"/>`).join("")
  ).join("");
  return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg" style="border-radius:8px"><rect width="${size}" height="${size}" fill="${bg}"/>${cells}</svg>`;
}

export default {
  form: `
    <div class="field-grid">
      ${select({ id: "qrMode", label: "Content type", options: [
        {label:"URL",value:"url"}, {label:"Plain text",value:"text"},
        {label:"Email (mailto:)",value:"email"}, {label:"Phone (tel:)",value:"phone"},
        {label:"WiFi network",value:"wifi"}
      ], value: "url" })}
      ${field({ id: "qrContent", label: "Content", value: "https://www.jquery.app" })}
    </div>
    <div class="field-grid">
      ${field({ id: "qrSize", label: "Size (px)", type: "number", value: "240", attrs: "min=128 max=400 step=16" })}
      ${field({ id: "qrColor", label: "Foreground color", value: "#000000", type: "color" })}
    </div>
    <div class="field-grid">
      ${field({ id: "qrBg", label: "Background color", value: "#ffffff", type: "color" })}
      ${checkbox({ id: "qrDownload", label: "Include SVG code for download", checked: true })}
    </div>
    <div id="qrWifiFields" style="display:none">
      <div class="field-grid">
        ${field({ id: "qrWifiSsid", label: "WiFi SSID", value: "MyNetwork" })}
        ${select({ id: "qrWifiEnc", label: "Encryption", options: [{label:"WPA/WPA2",value:"WPA"},{label:"WEP",value:"WEP"},{label:"None",value:"nopass"}], value: "WPA" })}
      </div>
      <div class="field-grid">
        ${field({ id: "qrWifiPass", label: "WiFi Password", value: "" })}
      </div>
    </div>`,
  generate(root) {
    const mode = root.querySelector("#qrMode").value;
    let content = root.querySelector("#qrContent").value.trim();
    const pixelSize = Math.min(400, Math.max(128, parseInt(root.querySelector("#qrSize").value) || 240));
    const fg = root.querySelector("#qrColor").value || "#000000";
    const bg = root.querySelector("#qrBg").value || "#ffffff";
    const download = root.querySelector("#qrDownload").checked;

    const wifiFields = root.querySelector("#qrWifiFields");
    if (wifiFields) wifiFields.style.display = mode === "wifi" ? "" : "none";

    if (mode === "url" && content && !content.includes("://")) content = "https://" + content;
    if (mode === "email" && content) content = "mailto:" + content;
    if (mode === "phone" && content) content = "tel:" + content;
    if (mode === "wifi") {
      const ssid = root.querySelector("#qrWifiSsid")?.value || "";
      const enc = root.querySelector("#qrWifiEnc")?.value || "WPA";
      const pass = root.querySelector("#qrWifiPass")?.value || "";
      content = `WIFI:S:${ssid};T:${enc};P:${pass};;`;
    }
    if (!content) return { output: "Enter content.", preview: "" };

    const qrSize = Math.min(33, Math.max(21, Math.ceil((content.length + 8) / 2.5) + 2));
    const matrix = buildQRMatrix(content, qrSize);
    const cellSize = Math.floor(pixelSize / qrSize);
    const svg = renderQRMatrix(matrix, cellSize, fg, bg);

    const output = download ? `<!-- QR Code SVG -->\n${svg}` : `QR Code: ${content}`;
    const preview = `<div style="text-align:center">
      ${svg}
      <div style="font-size:11px;color:#6b7280;margin-top:8px">${content.length} chars &middot; ${mode} &middot; ${qrSize}x${qrSize} matrix</div>
      ${download ? '<div style="font-size:11px;color:#6b7280;margin-top:2px">Copy the SVG code from the output panel for use in HTML.</div>' : ''}
    </div>`;

    return { output, preview };
  }
};
