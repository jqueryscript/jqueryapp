import { field, textarea, select, checkbox, htmlEscape, attrEscape, normalizeUrl } from "../tool-core.js";

export default {
    form: `
      <div class="field-grid">
        ${select({
          id: "schemaType",
          label: "Schema type",
          value: "WebSite",
          options: [
            { label: "WebSite", value: "WebSite" },
            { label: "Organization", value: "Organization" },
            { label: "Article", value: "Article" },
            { label: "FAQPage", value: "FAQPage" },
            { label: "BreadcrumbList", value: "BreadcrumbList" }
          ]
        })}
        ${field({ id: "name", label: "Name or title", value: "Example Tools" })}
        ${field({ id: "url", label: "URL", value: "https://example.com/", full: true })}
        ${textarea({ id: "description", label: "Description", value: "Practical tools for publishing static websites.", full: true })}
        ${textarea({ id: "items", label: "FAQ or breadcrumb lines", value: "What is this site?|A small collection of useful web tools.\nTools|https://example.com/tools/", help: "FAQ: question|answer. Breadcrumb: name|url." })}
      </div>`,
    generate(root) {
      const type = root.querySelector("#schemaType").value;
      const name = root.querySelector("#name").value.trim();
      const url = normalizeUrl(root.querySelector("#url").value);
      const description = root.querySelector("#description").value.trim();
      const rows = root.querySelector("#items").value.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
      let schema;
      if (type === "FAQPage") {
        schema = {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: rows.map((line) => {
            const [question, ...answer] = line.split("|");
            return {
              "@type": "Question",
              name: (question || "").trim(),
              acceptedAnswer: {
                "@type": "Answer",
                text: answer.join("|").trim()
              }
            };
          }).filter((item) => item.name && item.acceptedAnswer.text)
        };
      } else if (type === "BreadcrumbList") {
        schema = {
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: rows.map((line, index) => {
            const [itemName, itemUrl] = line.split("|").map((part) => part.trim());
            return {
              "@type": "ListItem",
              position: index + 1,
              name: itemName,
              item: normalizeUrl(itemUrl)
            };
          }).filter((item) => item.name && item.item)
        };
      } else {
        schema = {
          "@context": "https://schema.org",
          "@type": type,
          name,
          url,
          description
        };
        if (type === "Article") schema.headline = name;
      }
      return { output: `<script type="application/ld+json">\n${JSON.stringify(schema, null, 2)}\n</script>` };
    }
  };
