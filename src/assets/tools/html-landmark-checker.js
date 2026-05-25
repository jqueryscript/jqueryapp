import { field, textarea, select, checkbox, htmlEscape, attrEscape, normalizeUrl } from "../tool-core.js";

export default {
    form: `
      ${textarea({ id: "lmHtml", label: "Paste HTML", value: '<header>\n  <nav>\n    <a href="/">Home</a>\n  </nav>\n</header>\n<main>\n  <h1>Page Title</h1>\n  <section>\n    <h2>Section</h2>\n    <p>Content here.</p>\n  </section>\n</main>\n<footer>\n  <p>Copyright</p>\n</footer>' })}`,
    generate(root) {
      const html = root.querySelector("#lmHtml").value;
      const landmarks = ["header", "main", "nav", "footer", "aside", "section", "form", "search"];
      const found = {};
      const regex = /<(header|main|nav|footer|aside|section|form|search)(\s[^>]*)?>/gi;
      let match;
      let mainCount = 0;
      while ((match = regex.exec(html)) !== null) {
        const tag = match[1].toLowerCase();
        if (!found[tag]) found[tag] = 0;
        found[tag]++;
        if (tag === "main") mainCount++;
      }
      let report = "HTML Landmark Checker Report\n\n";
      report += "Landmark Elements Found:\n\n";
      for (const lm of landmarks) {
        const count = found[lm] || 0;
        if (count > 0) {
          report += '  [OK] <' + lm + '> found (' + count + ' time' + (count !== 1 ? "s" : "") + ')\n';
        } else {
          report += '  [MISSING] <' + lm + '> not found\n';
        }
      }
      report += "\nCritical Checks:\n\n";
      if (mainCount === 0) {
        report += "  [FAIL] No <main> landmark found. <main> is essential for accessibility.\n";
      } else if (mainCount > 1) {
        report += "  [WARN] Multiple <main> elements (" + mainCount + ") found. Only one <main> should exist per page.\n";
      } else {
        report += "  [OK] Exactly one <main> element found.\n";
      }
      const output = report;
      const preview = '<div style="font-family:monospace;font-size:0.875rem;line-height:1.6;white-space:pre-wrap;background:#1e293b;color:#e2e8f0;padding:1rem;border-radius:6px">' + htmlEscape(report) + '</div>';
      return { output, preview };
    }
  };
