import { field, textarea, select, checkbox, htmlEscape, attrEscape, normalizeUrl } from "../tool-core.js";

export default {
    form: `
      <div class="field-grid">
        ${select({
          id: "specType",
          label: "Speculation type",
          value: "prerender",
          options: [
            { label: "Prerender (full page render)", value: "prerender" },
            { label: "Prefetch (document only)", value: "prefetch" }
          ]
        })}
        ${select({
          id: "specSource",
          label: "Source type",
          value: "list",
          options: [
            { label: "URL list", value: "list" },
            { label: "Document rules (same-origin links)", value: "document-rules" }
          ]
        })}
        ${textarea({
          id: "specUrls",
          label: "URLs to include",
          value: "/about/\n/tools/\n/faq/",
          help: "One URL per line. Only used for list source type."
        })}
        ${select({
          id: "specEagerness",
          label: "Eagerness",
          value: "moderate",
          options: [
            { label: "conservative (hover / focus)", value: "conservative" },
            { label: "moderate (hover + 200ms)", value: "moderate" },
            { label: "eager (immediate)", value: "eager" }
          ]
        })}
      </div>`,
    generate(root) {
      const specType = root.querySelector("#specType").value;
      const source = root.querySelector("#specSource").value;
      const eagerness = root.querySelector("#specEagerness").value;
      const urls = root.querySelector("#specUrls").value.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
      let rules;
      if (source === "list") {
        rules = {
          [specType]: urls.map(url => {
            const entry = { source: "list", urls: [url] };
            if (eagerness !== "moderate") entry.eagerness = eagerness;
            return entry;
          }).filter(r => r.urls[0])
        };
      } else {
        rules = {
          [specType]: [{
            source: "document",
            where: {
              href_matches: "/*"
            }
          }]
        };
        if (eagerness !== "moderate") rules[specType][0].eagerness = eagerness;
      }
      if (Object.keys(rules[specType]).length === 0 || (Array.isArray(rules[specType]) && rules[specType].length === 0)) {
        return { output: "Add at least one URL, or switch to document rules." };
      }
      return { output: `<script type="speculationrules">\n${JSON.stringify(rules, null, 2)}\n</script>\n\n<!-- Place in <head> or near the end of <body>.\n     Chrome 109+ and Edge 109+ support Speculation Rules.\n     Other browsers ignore the script tag — safe as progressive enhancement.\n     Prerendering = full page fetch and render (fastest, more bandwidth).\n     Prefetching = document resource only (lighter, less bandwidth). -->` };
    }
  };
