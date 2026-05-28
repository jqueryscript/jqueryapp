import { textarea, htmlEscape } from "../tool-core.js";

export default {
  form: `
    <div class="field-grid">
      ${textarea({ id: "lvContent", label: "Paste llms.txt content", help: "Paste the full llms.txt file content to validate against the llms.txt specification." })}
    </div>`,
  generate(root) {
    const raw = root.querySelector("#lvContent").value;

    if (!raw.trim()) {
      return { output: "Paste an llms.txt file to validate. The file should contain an H1 title, optional blockquote summary, sections with ## headings, and Markdown links." };
    }

    const lines = raw.split("\n");
    const errors = [];
    const warnings = [];
    const info = [];

    let hasH1 = false;
    let h1Line = -1;
    let inBlockquote = false;
    let blockquoteEmpty = true;
    let sectionCount = 0;
    let linkCount = 0;
    let brokenLinkCount = 0;
    let currentSection = "(no section)";

    for (let i = 0; i < lines.length; i++) {
      const ln = i + 1;
      const trimmed = lines[i].trim();

      // Skip empty lines
      if (!trimmed) continue;

      // H1 check
      if (trimmed.startsWith("# ")) {
        if (hasH1) {
          warnings.push(`Line ${ln}: Multiple H1 headings. Only the first H1 is treated as the file title. Consider using ## for subsequent sections.`);
        } else {
          hasH1 = true;
          h1Line = ln;
          currentSection = trimmed.substring(2).trim();
        }
        continue;
      }

      // Section headings
      if (trimmed.startsWith("## ")) {
        sectionCount++;
        currentSection = trimmed.substring(3).trim();
        continue;
      }

      // Blockquote
      if (trimmed.startsWith("> ")) {
        if (!inBlockquote && !hasH1) {
          errors.push(`Line ${ln}: Blockquote appears before the H1 title. The H1 must come first.`);
        }
        inBlockquote = true;
        if (trimmed.length > 3) blockquoteEmpty = false;
        continue;
      }
      if (inBlockquote && !trimmed.startsWith("> ")) {
        inBlockquote = false;
      }

      // Markdown links
      const linkRegex = /\[([^\]]*)\]\(([^)]*)\)/g;
      let match;
      while ((match = linkRegex.exec(trimmed)) !== null) {
        linkCount++;
        const linkText = match[1];
        const linkUrl = match[2];

        if (!linkText.trim()) {
          warnings.push(`Line ${ln}: Empty link text: [](${linkUrl}) — screen readers and AI models get no context.`);
        }
        if (!linkUrl.trim()) {
          errors.push(`Line ${ln}: Empty link URL: [${linkText}]() — broken link.`);
          brokenLinkCount++;
        } else if (linkUrl.startsWith("/") && !linkUrl.startsWith("//")) {
          warnings.push(`Line ${ln}: Relative URL "${linkUrl}". Use absolute URLs (https://...) so the file works regardless of where it is read.`);
        } else if (!linkUrl.startsWith("http://") && !linkUrl.startsWith("https://") && !linkUrl.startsWith("mailto:")) {
          warnings.push(`Line ${ln}: Possibly invalid URL "${linkUrl}". Use absolute URLs starting with https://.`);
        }
      }
    }

    // Post-parse checks
    if (!hasH1) {
      errors.push("Missing H1 heading. The file must start with a top-level heading (# Title).");
    } else if (h1Line !== 1) {
      warnings.push(`H1 heading found at line ${h1Line}. The H1 should be the first non-empty line of the file.`);
    }

    if (linkCount === 0) {
      warnings.push("No Markdown links found. llms.txt is designed to provide structured links for AI discovery.");
    }

    if (raw.length > 100 * 1024) {
      warnings.push(`File is ${(raw.length / 1024).toFixed(0)} KB. Large llms.txt files may be ignored or truncated by AI tools. Keep it under 100KB.`);
    }

    const out = [];
    out.push(`=== llms.txt Validation Report ===`);
    out.push(`Lines: ${lines.length} | Sections: ${sectionCount} | Links: ${linkCount} | Broken links: ${brokenLinkCount}`);
    out.push("");

    if (errors.length) {
      out.push(`--- Errors (${errors.length}) ---`);
      errors.forEach(e => out.push(`  ERROR: ${e}`));
      out.push("");
    }
    if (warnings.length) {
      out.push(`--- Warnings (${warnings.length}) ---`);
      warnings.forEach(w => out.push(`  WARN: ${w}`));
      out.push("");
    }
    if (!errors.length && !warnings.length) {
      out.push("No issues found. The file looks well-formed.", "");
    }

    out.push(
      "--- llms.txt Format Quick Reference ---",
      "# Title           — H1 heading describing the site",
      "> Brief summary   — Optional blockquote with one-sentence description",
      "## Section        — Section heading for a group of links",
      "- [text](url)     — Markdown link to a key page",
      "",
      "Publish at: https://yoursite.com/llms.txt"
    );

    return { output: out.join("\n") };
  }
};
