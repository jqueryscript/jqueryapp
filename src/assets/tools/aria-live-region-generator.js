import { field, textarea, select, checkbox, htmlEscape } from "../tool-core.js";

const regionTypes = {
  status: { role: "status", live: "polite", desc: "Advisory information not critical to immediate action. Screen readers read after current activity." },
  alert: { role: "alert", live: "assertive", desc: "Time-sensitive or critical information. Screen readers interrupt current speech." },
  log: { role: "log", live: "polite", desc: "Sequential updates like chat messages or command history. New items are read in order." },
  timer: { role: "timer", live: "polite", desc: "Countdown or elapsed time display. Updates are announced periodically." },
  marquee: { role: "marquee", live: "off", desc: "Non-essential changing content like stock tickers or ad banners. Not announced." }
};

export default {
  form: `
    <div class="field-grid">
      ${select({ id: "alRegionType", label: "Region type", options: Object.entries(regionTypes).map(([k,v])=>({label:`${k} (role="${v.role}", aria-live="${v.live}")`,value:k})), value: "status" })}
    </div>
    <div class="field-grid">
      ${select({ id: "alAtomic", label: "Atomic updates (aria-atomic)", options: [{label:"true — announce entire region",value:"true"},{label:"false — announce only changes",value:"false"}], value: "false" })}
      ${select({ id: "alRelevant", label: "Relevant changes (aria-relevant)", options: [{label:"additions",value:"additions"},{label:"removals",value:"removals"},{label:"text",value:"text"},{label:"all",value:"all"},{label:"additions text",value:"additions text"}], value: "additions" })}
    </div>
    <div class="field-grid">
      ${field({ id: "alId", label: "Region ID", value: "live-region" })}
      ${checkbox({ id: "alScript", label: "Include JavaScript update function", checked: true })}
    </div>
    <div class="field-grid">
      ${textarea({ id: "alInitial", label: "Initial content (optional)", help: "Starting text content for the live region. Leave empty for an initially empty region." })}
    </div>`,
  generate(root) {
    const typeKey = root.querySelector("#alRegionType").value;
    const atomic = root.querySelector("#alAtomic").value;
    const relevant = root.querySelector("#alRelevant").value;
    const regionId = root.querySelector("#alId").value.trim() || "live-region";
    const includeScript = root.querySelector("#alScript").checked;
    const initial = root.querySelector("#alInitial").value.trim();

    const type = regionTypes[typeKey];
    const lines = [];

    lines.push(`<!-- ${type.desc} -->`);
    lines.push(`<div`);
    lines.push(`  id="${regionId}"`);
    if (type.role) lines.push(`  role="${type.role}"`);
    if (type.live) lines.push(`  aria-live="${type.live}"`);
    if (atomic !== "false") lines.push(`  aria-atomic="${atomic}"`);
    if (relevant !== "additions") lines.push(`  aria-relevant="${relevant}"`);
    lines.push(`>${initial ? "\n  " + htmlEscape(initial) + "\n" : ""}</div>`);

    if (includeScript) {
      lines.push("");
      lines.push("<script>");
      lines.push(`  function updateLiveRegion(message) {`);
      lines.push(`    const region = document.getElementById("${regionId}");`);
      lines.push("    if (region) {");
      lines.push("      region.textContent = message;");
      lines.push("    }");
      lines.push("  }");
      lines.push("</script>");
    }

    lines.push("");
    lines.push(
      "/* === ARIA Live Region Notes === */",
      `/* Type: ${typeKey} — ${type.desc} */`,
      "/* 1. The live region must be present in the DOM BEFORE updates are sent. */",
      "/* 2. Use textContent (not innerHTML) for updates to avoid re-triggering the region. */",
      "/* 3. aria-atomic=\"true\" announces the entire contents. false announces only changes. */",
      "/* 4. Over-announcing frustrates users. Only update for meaningful state changes. */",
      "/* 5. For form errors, use aria-live=\"polite\" on a dedicated error container. */",
      "/* 6. Do not use aria-live=\"assertive\" for non-critical updates — it interrupts users. */"
    );

    return { output: lines.join("\n") };
  }
};
