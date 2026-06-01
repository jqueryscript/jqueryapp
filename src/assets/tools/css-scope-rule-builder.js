import { field, textarea, select, checkbox, htmlEscape } from "../tool-core.js";

export default {
  form: `
    <div class="field-grid">
      ${select({ id: "csScope", label: "Scope root", options: [
        {label:"Component class",value:"component"},
        {label:"ID selector",value:"id"},
        {label:"Data attribute",value:"data"}
      ], value: "component" })}
      ${field({ id: "csRoot", label: "Scope root selector", value: ".card" })}
    </div>
    <div class="field-grid">
      ${field({ id: "csLimit", label: "Scope limit selector (optional)", value: ".card-content", help: "Stop scoping at this boundary" })}
      ${checkbox({ id: "csImplicit", label: "Use implicit @scope (no lower boundary)", checked: false })}
    </div>
    <div class="field-grid">
      ${textarea({ id: "csRules", label: "Scoped CSS rules", value: "img { border-radius: 8px; width: 100%; }\nh2 { font-size: 1.25rem; color: #1a1a2e; }\np { line-height: 1.6; }", full: true })}
    </div>`,
  generate(root) {
    const scopeType = root.querySelector("#csScope").value;
    const rootSel = root.querySelector("#csRoot").value.trim() || ".card";
    const limitSel = root.querySelector("#csLimit").value.trim();
    const implicit = root.querySelector("#csImplicit").checked;
    const rules = root.querySelector("#csRules").value.trim();

    let fullRoot;
    if (scopeType === "component") fullRoot = rootSel;
    else if (scopeType === "id") fullRoot = `#${rootSel.replace(/^#/, "")}`;
    else fullRoot = `[${rootSel.replace(/^\[|\]$/g, "")}]`;

    const upper = fullRoot;
    const lower = implicit ? "" : (limitSel || `:scope ${upper}`);

    const lines = [];
    lines.push("/* CSS @scope — Baseline 2025 */");
    lines.push("/* Browser: Chrome 118+, Edge 118+, Safari 17.4+, Firefox 128+ */");
    lines.push("/* Scopes styles to a DOM subtree, preventing style leaks. */");
    lines.push("");
    lines.push(`@scope (${upper})${lower ? ` to (${lower})` : ""} {`);
    lines.push(rules.split("\n").map(r => r.trim() ? `  ${r}` : "").join("\n"));
    lines.push("}");
    lines.push("");
    lines.push("/* How @scope works: */");
    lines.push(`/* 1. Styles inside @scope (${upper}) only apply to elements within the scoped subtree. */`);
    if (lower) lines.push(`/* 2. to (${lower}) creates a lower boundary — scoped styles stop at this element. */`);
    lines.push("/* 3. Scoped styles have lower specificity than unscoped styles with the same selector. */");
    lines.push("/* 4. @scope replaces BEM naming conventions and CSS Modules for style isolation. */");

    const preview = `<div style="border:1px solid #e5e7eb;border-radius:10px;overflow:hidden">
      <div style="background:#1e293b;color:#e2e8f0;padding:10px 14px;font-family:monospace;font-size:12px">
        <span style="color:#f59e0b">@scope</span> (${upper})${lower ? ` <span style="color:#f59e0b">to</span> (${lower})` : ""} {
      </div>
      <div style="background:#0f172a;color:#cbd5e1;padding:8px 20px;font-family:monospace;font-size:12px;line-height:1.8">
        ${rules.split("\n").filter(r => r.trim()).map(r => `<span style="color:#94a3b8">  ${r.trim()}</span><br>`).join("")}
      </div>
      <div style="background:#1e293b;color:#e2e8f0;padding:8px 14px;font-family:monospace;font-size:12px">}</div>
    </div>`;

    return { output: lines.join("\n"), preview };
  }
};
