import { field, textarea, select, checkbox, htmlEscape } from "../tool-core.js";

const targets = [
  { id: "dialog", label: "Dialog (showModal/close)", commands: ["show-modal","close"] },
  { id: "popover", label: "Popover (show/hide)", commands: ["show-popover","hide-popover","toggle-popover"] },
  { id: "details", label: "Details/Disclosure (open/close)", commands: ["open","close","toggle"] },
  { id: "custom", label: "Custom command (JS listener)", commands: ["custom"] }
];

export default {
  form: `
    <div class="field-grid">
      ${field({ id: "ivTargetId", label: "Target element ID", help: "The id of the dialog, popover, or other target element.", value: "my-dialog" })}
      ${select({ id: "ivTarget", label: "Target type", options: targets.map(t => ({label:t.label,value:t.id})), value: "dialog" })}
    </div>
    <div class="field-grid">
      ${select({ id: "ivCommand", label: "Command", options: targets[0].commands.map(c => ({label:c,value:c})), value: "show-modal" })}
      ${field({ id: "ivButtonText", label: "Button text", value: "Open Dialog" })}
    </div>
    <div class="field-grid">
      ${checkbox({ id: "ivTemplate", label: "Include target element template", checked: true })}
      ${checkbox({ id: "ivCustomJs", label: "Include custom command JS fallback", checked: false })}
    </div>`,
  generate(root) {
    const targetId = root.querySelector("#ivTargetId").value.trim() || "my-target";
    const targetType = root.querySelector("#ivTarget").value;
    const command = root.querySelector("#ivCommand").value;
    const buttonText = root.querySelector("#ivButtonText").value.trim() || "Click";
    const includeTarget = root.querySelector("#ivTemplate").checked;
    const includeCustom = root.querySelector("#ivCustomJs").checked;

    // Update command dropdown based on target type
    const t = targets.find(x => x.id === targetType);
    const sel = root.querySelector("#ivCommand");
    const currentCmd = sel.value;
    sel.innerHTML = (t ? t.commands : ["custom"]).map(c =>
      `<option value="${c}" ${c === currentCmd ? "selected" : ""}>${c}</option>`
    ).join("");

    const lines = [];
    lines.push("/* === Invoker Commands API (Baseline 2025) === */);

    // Button HTML
    lines.push("");
    lines.push("<!-- Trigger Button -->");
    lines.push(`<button commandfor="${htmlEscape(targetId)}" command="${htmlEscape(command)}">`);
    lines.push(`  ${htmlEscape(buttonText)}`);
    lines.push("</button>");

    // Target template
    if (includeTarget) {
      lines.push("");
      if (targetType === "dialog") {
        lines.push("<!-- Target Dialog -->");
        lines.push(`<dialog id="${htmlEscape(targetId)}">`);
        lines.push("  <h2>Dialog Title</h2>");
        lines.push("  <p>Dialog content goes here.</p>");
        lines.push(`  <button commandfor="${htmlEscape(targetId)}" command="close">Close</button>`);
        lines.push("</dialog>");
      } else if (targetType === "popover") {
        lines.push("<!-- Target Popover -->");
        lines.push(`<div id="${htmlEscape(targetId)}" popover>`);
        lines.push("  <p>Popover content.</p>");
        lines.push(`  <button commandfor="${htmlEscape(targetId)}" command="hide-popover">Close</button>`);
        lines.push("</div>");
      } else if (targetType === "details") {
        lines.push("<!-- Target Details -->");
        lines.push(`<details id="${htmlEscape(targetId)}">`);
        lines.push("  <summary>Summary text</summary>");
        lines.push("  <p>Disclosed content.</p>");
        lines.push("</details>");
      } else {
        lines.push(`<!-- Custom target element -->`);
        lines.push(`<div id="${htmlEscape(targetId)}">`);
        lines.push("  <!-- Element content -->");
        lines.push("</div>");
      }
    }

    // Custom JS fallback
    if (includeCustom) {
      lines.push("");
      lines.push("<!-- Custom Command Event Handler (JS fallback) -->");
      lines.push("<script>");
      if (targetType === "custom") {
        lines.push(`  document.getElementById("${targetId}").addEventListener("command", (e) => {`);
        lines.push("    // Handle the custom command");
        lines.push(`    console.log('Command:', e.command, 'Source:', e.source);`);
        lines.push("  });");
      } else {
        lines.push("  // Invoker Commands work without JavaScript in supporting browsers.");
        lines.push("  // This fallback ensures behavior in older browsers:");
        lines.push(`  const btn = document.querySelector('[commandfor=\"${targetId}\"]');`);
        lines.push("  if (btn && !('commandForElement' in btn)) {");
        if (targetType === "dialog") {
          lines.push(`    const dialog = document.getElementById("${targetId}");`);
          lines.push(`    btn.addEventListener('click', () => dialog.showModal());`);
        } else if (targetType === "popover") {
          lines.push(`    const popover = document.getElementById("${targetId}");`);
          lines.push(`    btn.addEventListener('click', () => popover.togglePopover());`);
        }
        lines.push("  }");
      }
      lines.push("</script>");
    }

    lines.push("");
    lines.push(
      "/* === Notes === */",
      "/* 1. Invoker Commands are declarative — no JavaScript needed for built-in targets. */",
      "/* 2. Supported in Chrome 117+, Edge 117+, Safari 18+. Firefox support is in development. */",
      "/* 3. commandfor and command replace onclick handlers for dialog/popover/disclosure. */",
      "/* 4. For custom commands, listen for the 'command' event on the target element. */",
      "/* 5. The command attribute on the target <button> element is the default action. */"
    );

    let targetPreview = "";
    if (targetType === "dialog") {
      targetPreview = `<dialog id="${targetId}-pv" style="padding:1rem;border-radius:8px;border:1px solid #e5e7eb"><p>Dialog content</p><form method="dialog"><button style="padding:6px 16px;border:1px solid #d1d5db;border-radius:4px;cursor:pointer">Close</button></form></dialog>`;
    } else if (targetType === "popover") {
      targetPreview = `<div id="${targetId}-pv" popover style="padding:1rem;border:1px solid #e5e7eb;border-radius:8px;box-shadow:0 2px 8px rgba(0,0,0,0.1)"><p>Popover content</p></div>`;
    } else if (targetType === "details") {
      targetPreview = `<details id="${targetId}-pv"><summary>Details summary</summary><p>Disclosed content.</p></details>`;
    } else {
      targetPreview = `<div id="${targetId}-pv" style="padding:1rem;border:1px dashed #d1d5db;border-radius:8px;text-align:center;color:#6b7280">Custom target element</div>`;
    }
    const preview = `<div style="text-align:center;padding:16px">
      <button commandfor="${targetId}-pv" command="${command}" style="padding:10px 20px;border:2px solid var(--accent,#2563eb);border-radius:8px;background:var(--accent,#2563eb);color:#fff;font-size:15px;cursor:pointer;font-weight:600">${htmlEscape(buttonText)}</button>
      ${targetPreview}
    </div>`;
    return { output: lines.join("\n"), preview };
  }
};
