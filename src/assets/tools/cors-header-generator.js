import { field, textarea, select, checkbox, htmlEscape } from "../tool-core.js";

export default {
  form: `
    <div class="field-grid">
      ${field({ id: "corsOrigins", label: "Allowed origins", help: 'Comma-separated. Use * for any origin. Do NOT use * with credentials.', value: "*" })}
      ${field({ id: "corsMaxAge", label: "Preflight max-age (seconds)", type: "number", help: "How long browsers may cache preflight results. Typical: 3600-86400.", value: "3600" })}
    </div>
    <div class="field-grid">
      <fieldset class="check-grid">
        <legend>Allowed methods</legend>
        <label><input type="checkbox" data-cors="method" value="GET" checked> GET</label>
        <label><input type="checkbox" data-cors="method" value="POST"> POST</label>
        <label><input type="checkbox" data-cors="method" value="PUT"> PUT</label>
        <label><input type="checkbox" data-cors="method" value="DELETE"> DELETE</label>
        <label><input type="checkbox" data-cors="method" value="PATCH"> PATCH</label>
        <label><input type="checkbox" data-cors="method" value="OPTIONS"> OPTIONS</label>
      </fieldset>
    </div>
    <div class="field-grid">
      ${textarea({ id: "corsHeaders", label: "Allowed headers (one per line)", help: 'Common: Content-Type, Authorization, X-Requested-With. Leave empty for simple requests only.', value: "Content-Type\nAuthorization" })}
      ${checkbox({ id: "corsCred", label: "Allow credentials (cookies, HTTP auth)", checked: false })}
    </div>
    <div class="field-grid">
      ${select({ id: "corsFormat", label: "Output format", options: [
        {label:"Raw HTTP header",value:"raw"},
        {label:"Nginx add_header",value:"nginx"},
        {label:"Apache Header",value:"apache"},
        {label:"Express.js res.header()",value:"express"},
        {label:"Cloudflare Workers",value:"workers"}
      ], value: "raw" })}
    </div>`,
  generate(root) {
    const origins = root.querySelector("#corsOrigins").value.trim();
    const maxAge = root.querySelector("#corsMaxAge").value;
    const cred = root.querySelector("#corsCred").checked;
    const headersRaw = root.querySelector("#corsHeaders").value.trim();
    const format = root.querySelector("#corsFormat").value;

    const methods = Array.from(root.querySelectorAll("[data-cors='method']:checked")).map(cb => cb.value);
    const headers = headersRaw ? headersRaw.split("\n").map(s => s.trim()).filter(Boolean) : [];

    const isWildcard = origins === "*";
    const warnings = [];

    const acao = isWildcard ? "*" : origins;
    const acam = methods.join(", ");
    const acah = headers.join(", ");

    if (isWildcard && cred) {
      warnings.push("/* ERROR: Cannot use wildcard origin (*) with credentials. */");
      warnings.push("/* Browsers will reject the response. Specify exact origins. */");
    }

    const vary = isWildcard ? "" : "Vary: Origin";

    let outputLines = [];

    if (format === "raw") {
      outputLines.push(`Access-Control-Allow-Origin: ${acao}`);
      if (acam) outputLines.push(`Access-Control-Allow-Methods: ${acam}`);
      if (acah) outputLines.push(`Access-Control-Allow-Headers: ${acah}`);
      if (cred) outputLines.push("Access-Control-Allow-Credentials: true");
      if (maxAge) outputLines.push(`Access-Control-Max-Age: ${maxAge}`);
      if (vary) outputLines.push(vary);
    } else if (format === "nginx") {
      outputLines.push(`add_header Access-Control-Allow-Origin "${acao}";`);
      if (acam) outputLines.push(`add_header Access-Control-Allow-Methods "${acam}";`);
      if (acah) outputLines.push(`add_header Access-Control-Allow-Headers "${acah}";`);
      if (cred) outputLines.push(`add_header Access-Control-Allow-Credentials "true";`);
      if (maxAge) outputLines.push(`add_header Access-Control-Max-Age "${maxAge}";`);
    } else if (format === "apache") {
      outputLines.push(`Header set Access-Control-Allow-Origin "${acao}"`);
      if (acam) outputLines.push(`Header set Access-Control-Allow-Methods "${acam}"`);
      if (acah) outputLines.push(`Header set Access-Control-Allow-Headers "${acah}"`);
      if (cred) outputLines.push(`Header set Access-Control-Allow-Credentials "true"`);
      if (maxAge) outputLines.push(`Header set Access-Control-Max-Age "${maxAge}"`);
    } else if (format === "express") {
      outputLines.push("res.set({");
      outputLines.push(`  "Access-Control-Allow-Origin": "${acao}",`);
      if (acam) outputLines.push(`  "Access-Control-Allow-Methods": "${acam}",`);
      if (acah) outputLines.push(`  "Access-Control-Allow-Headers": "${acah}",`);
      if (cred) outputLines.push(`  "Access-Control-Allow-Credentials": true,`);
      if (maxAge) outputLines.push(`  "Access-Control-Max-Age": ${maxAge},`);
      outputLines.push("});");
    } else if (format === "workers") {
      outputLines.push("const corsHeaders = {");
      outputLines.push(`  "Access-Control-Allow-Origin": "${acao}",`);
      if (acam) outputLines.push(`  "Access-Control-Allow-Methods": "${acam}",`);
      if (acah) outputLines.push(`  "Access-Control-Allow-Headers": "${acah}",`);
      if (cred) outputLines.push(`  "Access-Control-Allow-Credentials": "true",`);
      if (maxAge) outputLines.push(`  "Access-Control-Max-Age": "${maxAge}",`);
      outputLines.push("};");
      outputLines.push("// For preflight: return new Response(null, { headers: corsHeaders });");
      outputLines.push("// For actual requests: add ...corsHeaders to the response.");
    }

    if (warnings.length) {
      outputLines.unshift(...warnings, "");
    }

    if (isWildcard && !cred) {
      outputLines.push("", "/* Using wildcard origin. Credentials (cookies, HTTP auth) are NOT sent. */");
    }
    if (maxAge && parseInt(maxAge) > 86400) {
      outputLines.push("", "/* Note: Browsers cap Access-Control-Max-Age at 86400 seconds (24 hours). Larger values are ignored. */");
    }

    return { output: outputLines.join("\n") };
  }
};
