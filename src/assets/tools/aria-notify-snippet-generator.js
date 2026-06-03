import { field, select, checkbox, textarea, htmlEscape } from "../tool-core.js";

export default {
  form: `
    <div class="field-grid">
      ${field({ id: "anMessage", label: "Notification message", value: "Form submitted successfully. 3 items saved." })}
      ${select({ id: "anPriority", label: "Priority", options: [
        {label:"normal — standard announcement",value:"normal"},
        {label:"important — interrupts current announcement",value:"important"},
        {label:"none — does not interrupt",value:"none"}
      ], value: "normal" })}
    </div>
    <div class="field-grid">
      ${select({ id: "anTrigger", label: "Trigger event", options: [
        {label:"Form submission",value:"form"},
        {label:"Button click",value:"click"},
        {label:"Async operation complete",value:"async"},
        {label:"Custom dispatch",value:"custom"}
      ], value: "form" })}
      ${field({ id: "anDuration", label: "Notification duration (ms)", type: "number", value: "5000", help: "0 = until cleared manually" })}
    </div>
    <div class="field-grid">
      ${checkbox({ id: "anSilent", label: "Silent mode (no visual feedback)", checked: false })}
      ${checkbox({ id: "anQueued", label: "Queue multiple notifications", checked: true })}
    </div>`,
  generate(root) {
    const message = root.querySelector("#anMessage").value.trim() || "Notification message";
    const priority = root.querySelector("#anPriority").value;
    const trigger = root.querySelector("#anTrigger").value;
    const duration = parseInt(root.querySelector("#anDuration").value) || 5000;
    const silent = root.querySelector("#anSilent").checked;
    const queued = root.querySelector("#anQueued").checked;

    const lines = [];
    lines.push("// ARIA Notify API — Chrome 141+");
    lines.push("// Browser: Chrome 141+, Edge 141+ (experimental). Falls back to aria-live regions.");
    lines.push("// Programmatically notify assistive technology of dynamic content changes.");
    lines.push("");

    lines.push("// Basic notification");
    lines.push(`ariaNotify("${message}", {`);
    lines.push(`  priority: "${priority}",`);
    if (duration > 0) lines.push(`  duration: ${duration},`);
    if (silent) lines.push("  silent: true,");
    lines.push("});");
    lines.push("");

    if (trigger === "form") {
      lines.push("// Example: Notify on form submit");
      lines.push("form.addEventListener('submit', async (event) => {");
      lines.push("  event.preventDefault();");
      lines.push("  // ... process form ...");
      lines.push(`  ariaNotify("${message}", { priority: "${priority}" });`);
      lines.push("});");
    } else if (trigger === "click") {
      lines.push(`document.getElementById('save-btn').addEventListener('click', () => {`);
      lines.push(`  ariaNotify("${message}", { priority: "${priority}" });`);
      lines.push("});");
    } else if (trigger === "async") {
      lines.push("// Notify on async completion");
      lines.push(`async function saveData() {`);
      lines.push("  const result = await fetch('/api/save');");
      lines.push(`  ariaNotify("${message}", { priority: "${priority}" });`);
      lines.push("}");
    } else {
      lines.push("// Dispatch a custom aria-notify event");
      lines.push("document.dispatchEvent(new CustomEvent('aria-notify', {");
      lines.push(`  detail: { message: "${message}", priority: "${priority}" }`);
      lines.push("}));");
    }

    if (queued) {
      lines.push("");
      lines.push("// Queue multiple notifications sequentially");
      lines.push("async function notifyQueue(messages) {");
      lines.push("  for (const msg of messages) {");
      lines.push("    await ariaNotify(msg.message, { priority: msg.priority });");
      lines.push("  }");
      lines.push("}");
    }

    lines.push("");
    lines.push("// Fallback: aria-live region for older browsers");
    lines.push("if (!('ariaNotify' in window)) {");
    lines.push("  const liveRegion = document.createElement('div');");
    lines.push("  liveRegion.setAttribute('aria-live', 'polite');");
    lines.push("  liveRegion.setAttribute('aria-atomic', 'true');");
    lines.push("  liveRegion.className = 'sr-only';");
    lines.push("  document.body.appendChild(liveRegion);");
    lines.push("  // Use liveRegion.textContent = message as fallback");
    lines.push("}");
    lines.push("");
    lines.push("// Notes:");
    lines.push("// 1. ariaNotify() is for programmatic announcements, not user-triggered ones.");
    lines.push("// 2. Works with screen readers and other assistive technology.");
    lines.push("// 3. Each call returns a Promise that resolves when the notification has been announced.");
    lines.push("// 4. Much simpler than managing aria-live regions manually.");

    const preview = `<div style="border:1px solid #e5e7eb;border-radius:10px;overflow:hidden">
      <div style="background:#f9fafb;padding:10px 14px;border-bottom:1px solid #e5e7eb;font-size:12px;font-weight:600;color:#374151">
        ariaNotify() &mdash; ${priority} priority, ${duration > 0 ? duration + "ms" : "manual clear"}
      </div>
      <div style="padding:14px;font-size:13px;color:#374151">
        "${message}"
      </div>
      <div style="padding:8px 14px;background:#f9fafb;border-top:1px solid #e5e7eb;font-size:11px;color:#6b7280;display:flex;gap:12px">
        <span>${trigger}</span>
        ${queued ? "<span>queued</span>" : ""}
        ${silent ? "<span>silent</span>" : ""}
      </div>
    </div>`;

    return { output: lines.join("\n"), preview };
  }
};
