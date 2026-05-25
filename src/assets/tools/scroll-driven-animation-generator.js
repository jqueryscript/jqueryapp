import { field, textarea, select, checkbox, htmlEscape, attrEscape, normalizeUrl } from "../tool-core.js";

export default {
    form: `
      <div class="field-grid">
        ${select({ id: "sdType", label: "Timeline type", options: [{label:"scroll() - scroll container progress",value:"scroll"},{label:"view() - element visibility in viewport",value:"view"}], value: "scroll"})}
        ${select({ id: "sdEffect", label: "Effect", options: [{label:"Reading progress bar",value:"progress"},{label:"Fade in on scroll (reveal)",value:"reveal"},{label:"Slide up on reveal",value:"slide"},{label:"Parallax background",value:"parallax"},{label:"Scale on scroll",value:"scale"}], value: "progress"})}
        ${field({ id: "sdSelector", label: "Animated element selector", value: ".progress-bar" })}
        ${field({ id: "sdColor", label: "Accent color", value: "#0f766e" })}
      </div>`,
    generate(root) {
      const type = root.querySelector("#sdType").value;
      const effect = root.querySelector("#sdEffect").value;
      const selector = root.querySelector("#sdSelector").value.trim() || ".element";
      const color = root.querySelector("#sdColor").value.trim() || "#0f766e";
      let keyframes, elementCSS, timelineNote;
      if (effect === "progress") {
        keyframes = `@keyframes progress-grow {\n  from { width: 0%; }\n  to { width: 100%; }\n}`;
        elementCSS = `${selector} {\n  width: 100%;\n  height: 4px;\n  background: ${color};\n  position: fixed;\n  top: 0;\n  left: 0;\n  animation: progress-grow linear;\n  animation-timeline: ${type}();\n}`;
        timelineNote = "Scroll progress bar animates from 0% to 100% width based on scroll position.";
      } else if (effect === "reveal") {
        keyframes = `@keyframes fade-in {\n  from { opacity: 0; }\n  to { opacity: 1; }\n}`;
        elementCSS = `${selector} {\n  animation: fade-in linear;\n  animation-timeline: ${type}();\n  animation-range: entry 0% entry 100%;\n}`;
        timelineNote = "Fades in as the element enters the viewport or scroll container.";
      } else if (effect === "slide") {
        keyframes = `@keyframes slide-up {\n  from {\n    opacity: 0;\n    transform: translateY(40px);\n  }\n  to {\n    opacity: 1;\n    transform: translateY(0);\n  }\n}`;
        elementCSS = `${selector} {\n  animation: slide-up linear;\n  animation-timeline: ${type}();\n  animation-range: entry 0% entry 100%;\n}`;
        timelineNote = "Slides up and fades in as the element enters view or scroll container.";
      } else if (effect === "parallax") {
        keyframes = `@keyframes parallax-bg {\n  from { background-position-y: 0%; }\n  to { background-position-y: 100%; }\n}`;
        elementCSS = `${selector} {\n  background-image: url('...');\n  background-size: cover;\n  background-repeat: no-repeat;\n  animation: parallax-bg linear;\n  animation-timeline: scroll();\n}`;
        timelineNote = "Parallax background effect driven by the scroll container progress.";
      } else {
        keyframes = `@keyframes scale-in {\n  from { transform: scale(0.8); }\n  to { transform: scale(1); }\n}`;
        elementCSS = `${selector} {\n  animation: scale-in linear;\n  animation-timeline: ${type}();\n  animation-range: entry 0% entry 100%;\n}`;
        timelineNote = "Scales in as the element enters the viewport or scroll container.";
      }
      const output = `/* Scroll-Driven Animation */
/* ${timelineNote} */
/* Browser support: Chrome 115+, Edge 115+, Firefox (in development). */

@media (prefers-reduced-motion: no-preference) {
${keyframes}

${elementCSS}
}

@media (prefers-reduced-motion: reduce) {
  ${selector} {
    animation: none;
  }
}`;
      return { output };
    }
  };
