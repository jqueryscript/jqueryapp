import { select, checkbox, htmlEscape } from "../tool-core.js";

const crawlers = [
  { id: "gptbot", name: "GPTBot (OpenAI)", category: "training" },
  { id: "claudebot", name: "ClaudeBot (Anthropic)", category: "training" },
  { id: "google-extended", name: "Google-Extended", category: "training" },
  { id: "perplexitybot", name: "PerplexityBot", category: "training" },
  { id: "ccbot", name: "CCBot (Common Crawl)", category: "training" },
  { id: "cohere-ai", name: "cohere-ai (Cohere)", category: "training" },
  { id: "facebookbot", name: "FacebookBot (Meta)", category: "referral" },
  { id: "applebot-extended", name: "Applebot-Extended", category: "training" },
  { id: "anthropic-ai", name: "anthropic-ai (Anthropic)", category: "training" }
];

const presets = {
  open: { label: "Open — Allow all bots", desc: "Allows all crawlers including AI training bots. Best for sites that want maximum visibility and do not restrict AI data collection." },
  selective: { label: "Selective — Search/referral bots allowed, training bots blocked", desc: "Allows Google, Bing, and other search engines plus Facebook/Apple crawlers. Blocks AI training bots from OpenAI, Anthropic, Perplexity, and Common Crawl." },
  strict: { label: "Strict — Block all AI-related bots", desc: "Blocks all known AI crawlers including search-related ones. Use for sites that do not want any AI crawling." }
};

export default {
  form: `
    <div class="field-grid">
      ${select({ id: "arPreset", label: "Policy preset", options: Object.entries(presets).map(([k,v]) => ({label:v.label,value:k})), value: "selective" })}
    </div>
    <p class="field-note" id="arPresetNote">${presets.selective.desc}</p>
    <div class="field-grid">
      <fieldset class="check-grid">
        <legend>AI crawlers to block</legend>
        ${crawlers.map(c => `<label><input type="checkbox" data-ar="crawler" value="${c.id}" data-ar-cat="${c.category}" ${c.category === 'training' ? 'checked' : ''}> ${htmlEscape(c.name)}</label>`).join("")}
      </fieldset>
    </div>
    <div class="field-grid">
      ${checkbox({ id: "arComments", label: "Include explanatory comments in output", checked: true })}
    </div>`,
  generate(root) {
    const preset = root.querySelector("#arPreset").value;
    const showComments = root.querySelector("#arComments").checked;

    // Apply preset to checkboxes
    const cbs = root.querySelectorAll("[data-ar='crawler']");
    if (preset === "open") {
      cbs.forEach(cb => { cb.checked = false; });
      root.querySelector("#arPresetNote").textContent = presets.open.desc;
    } else if (preset === "selective") {
      cbs.forEach(cb => {
        cb.checked = cb.dataset.arCat === "training";
      });
      root.querySelector("#arPresetNote").textContent = presets.selective.desc;
    } else if (preset === "strict") {
      cbs.forEach(cb => { cb.checked = true; });
      root.querySelector("#arPresetNote").textContent = presets.strict.desc;
    }

    const blocked = Array.from(root.querySelectorAll("[data-ar='crawler']:checked")).map(cb => cb.value);

    if (!blocked.length) {
      return { output: showComments
        ? ["# === robots.txt (AI crawler policy) ===", "", "# No AI crawlers blocked. All bots have full access.", "", "User-agent: *", "Allow: /"].join("\n")
        : ["User-agent: *", "Allow: /"].join("\n") };
    }

    const lines = [];
    if (showComments) {
      lines.push(
        "# === robots.txt — AI crawler policy ===",
        `# Policy: ${presets[preset]?.label || "Custom"}`,
        `# Generated: ${new Date().toISOString().split("T")[0]}`,
        "",
        "# Search and referral crawlers are not listed here.",
        "# Add general rules for all bots below the AI-specific blocks.",
        ""
      );
    }

    // Group by crawler, one block each
    blocked.forEach(id => {
      const crawler = crawlers.find(c => c.id === id);
      if (crawler) {
        const uaName = crawler.name.split(" (")[0]; // Strip parenthetical like "(OpenAI)"
        if (showComments) {
          lines.push(`# ${crawler.name} — ${crawler.category === "training" ? "AI training / data collection" : "Referral / preview"} crawler`);
        }
        lines.push(`User-agent: ${uaName}`);
        lines.push("Disallow: /");
        lines.push("");
      }
    });

    if (showComments) {
      lines.push(
        "# === Notes ===",
        "# 1. Some CDNs and WAFs (Cloudflare Bot Management) can override robots.txt.",
        "# 2. robots.txt controls crawling, not indexing. For indexing control, use X-Robots-Tag or meta robots.",
        "# 3. Not all crawlers respect robots.txt — it is a voluntary standard.",
        "# 4. Review your robots.txt in Google Search Console to confirm it is read correctly."
      );
    }

    return { output: lines.join("\n") };
  }
};
