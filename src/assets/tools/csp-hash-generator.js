import { textarea, select, checkbox, htmlEscape } from "../tool-core.js";

function arrayBufferToBase64(buffer) {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary);
}

export default {
  form: `
    <div class="field-grid">
      ${textarea({ id: "cspCode", label: "Inline code to hash", help: "Paste the exact inline script or style content. Whitespace matters — every space, newline, and indent changes the hash." })}
      ${select({ id: "cspAlgo", label: "Hash algorithm", options: [{label:"SHA-256",value:"SHA-256"},{label:"SHA-384",value:"SHA-384"},{label:"SHA-512",value:"SHA-512"}], value: "SHA-256" })}
    </div>
    <div class="field-grid">
      ${select({ id: "cspType", label: "Directive type", options: [{label:"script-src",value:"script-src"},{label:"style-src",value:"style-src"}], value: "script-src" })}
      ${checkbox({ id: "cspUnsafe", label: "Show unsafe-hashes warning", checked: true })}
    </div>`,
  async generate(root) {
    const code = root.querySelector("#cspCode").value;
    const algo = root.querySelector("#cspAlgo").value;
    const directive = root.querySelector("#cspType").value;
    const showWarning = root.querySelector("#cspUnsafe").checked;

    if (!code.trim()) {
      return { output: "Paste the inline script or style content to generate its CSP hash." };
    }

    const hashBuffer = await crypto.subtle.digest(algo, new TextEncoder().encode(code));
    const hashBase64 = arrayBufferToBase64(hashBuffer);
    const hashValue = `'${algo.toLowerCase().replace("-","")}-${hashBase64}'`;

    const lines = [
      `/* CSP Hash — ${algo} */`,
      `/* Content length: ${code.length} bytes */`,
      ``,
      `Hash value:`,
      hashValue,
      ``,
      `CSP directive snippet:`,
      `${directive} ${hashValue};`,
      ``,
    ];

    if (showWarning) {
      lines.push(
        `/* Warning: The hash changes if ANY whitespace, indentation, or character changes. */`,
        `/* Even a trailing space, a different newline style (CRLF vs LF), or a reformatted line */`,
        `/* will produce a different hash and break the CSP allowlist. */`,
        ``,
        `/* Do NOT use 'unsafe-hashes' unless you fully understand the security implications. */`,
        `/* 'unsafe-hashes' allows hashes to match inline event handlers and javascript: URLs, */`,
        `/* which can be exploited if user input reaches those attributes. */`
      );
    }

    lines.push(
      ``,
      `/* Browsers that do not understand the hash ignore it and fall back to other CSP rules. */`,
      `/* Always include 'self' or a nonce as a fallback when using hashes. */`
    );

    return { output: lines.join("\n") };
  }
};
