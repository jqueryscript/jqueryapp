import { field, textarea, select, checkbox, htmlEscape, attrEscape, normalizeUrl } from "../tool-core.js";

export default {
    form: `
      <div class="field-grid">
        ${select({ id: "ssUseCase", label: "Script use case", options: [{label:"Analytics / tracking script",value:"analytics"},{label:"App bundle / main script",value:"app"},{label:"Third-party widget (chat, social)",value:"widget"},{label:"ES module (Vite, Astro, etc.)",value:"module"},{label:"Inline script (small, critical)",value:"inline"},{label:"DOM-dependent library",value:"library"}], value: "analytics" })}
        ${field({ id: "ssSrc", label: "Script URL", value: "https://example.com/analytics.js" })}
        ${checkbox({ id: "ssFirstParty", label: "First-party script", checked: false })}
      </div>`,
    generate(root) {
      const useCase = root.querySelector("#ssUseCase").value;
      const src = root.querySelector("#ssSrc").value.trim();
      const firstParty = root.querySelector("#ssFirstParty").checked;
      let tag, explanation;
      if (useCase === "analytics") {
        tag = `<script src="${attrEscape(src)}" async><\/script>`;
        explanation = "async is recommended for analytics because the script is independent and must not block page rendering.";
      } else if (useCase === "app") {
        tag = `<script src="${attrEscape(src)}" defer><\/script>`;
        explanation = "defer runs the script after HTML parsing, preserving execution order for application bundles.";
      } else if (useCase === "widget") {
        tag = `<script src="${attrEscape(src)}" async><\/script>`;
        explanation = "async allows third-party widgets to load independently without delaying page content.";
      } else if (useCase === "module") {
        tag = `<script type="module" src="${attrEscape(src)}"><\/script>`;
        explanation = "ES modules are deferred by default. type=\"module\" enables import and export syntax.";
      } else if (useCase === "inline") {
        tag = "<script>\n  /* critical inline script here */\n<\/script>";
        explanation = "Inline scripts execute immediately during parsing. Place in <head> for critical logic or at end of <body> for DOM-dependent code.";
      } else {
        tag = `<script src="${attrEscape(src)}" defer><\/script>`;
        explanation = "defer runs the script after DOM parsing, making it safe for libraries that require the DOM to be ready.";
      }
      if (firstParty && useCase !== "inline") {
        explanation += " As a first-party script, defer is more reliable than async because server response is predictable.";
      }
      return { output: `${tag}\n\n<!-- ${explanation} -->` };
    }
  }
};

document.querySelectorAll("[data-tool-id]").forEach((root) => {
  const id = root.dataset.toolId;
  const config = tools[id];
  if (!config) {
    root.innerHTML = `<p>This tool is not available yet.</p>`;
    return;
  }
  mountTool(root, config);
});;
