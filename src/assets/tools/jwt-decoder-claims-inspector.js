import { textarea, checkbox, htmlEscape } from "../tool-core.js";

export default {
  form: `
    <div class="field-grid">
      ${textarea({ id: "jwtToken", label: "Paste JWT token", value: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjE3MTYyNDI2MjJ9.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c", full: true })}
    </div>
    <div class="field-grid">
      ${checkbox({ id: "jwtWarn", label: "Show algorithm security warnings", checked: true })}
      ${checkbox({ id: "jwtTime", label: "Convert timestamps to local time", checked: true })}
    </div>`,
  generate(root) {
    const token = root.querySelector("#jwtToken").value.trim();
    const showWarn = root.querySelector("#jwtWarn").checked;
    const showTime = root.querySelector("#jwtTime").checked;

    if (!token) return { output: "Paste a JWT token to decode.", preview: "" };

    const parts = token.split(".");
    if (parts.length !== 3) {
      return { output: "Invalid JWT format. Expected header.payload.signature (3 dot-separated parts).", preview: `<div style="padding:14px;background:#fef2f2;border:1px solid #ef4444;border-radius:8px;color:#dc2626">Invalid JWT — expected 3 parts separated by dots.</div>` };
    }

    try {
      const decode = (str) => {
        // Handle URL-safe base64
        let b64 = str.replace(/-/g, "+").replace(/_/g, "/");
        while (b64.length % 4) b64 += "=";
        return JSON.parse(atob(b64));
      };

      const header = decode(parts[0]);
      const payload = decode(parts[1]);
      const lines = [];

      lines.push("=== HEADER ===");
      lines.push(JSON.stringify(header, null, 2));
      lines.push("");
      lines.push("=== PAYLOAD ===");
      lines.push(JSON.stringify(payload, null, 2));

      // Timestamp conversion
      if (showTime) {
        lines.push("");
        lines.push("=== TIMESTAMPS ===");
        ["iat", "exp", "nbf", "auth_time"].forEach(field => {
          if (payload[field]) {
            const d = new Date(payload[field] * 1000);
            lines.push(`${field}: ${payload[field]} → ${d.toISOString()} (${d.toLocaleString()})`);
          }
        });
      }

      if (showWarn && header.alg === "none") {
        lines.push("");
        lines.push("⚠ SECURITY WARNING: Algorithm is 'none' — token has no signature verification.");
      }
      if (showWarn && header.alg?.startsWith("HS")) {
        lines.push("");
        lines.push("ℹ HS256/HS384/HS512 uses a shared secret. Keep the secret secure.");
      }

      const payloadKeys = Object.keys(payload).length;
      const headerKeys = Object.keys(header).length;
      const warningBadge = header.alg === "none" ? `<span style="background:#fee2e2;color:#dc2626;padding:2px 8px;border-radius:10px;font-size:11px">alg=none</span>` : "";

      const preview = `<div style="border:1px solid #e5e7eb;border-radius:10px;overflow:hidden">
        <div style="background:#f0fdf4;padding:10px 14px;font-size:12px;color:#15803d;font-weight:600">
          ✓ Decoded ${warningBadge} ${headerKeys} header fields · ${payloadKeys} claims
        </div>
        <div style="padding:14px;font-size:12px;line-height:1.6">
          <div style="font-weight:600;color:#374151;margin-bottom:4px">Header</div>
          <pre style="font-size:12px;background:#f9fafb;padding:8px;border-radius:4px;margin-bottom:10px">${JSON.stringify(header, null, 2)}</pre>
          <div style="font-weight:600;color:#374151;margin-bottom:4px">Payload</div>
          <pre style="font-size:12px;background:#f9fafb;padding:8px;border-radius:4px">${JSON.stringify(payload, null, 2)}</pre>
        </div>
      </div>`;

      return { output: lines.join("\n"), preview };
    } catch (e) {
      return { output: `Decode error: ${e.message}`, preview: `<div style="padding:14px;background:#fef2f2;border:1px solid #ef4444;border-radius:8px;color:#dc2626">${e.message}</div>` };
    }
  }
};
