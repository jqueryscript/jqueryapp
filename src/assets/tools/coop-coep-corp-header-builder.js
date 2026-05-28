import { select, checkbox, htmlEscape } from "../tool-core.js";

const presets = {
  isolation: {
    label: "Cross-origin isolation (SharedArrayBuffer, WASM threads)",
    coop: "same-origin",
    coep: "require-corp",
    corp: "same-origin",
    desc: "Required for SharedArrayBuffer, high-resolution timers, and advanced WASM features."
  },
  moderate: {
    label: "Moderate — isolate opener but allow most embeds",
    coop: "same-origin-allow-popups",
    coep: "credentialless",
    corp: "cross-origin",
    desc: "Isolates the opener relationship but allows third-party images, fonts, and media without CORP headers."
  },
  relaxed: {
    label: "Relaxed — basic opener isolation only",
    coop: "same-origin-allow-popups",
    coep: "unsafe-none",
    corp: "cross-origin",
    desc: "Minimal isolation. Prevents opener access but does not restrict embedded resources."
  },
  custom: {
    label: "Custom — choose each value",
    coop: "same-origin",
    coep: "unsafe-none",
    corp: "cross-origin",
    desc: "Set each header value individually."
  }
};

export default {
  form: `
    <div class="field-grid">
      ${select({ id: "coGoal", label: "Isolation goal", options: Object.entries(presets).map(([k,v])=>({label:v.label,value:k})), value: "moderate" })}
    </div>
    <div class="field-grid">
      ${select({ id: "coCOOP", label: "Cross-Origin-Opener-Policy", options: [
        {label:"same-origin",value:"same-origin"},
        {label:"same-origin-allow-popups",value:"same-origin-allow-popups"},
        {label:"unsafe-none",value:"unsafe-none"}
      ], value: "same-origin-allow-popups" })}
      ${select({ id: "coCOEP", label: "Cross-Origin-Embedder-Policy", options: [
        {label:"require-corp",value:"require-corp"},
        {label:"credentialless",value:"credentialless"},
        {label:"unsafe-none",value:"unsafe-none"}
      ], value: "credentialless" })}
    </div>
    <div class="field-grid">
      ${select({ id: "coCORP", label: "Cross-Origin-Resource-Policy", options: [
        {label:"same-origin",value:"same-origin"},
        {label:"same-site",value:"same-site"},
        {label:"cross-origin",value:"cross-origin"}
      ], value: "cross-origin" })}
      ${checkbox({ id: "coDebug", label: "Include debugging checklist", checked: true })}
    </div>`,
  generate(root) {
    const goal = root.querySelector("#coGoal").value;
    const coop = root.querySelector("#coCOOP").value;
    const coep = root.querySelector("#coCOEP").value;
    const corp = root.querySelector("#coCORP").value;
    const debug = root.querySelector("#coDebug").checked;

    // Apply preset to dropdowns
    const preset = presets[goal];
    if (goal !== "custom") {
      root.querySelector("#coCOOP").value = preset.coop;
      root.querySelector("#coCOEP").value = preset.coep;
      root.querySelector("#coCORP").value = preset.corp;
    }

    const lines = [];
    lines.push(`# === Cross-Origin Isolation Headers ===`);
    lines.push(`# Goal: ${preset.label}`);
    lines.push("");
    lines.push(`Cross-Origin-Opener-Policy: ${coop}`);
    lines.push(`Cross-Origin-Embedder-Policy: ${coep}`);
    lines.push(`Cross-Origin-Resource-Policy: ${corp}`);
    lines.push("");

    lines.push("# === What Each Header Does ===");
    lines.push(`# COOP (${coop}): Controls whether this page can be accessed via window.opener.`);
    lines.push(`# COEP (${coep}): Controls whether cross-origin resources can be loaded without CORP headers.`);
    lines.push(`# CORP (${corp}): Controls whether this resource can be loaded by other origins.`);
    lines.push("");

    if (coep === "require-corp") {
      lines.push("# WARNING: COEP require-corp blocks ALL cross-origin resources without a CORP header.");
      lines.push("# Third-party fonts, CDN images, analytics scripts, and embeds will break unless");
      lines.push("# they send Cross-Origin-Resource-Policy: cross-origin or you load them with the");
      lines.push("# crossorigin attribute. Test thoroughly with real third-party content.");
      lines.push("");
    }

    if (debug) {
      lines.push(
        "# === Debugging Checklist ===",
        "# 1. Open DevTools Console — broken resources show CORP/COEP errors.",
        "# 2. Check the Network tab for blocked resources (red entries).",
        "# 3. Verify third-party embeds (YouTube, maps, analytics) still load.",
        "# 4. Check that fonts from Google Fonts or CDNs still render.",
        "# 5. Test SharedArrayBuffer if that is your goal: typeof SharedArrayBuffer === 'function'",
        "# 6. Deploy with report-only first: Cross-Origin-Opener-Policy-Report-Only",
        "# 7. Use the Reporting API to collect violation reports."
      );
    }

    return { output: lines.join("\n") };
  }
};
