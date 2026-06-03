import { field, select, checkbox, textarea, htmlEscape } from "../tool-core.js";

export default {
  form: `
    <div class="field-grid">
      ${select({ id: "iipAction", label: "Invoker action", options: [
        {label:"Show popover on hover/focus (interestfor)",value:"interest"},
        {label:"Toggle popover on click",value:"toggle"},
        {label:"Show popover",value:"show"},
        {label:"Hide popover",value:"hide"}
      ], value: "interest" })}
      ${field({ id: "iipTarget", label: "Popover target id", value: "tooltip-popover" })}
    </div>
    <div class="field-grid">
      ${field({ id: "iipTrigger", label: "Trigger element id", value: "info-button" })}
      ${select({ id: "iipType", label: "Popover type", options: [
        {label:"auto (light-dismiss)",value:"auto"},
        {label:"manual (no light-dismiss)",value:"manual"},
        {label:"hint (no modal behavior)",value:"hint"}
      ], value: "hint" })}
    </div>
    <div class="field-grid">
      ${textarea({ id: "iipContent", label: "Popover content (HTML)", value: "<p>This tooltip appears on hover.</p>\n<p>Move your mouse away and it closes.</p>", full: true })}
    </div>`,
  generate(root) {
    const action = root.querySelector("#iipAction").value;
    const target = root.querySelector("#iipTarget").value.trim() || "tooltip-popover";
    const trigger = root.querySelector("#iipTrigger").value.trim() || "info-button";
    const type = root.querySelector("#iipType").value;
    const content = root.querySelector("#iipContent").value.trim();

    const actionMap = { interest: "interestfor", toggle: "togglePopover", show: "showPopover", hide: "hidePopover" };
    const invokerAction = actionMap[action];

    const lines = [];
    lines.push("<!-- interestfor Invoker + Popover API — Chrome 142+ -->");
    lines.push("<!-- Browser: Chrome 142+, Edge 142+ (experimental). Other browsers: progressive enhancement. -->");
    lines.push("<!-- interestfor opens a popover on hover/focus without JavaScript. -->");
    lines.push("");

    lines.push(`<!-- Trigger button -->`);
    lines.push(`<button id="${trigger}" commandfor="${target}" command="${invokerAction}">`);
    lines.push(action === "interest" ? "  Hover for info" : `  ${action === "toggle" ? "Toggle" : action === "show" ? "Show" : "Hide"} popover`);
    lines.push("</button>");
    lines.push("");

    lines.push(`<!-- Popover -->`);
    lines.push(`<div id="${target}" popover="${type}">`);
    if (content) lines.push(content.split("\n").map(l => `  ${l}`).join("\n"));
    lines.push("</div>");
    lines.push("");

    if (action === "interest") {
      lines.push("/* CSS: Optional styling for the invoker relationship */");
      lines.push(`[commandfor="${target}"] { cursor: help; }`);
      lines.push(`[commandfor="${target}"]:hover { text-decoration: underline dotted; }`);
    }

    lines.push("");
    lines.push("<!-- Notes: -->");
    lines.push("<!-- 1. interestfor opens the popover on hover AND focus (keyboard accessible). -->");
    lines.push("<!-- 2. Requires popover attribute on the target element (auto, manual, or hint). -->");
    lines.push("<!-- 3. No JavaScript needed — pure declarative HTML. -->");
    lines.push("<!-- 4. For older browsers, falls back to a regular button that does nothing visible. -->");
    lines.push("<!-- 5. Use hint popover type for tooltips to avoid light-dismiss behavior. -->");

    const previewStyle = "border:1px solid #d1d5db;border-radius:8px;padding:16px;background:#fff;box-shadow:0 4px 12px rgba(0,0,0,0.1);max-width:300px";

    const preview = `<div style="display:flex;gap:16px;align-items:flex-start;flex-wrap:wrap">
      <div style="text-align:center">
        <div style="font-size:11px;color:#6b7280;margin-bottom:6px">Trigger: hover/focus</div>
        <div style="display:inline-block;background:#3b82f6;color:#fff;padding:8px 16px;border-radius:6px;font-size:14px;font-weight:600;cursor:pointer;position:relative">
          Hover for info
          <div style="position:absolute;top:100%;left:50%;transform:translateX(-50%);margin-top:8px;${previewStyle};z-index:10">
            <div style="font-size:12px;color:#374151">${content ? content.replace(/<[^>]*>/g, "").substring(0, 100) : "Popover content appears on hover"}</div>
            <div style="font-size:10px;color:#6b7280;margin-top:6px">interestfor &middot; popover=hint</div>
          </div>
        </div>
      </div>
      <div style="flex:1;min-width:180px">
        <div style="font-size:12px;font-weight:600;color:#374151;margin-bottom:6px">Attributes</div>
        <div style="font-size:11px;font-family:monospace;background:#f9fafb;padding:8px;border-radius:6px">
          commandfor="${target}"<br>
          command="${invokerAction}"<br>
          popover="${type}"
        </div>
      </div>
    </div>`;

    return { output: lines.join("\n"), preview };
  }
};
