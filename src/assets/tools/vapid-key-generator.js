import { htmlEscape } from "../tool-core.js";

function arrayBufferToBase64Url(buffer) {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export default {
  form: `
    <div style="text-align:center;padding:32px 16px">
      <p style="margin:0 0 8px;color:var(--text-secondary);font-size:14px">Generate a VAPID key pair for Web Push notifications.</p>
      <p style="margin:0 0 20px;color:var(--text-secondary);font-size:13px">Keys are generated in your browser using the Web Crypto API.<br>Nothing is uploaded or stored.</p>
      <button type="button" data-vapid="generate" style="padding: 12px 32px; font-size: 16px; border-radius: 8px; border: 2px solid var(--accent); background: var(--accent); color: #fff; cursor: pointer; font-weight: 600;">Generate Key Pair</button>
      <p style="margin:16px 0 0;font-size:12px;color:var(--text-secondary)" data-vapid="status">Click to generate a new key pair.</p>
    </div>`,
  async generate(root) {
    const btn = root.querySelector("[data-vapid='generate']");
    const status = root.querySelector("[data-vapid='status']");

    if (!crypto.subtle) {
      return { output: "Web Crypto API is not available in this browser. Use a modern browser (Chrome, Firefox, Safari 11+, Edge) to generate VAPID keys." };
    }

    btn.disabled = true;
    btn.textContent = "Generating...";
    status.textContent = "Generating key pair...";

    try {
      const keyPair = await crypto.subtle.generateKey(
        { name: "ECDSA", namedCurve: "P-256" },
        true,
        ["sign", "verify"]
      );

      const publicKeyRaw = await crypto.subtle.exportKey("spki", keyPair.publicKey);
      const privateKeyRaw = await crypto.subtle.exportKey("pkcs8", keyPair.privateKey);

      const publicKey = arrayBufferToBase64Url(publicKeyRaw);
      const privateKey = arrayBufferToBase64Url(privateKeyRaw);

      btn.disabled = false;
      btn.textContent = "Generate New Key Pair";
      status.textContent = "Key pair generated. Save the private key securely.";

      return {
        output: [
          "/* === VAPID Key Pair (P-256 / ES256) === */",
          "/* Generated: " + new Date().toISOString() + " */",
          "",
          "Public Key:",
          publicKey,
          "",
          "Private Key:",
          privateKey,
          "",
          "/* === Usage === */",
          "",
          "/* Node.js (web-push library): */",
          "const webpush = require('web-push');",
          `webpush.setVapidDetails('mailto:your@email.com', '${publicKey}', '${privateKey}');`,
          "",
          "/* Environment variables: */",
          `VAPID_PUBLIC_KEY=${publicKey}`,
          `VAPID_PRIVATE_KEY=${privateKey}`,
          "",
          "/* Firebase Cloud Messaging: */",
          "/* In the Firebase Console > Project Settings > Cloud Messaging > Web Push certificates */",
          "/* Use the key pair above. */",
          "",
          "/* === IMPORTANT WARNINGS === */",
          "/* 1. The PRIVATE KEY cannot be recovered. Save it NOW in a secure location. */",
          "/* 2. The public key goes in your frontend JavaScript. The private key stays on your server. */",
          "/* 3. Never commit the private key to version control. Use environment variables. */",
          "/* 4. If the private key is exposed, generate a new pair and update your server immediately. */",
          "/* 5. The 'mailto:' contact in setVapidDetails can be any email you control. */",
          "/* 6. One VAPID key pair can serve all push subscriptions for your site. */"
        ].join("\n")
      };
    } catch (e) {
      btn.disabled = false;
      btn.textContent = "Generate Key Pair";
      status.textContent = "Generation failed. Try again.";
      return { output: `Error generating VAPID key pair: ${e.message}` };
    }
  }
};
