import { field, select, checkbox, htmlEscape } from "../tool-core.js";

export default {
  form: `
    <div class="field-grid">
      ${field({ id: "raEndpoint", label: "Reporting endpoint URL", value: "https://example.com/reports" })}
      ${field({ id: "raGroup", label: "Endpoint group name", value: "default" })}
    </div>
    <div class="field-grid">
      ${field({ id: "raMaxAge", label: "max_age (seconds)", type: "number", value: "86400" })}
      ${checkbox({ id: "raFailures", label: "Include include_subdomains", checked: false })}
    </div>
    <hr style="margin:10px 0;border:none;border-top:1px solid var(--border,#d1d5db)">
    <p style="font-size:13px;font-weight:600;margin-bottom:8px">Report types to collect:</p>
    <div class="field-grid">
      ${checkbox({ id: "raCSP", label: "CSP Violation (csp-violation)", checked: true })}
      ${checkbox({ id: "raNEL", label: "Network Error Logging (nel)", checked: true })}
      ${checkbox({ id: "raDeprecation", label: "Deprecation warnings", checked: false })}
      ${checkbox({ id: "raIntervention", label: "Browser interventions", checked: false })}
      ${checkbox({ id: "raCrash", label: "Crash reports", checked: false })}
      ${checkbox({ id: "raCOEP", label: "COEP violations", checked: false })}
    </div>
    <hr style="margin:10px 0;border:none;border-top:1px solid var(--border,#d1d5db)">
    <div class="field-grid">
      ${checkbox({ id: "raCSPHeader", label: "Also generate CSP report-uri/report-to directive", checked: false })}
      ${select({ id: "raFormat", label: "Output format", options: [
        {label:"Both headers",value:"both"},
        {label:"Report-To header only",value:"report-to"},
        {label:"Reporting-Endpoints header only",value:"reporting-endpoints"}
      ], value: "both" })}
    </div>`,
  generate(root) {
    const endpoint = root.querySelector("#raEndpoint").value.trim() || "https://example.com/reports";
    const group = root.querySelector("#raGroup").value.trim() || "default";
    const maxAge = root.querySelector("#raMaxAge").value || "86400";
    const failures = root.querySelector("#raFailures").checked;
    const csp = root.querySelector("#raCSP").checked;
    const nel = root.querySelector("#raNEL").checked;
    const deprecation = root.querySelector("#raDeprecation").checked;
    const intervention = root.querySelector("#raIntervention").checked;
    const crash = root.querySelector("#raCrash").checked;
    const coep = root.querySelector("#raCOEP").checked;
    const cspHeader = root.querySelector("#raCSPHeader").checked;
    const format = root.querySelector("#raFormat").value;

    const lines = [];
    lines.push("# Reporting API Headers — Baseline 2026");
    lines.push("# Browser support: Chrome 69+, Edge 79+, Safari 16.4+, Firefox ✗ (planned)");
    lines.push("# Collects browser-generated reports (CSP violations, NEL, deprecations, etc.) at a central endpoint.");
    lines.push("");

    // Report-To header
    if (format === "both" || format === "report-to") {
      const reportTypes = [];
      if (csp) reportTypes.push("csp-violation");
      if (nel) reportTypes.push("nel");
      if (deprecation) reportTypes.push("deprecation");
      if (intervention) reportTypes.push("intervention");
      if (crash) reportTypes.push("crash");
      if (coep) reportTypes.push("coep");

      lines.push("# Server config (Nginx)");
      lines.push('add_header Report-To \'{"group":"' + group + '","max_age":' + maxAge + ',"endpoints":[{"url":"' + endpoint + '"}],' + (failures ? '"include_subdomains":true,' : '') + '"include_subdomains":' + failures + '}\';');
      lines.push("");

      lines.push("# Server config (Apache)");
      lines.push('Header set Report-To \'{"group":"' + group + '","max_age":' + maxAge + ',"endpoints":[{"url":"' + endpoint + '"}],' + (failures ? '"include_subdomains":true,' : '') + '"include_subdomains":' + failures + '}\'');
      lines.push("");

      lines.push("# Raw header value");
      lines.push('Report-To: {"group":"' + group + '","max_age":' + maxAge + ',"endpoints":[{"url":"' + endpoint + '"}],' + (failures ? '"include_subdomains":true,' : '') + '"include_subdomains":' + failures + '}');
      lines.push("");

      if (failures) {
        lines.push("# Note: include_subdomains is deprecated in Reporting API v2. Prefer separate endpoint groups per subdomain.");
      }
    }

    // Reporting-Endpoints header (newer format)
    if (format === "both" || format === "reporting-endpoints") {
      lines.push("");
      lines.push("# Reporting-Endpoints (newer API format, Chrome 96+)");
      lines.push('Reporting-Endpoints: ' + group + '="' + endpoint + '"');
      lines.push("");

      if (csp) {
        lines.push("# CSP integration — use report-to directive (not report-uri)");
        lines.push('Content-Security-Policy: ...; report-to ' + group);
      }
      if (nel) {
        lines.push("# NEL integration");
        lines.push('NEL: {"report_to":"' + group + '","max_age":' + maxAge + ',"success_fraction":0,"failure_fraction":1}');
      }
    }

    lines.push("");
    lines.push("# Notes:");
    lines.push("# 1. The Report-To header must be sent on all responses where reports should be collected.");
    lines.push("# 2. For static sites on GitHub Pages, add headers via _headers file (not supported by all hosts).");
    lines.push("# 3. Reporting-Endpoints is the newer format (Chrome 96+). Report-To is legacy but still widely used.");
    lines.push("# 4. Test with chrome://net-export and the Reporting API Explorer.");

    const activeReports = [csp && "CSP", nel && "NEL", deprecation && "Deprecation", intervention && "Intervention", crash && "Crash", coep && "COEP"].filter(Boolean).join(", ") || "CSP, NEL";

    const preview = `<div style="border:1px solid #e5e7eb;border-radius:10px;padding:16px;background:#f9fafb">
      <div style="font-size:13px;font-weight:600;margin-bottom:8px;color:#374151">Endpoint: ${endpoint}</div>
      <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:12px">
        ${activeReports.split(", ").map(t => `<span style="background:#dbeafe;color:#1e40af;padding:3px 10px;border-radius:12px;font-size:12px">${t}</span>`).join("")}
      </div>
      <div style="font-size:12px;color:#6b7280">
        Group: ${group} &middot; Max age: ${maxAge}s &middot; Subdomains: ${failures ? "yes" : "no"}
      </div>
    </div>`;

    return { output: lines.join("\n"), preview };
  }
};
