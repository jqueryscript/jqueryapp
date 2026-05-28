import { field, select, htmlEscape } from "../tool-core.js";

export default {
  form: `
    <div class="field-grid">
      <fieldset class="check-grid">
        <legend>Directives</legend>
        <label><input type="checkbox" data-xr="dir" value="noindex"> noindex</label>
        <label><input type="checkbox" data-xr="dir" value="nofollow"> nofollow</label>
        <label><input type="checkbox" data-xr="dir" value="noarchive"> noarchive</label>
        <label><input type="checkbox" data-xr="dir" value="nosnippet"> nosnippet</label>
        <label><input type="checkbox" data-xr="dir" value="noimageindex"> noimageindex</label>
        <label><input type="checkbox" data-xr="dir" value="notranslate"> notranslate</label>
        <label><input type="checkbox" data-xr="dir" value="noai"> noai</label>
      </fieldset>
    </div>
    <div class="field-grid">
      ${field({ id: "xrUA", label: "User-agent (optional)", help: "Leave empty for all bots. Use for targeting specific crawlers.", value: "" })}
      ${select({ id: "xrFormat", label: "Output format", options: [
        {label:"HTTP header + meta tag",value:"both"},
        {label:"HTTP header only",value:"header"},
        {label:"Meta tag only",value:"meta"}
      ], value: "both" })}
    </div>`,
  generate(root) {
    const directives = Array.from(root.querySelectorAll("[data-xr='dir']:checked")).map(cb => cb.value);
    const ua = root.querySelector("#xrUA").value.trim() || "*";
    const format = root.querySelector("#xrFormat").value;

    if (!directives.length) {
      return { output: "Select at least one directive. Common defaults: noindex for pages you want removed from search results, nofollow for pages with untrusted links." };
    }

    const directiveStr = directives.join(", ");
    const lines = [];
    const showHeader = format === "header" || format === "both";
    const showMeta = format === "meta" || format === "both";

    if (showHeader) {
      lines.push(`/* === HTTP Header === */`);
      if (ua !== "*") {
        lines.push(`# For ${ua} only`);
      }
      lines.push(`X-Robots-Tag: ${directiveStr}`, "");
    }

    if (showMeta) {
      lines.push(`/* === HTML Meta Tag === */`);
      lines.push(`<meta name="robots" content="${directiveStr}">`, "");
    }

    lines.push(
      `/* === Important Notes === */`,
      `/* 1. X-Robots-Tag works on non-HTML files too: PDFs, images, feeds, JSON responses. */`,
      `/* 2. The meta tag only works on HTML pages. */`,
      `/* 3. If a robots meta tag says "index" but X-Robots-Tag says "noindex", search engines */`,
      `/*    may honor "noindex" — headers and meta tags should agree. */`,
      `/* 4. Use Google Search Console URL Inspection to verify the directive is seen. */`,
      `/* 5. Some bots ignore X-Robots-Tag entirely. Add robots.txt blocks as defense in depth. */`
    );

    return { output: lines.join("\n") };
  }
};
