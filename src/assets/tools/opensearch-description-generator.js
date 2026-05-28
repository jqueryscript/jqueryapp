import { field, textarea, select, htmlEscape, attrEscape } from "../tool-core.js";

export default {
  form: `
    <div class="field-grid">
      ${field({ id: "osShortName", label: "Short name", help: "Max 16 characters. The name shown in the browser search engine list.", value: "Site Search" })}
      ${field({ id: "osDesc", label: "Description", help: "Brief description of the search engine.", value: "Search this site." })}
    </div>
    <div class="field-grid">
      ${field({ id: "osSearchUrl", label: "Search URL template", help: "Use {searchTerms} as the placeholder for the query.", value: "https://example.com/search?q={searchTerms}" })}
      ${field({ id: "osFavicon", label: "Favicon URL", help: "16x16 icon for the search engine. Must be an absolute URL.", value: "https://example.com/favicon.ico" })}
    </div>
    <div class="field-grid">
      ${field({ id: "osSuggest", label: "Suggestions URL (optional)", help: "Use {searchTerms} placeholder. Leave empty if not available." })}
      ${select({ id: "osMethod", label: "HTTP method", options: [{label:"GET",value:"GET"},{label:"POST",value:"POST"}], value: "GET" })}
    </div>
    <div class="field-grid">
      ${field({ id: "osParamName", label: "Query parameter name", value: "q" })}
      ${field({ id: "osEncoding", label: "Input encoding", value: "UTF-8" })}
    </div>`,
  generate(root) {
    const shortName = root.querySelector("#osShortName").value.trim();
    const desc = root.querySelector("#osDesc").value.trim();
    const searchUrl = root.querySelector("#osSearchUrl").value.trim();
    const favicon = root.querySelector("#osFavicon").value.trim();
    const suggestUrl = root.querySelector("#osSuggest").value.trim();
    const method = root.querySelector("#osMethod").value;
    const paramName = root.querySelector("#osParamName").value.trim();
    const encoding = root.querySelector("#osEncoding").value.trim();

    if (!shortName || !searchUrl) {
      return { output: "Short name and search URL template are required. Enter both fields to generate the OpenSearch description." };
    }

    if (!searchUrl.includes("{searchTerms}")) {
      return { output: 'The search URL template must include {searchTerms} as a placeholder for the search query. Example: https://example.com/search?q={searchTerms}' };
    }

    const osdUrl = `https://example.com/opensearch.xml`;

    const xmlLines = [];
    xmlLines.push('<?xml version="1.0" encoding="UTF-8"?>');
    xmlLines.push('<OpenSearchDescription xmlns="http://a9.com/-/spec/opensearch/1.1/">');
    xmlLines.push(`  <ShortName>${attrEscape(shortName)}</ShortName>`);
    xmlLines.push(`  <Description>${attrEscape(desc)}</Description>`);
    xmlLines.push(`  <Url type="text/html" method="${attrEscape(method)}" template="${attrEscape(searchUrl)}"/>`);
    if (suggestUrl && suggestUrl.includes("{searchTerms}")) {
      xmlLines.push(`  <Url type="application/x-suggestions+json" method="GET" template="${attrEscape(suggestUrl)}"/>`);
    }
    xmlLines.push(`  <Image width="16" height="16" type="image/x-icon">${attrEscape(favicon)}</Image>`);
    xmlLines.push(`  <InputEncoding>${attrEscape(encoding)}</InputEncoding>`);
    xmlLines.push(`  <OutputEncoding>${attrEscape(encoding)}</OutputEncoding>`);
    xmlLines.push('</OpenSearchDescription>');

    const linkTag = `<link rel="search" type="application/opensearchdescription+xml" title="${attrEscape(shortName)}" href="${attrEscape(osdUrl)}">`;

    return {
      output: [
        `/* === OpenSearch Description XML === */`,
        `/* Save as: opensearch.xml (place in site root) */`,
        ``,
        ...xmlLines,
        ``,
        ``,
        `/* === HTML head tag === */`,
        `/* Add to the <head> of every page: */`,
        linkTag,
        ``,
        ``,
        `/* === Notes === */`,
        `/* 1. The XML file must be served with Content-Type: application/opensearchdescription+xml */`,
        `/* 2. The search URL must return HTML results, not JSON or XML. */`,
        `/* 3. Firefox and some Chromium-based browsers detect the link tag automatically. */`,
        `/* 4. Update the favicon URL to point to your actual 16x16 favicon. */`
      ].join("\n")
    };
  }
};
