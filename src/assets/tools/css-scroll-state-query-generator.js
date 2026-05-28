import { field, select, checkbox, htmlEscape } from "../tool-core.js";

const states = [
  { id: "snapped", label: "snapped — item is the active snap target", css: "&:state(snapped) { /* Currently snapped item */ }" },
  { id: "stuck", label: "stuck — sticky element is stuck to edge", css: "&:state(stuck) { /* Sticky element is stuck */ }" },
  { id: "scrollable", label: "scrollable — container has overflow", css: "&:state(scrollable) { /* Container can scroll */ }" },
  { id: "overflowing", label: "overflowing — content overflows container", css: "&:state(overflowing) { /* Content overflows */ }" }
];

export default {
  form: `
    <div class="field-grid">
      ${select({ id: "ssState", label: "Scroll state to target", options: states.map(s => ({label:s.label,value:s.id})), value: "snapped" })}
      ${field({ id: "ssSelector", label: "Target selector", help: "CSS selector to apply the state style to.", value: ".carousel-item" })}
    </div>
    <div class="field-grid">
      ${field({ id: "ssParent", label: "Scroll container selector", help: "The element with overflow scroll/auto that triggers the state.", value: ".carousel" })}
      ${select({ id: "ssStyle", label: "Style change on state", options: [{label:"Opacity",value:"opacity"},{label:"Scale",value:"scale"},{label:"Border highlight",value:"border"},{label:"Background",value:"background"}], value: "opacity" })}
    </div>
    <div class="field-grid">
      ${checkbox({ id: "ssFallback", label: "Include JS fallback snippet", checked: true })}
      ${checkbox({ id: "ssSupport", label: "Include browser support note", checked: true })}
    </div>`,
  generate(root) {
    const state = root.querySelector("#ssState").value;
    const selector = root.querySelector("#ssSelector").value.trim() || ".item";
    const parent = root.querySelector("#ssParent").value.trim() || ".scroller";
    const style = root.querySelector("#ssStyle").value;
    const includeFallback = root.querySelector("#ssFallback").checked;
    const includeSupport = root.querySelector("#ssSupport").checked;

    const stateInfo = states.find(s => s.id === state);

    const styleMap = {
      opacity: "opacity: 0.4; /* inactive items */",
      scale: "transform: scale(0.9); /* inactive items */",
      border: "border-color: var(--color-accent); border-width: 2px;",
      background: "background: var(--color-bg-highlight);"
    };

    const activeStyle = {
      opacity: "opacity: 1;",
      scale: "transform: scale(1);",
      border: "border-color: var(--color-accent);",
      background: "background: var(--color-bg-highlight);"
    };

    const lines = [];
    lines.push("/* === CSS Scroll-State Query === */");
    lines.push("/* Uses scroll-state() container queries for scroll-driven styling */");

    // Container setup
    lines.push("");
    lines.push("/* --- Scroll Container --- */");
    lines.push(`${parent} {`);
    lines.push("  overflow-x: auto;");
    lines.push("  scroll-snap-type: x mandatory;");
    lines.push("  container-type: scroll-state;");
    lines.push("}");
    lines.push("");

    // State query
    lines.push("/* --- Scroll-State Query --- */");
    lines.push(`/* Style applied when the element matches the "${state}" state */`);
    lines.push(`@container scroll-state(${state}: true) {`);
    lines.push(`  ${selector} {`);
    lines.push(`    ${activeStyle[style]}`);
    lines.push("  }");
    lines.push("}");
    lines.push("");

    // Default (non-active) style
    if (state === "snapped") {
      lines.push("/* Default style for non-snapped items */");
      lines.push(`${selector} {`);
      lines.push(`  ${styleMap[style]}`);
      lines.push("  transition: opacity 0.3s, transform 0.3s;");
      lines.push("}");
    }
    lines.push("");

    // Demo markup
    lines.push("/* === Demo HTML === */");
    lines.push(`<div class="${parent.replace('.','')}">`);
    lines.push(`  <div class="${selector.replace('.','')}">Item 1</div>`);
    lines.push(`  <div class="${selector.replace('.','')}">Item 2</div>`);
    lines.push(`  <div class="${selector.replace('.','')}">Item 3</div>`);
    lines.push("</div>");
    lines.push("");

    // JS fallback
    if (includeFallback) {
      lines.push("/* === JavaScript Fallback (for browsers without scroll-state()) === */");
      lines.push("<script>");
      lines.push(`  const scroller = document.querySelector("${parent}");`);
      lines.push(`  const items = document.querySelectorAll("${selector}");`);
      lines.push("  if (scroller && !CSS.supports('container-type','scroll-state')) {");
      lines.push("    scroller.addEventListener('scroll', () => {");
      lines.push(`      const snappedIndex = Math.round(scroller.scrollLeft / items[0].offsetWidth);`);
      lines.push("      items.forEach((item, i) => {");
      lines.push(`        item.style.${style === 'scale' ? 'transform' : style} = i === snappedIndex ? '${activeStyle[style]}' : '${styleMap[style]}';`);
      lines.push("      });");
      lines.push("    });");
      lines.push("  }");
      lines.push("</script>");
      lines.push("");
    }

    if (includeSupport) {
      lines.push(
        "/* === Browser Support === */",
        "/* Container scroll-state queries are part of the CSS carousel/scroller work in Chrome 135+. */",
        "/* Firefox and Safari support is in development. Use the JS fallback for cross-browser support. */",
        "/* The scroll-state() function is only valid inside @container queries with container-type: scroll-state. */"
      );
    }

    return { output: lines.join("\n") };
  }
};
