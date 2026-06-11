import { field, select, checkbox, htmlEscape } from "../tool-core.js";

const PRESETS = {
  fadeIn: {
    name: "fadeIn",
    keyframes: `@keyframes fadeIn {\n  from { opacity: 0; }\n  to { opacity: 1; }\n}`,
    defaults: { duration: "0.6", easing: "ease", delay: "0", iteration: "1", direction: "normal" },
  },
  fadeOut: {
    name: "fadeOut",
    keyframes: `@keyframes fadeOut {\n  from { opacity: 1; }\n  to { opacity: 0; }\n}`,
    defaults: { duration: "0.6", easing: "ease", delay: "0", iteration: "1", direction: "normal" },
  },
  slideDown: {
    name: "slideDown",
    keyframes: `@keyframes slideDown {\n  from { transform: translateY(-20px); opacity: 0; }\n  to { transform: translateY(0); opacity: 1; }\n}`,
    defaults: { duration: "0.5", easing: "ease-out", delay: "0", iteration: "1", direction: "normal" },
  },
  slideUp: {
    name: "slideUp",
    keyframes: `@keyframes slideUp {\n  from { transform: translateY(20px); opacity: 0; }\n  to { transform: translateY(0); opacity: 1; }\n}`,
    defaults: { duration: "0.5", easing: "ease-out", delay: "0", iteration: "1", direction: "normal" },
  },
  scaleIn: {
    name: "scaleIn",
    keyframes: `@keyframes scaleIn {\n  from { transform: scale(0.8); opacity: 0; }\n  to { transform: scale(1); opacity: 1; }\n}`,
    defaults: { duration: "0.4", easing: "ease-out", delay: "0", iteration: "1", direction: "normal" },
  },
  spin: {
    name: "spin",
    keyframes: `@keyframes spin {\n  from { transform: rotate(0deg); }\n  to { transform: rotate(360deg); }\n}`,
    defaults: { duration: "1.5", easing: "linear", delay: "0", iteration: "infinite", direction: "normal" },
  },
  pulse: {
    name: "pulse",
    keyframes: `@keyframes pulse {\n  0%, 100% { transform: scale(1); }\n  50% { transform: scale(1.08); }\n}`,
    defaults: { duration: "1.2", easing: "ease-in-out", delay: "0", iteration: "infinite", direction: "normal" },
  },
  bounce: {
    name: "bounce",
    keyframes: `@keyframes bounce {\n  0%, 100% { transform: translateY(0); }\n  40% { transform: translateY(-12px); }\n  60% { transform: translateY(-4px); }\n}`,
    defaults: { duration: "1", easing: "ease", delay: "0", iteration: "infinite", direction: "normal" },
  },
  shake: {
    name: "shake",
    keyframes: `@keyframes shake {\n  0%, 100% { transform: translateX(0); }\n  20% { transform: translateX(-6px); }\n  40% { transform: translateX(6px); }\n  60% { transform: translateX(-4px); }\n  80% { transform: translateX(4px); }\n}`,
    defaults: { duration: "0.5", easing: "ease-in-out", delay: "0", iteration: "1", direction: "normal" },
  },
};

export default {
  form: `
    <div class="field-grid">
      ${select({ id: "aniPreset", label: "Animation preset", options: [
        {label:"Fade in",value:"fadeIn"}, {label:"Fade out",value:"fadeOut"},
        {label:"Slide down",value:"slideDown"}, {label:"Slide up",value:"slideUp"},
        {label:"Scale in",value:"scaleIn"}, {label:"Spin",value:"spin"},
        {label:"Pulse",value:"pulse"}, {label:"Bounce",value:"bounce"},
        {label:"Shake",value:"shake"}
      ], value: "fadeIn" })}
      ${field({ id: "aniName", label: "Animation name", value: "fadeIn" })}
    </div>
    <div class="field-grid">
      ${field({ id: "aniDuration", label: "Duration (s)", value: "0.6", type: "number", attrs: "min=0.1 max=10 step=0.1" })}
      ${select({ id: "aniEasing", label: "Easing", options: [
        {label:"ease",value:"ease"}, {label:"ease-in",value:"ease-in"},
        {label:"ease-out",value:"ease-out"}, {label:"ease-in-out",value:"ease-in-out"},
        {label:"linear",value:"linear"}, {label:"cubic-bezier()",value:"cubic-bezier(0.4, 0, 0.2, 1)"}
      ], value: "ease" })}
    </div>
    <div class="field-grid">
      ${field({ id: "aniDelay", label: "Delay (s)", value: "0", type: "number", attrs: "min=0 max=10 step=0.1" })}
      ${select({ id: "aniIteration", label: "Iteration count", options: [
        {label:"1 (once)",value:"1"}, {label:"2",value:"2"}, {label:"3",value:"3"},
        {label:"infinite",value:"infinite"}
      ], value: "1" })}
    </div>
    <div class="field-grid">
      ${select({ id: "aniDirection", label: "Direction", options: [
        {label:"normal",value:"normal"}, {label:"reverse",value:"reverse"},
        {label:"alternate",value:"alternate"}, {label:"alternate-reverse",value:"alternate-reverse"}
      ], value: "normal" })}
      ${select({ id: "aniFillMode", label: "Fill mode", options: [
        {label:"none",value:"none"}, {label:"forwards",value:"forwards"},
        {label:"backwards",value:"backwards"}, {label:"both",value:"both"}
      ], value: "none" })}
    </div>`,
  generate(root) {
    const presetKey = root.querySelector("#aniPreset").value;
    const preset = PRESETS[presetKey] || PRESETS.fadeIn;
    const name = root.querySelector("#aniName").value || preset.name;
    const duration = root.querySelector("#aniDuration").value || preset.defaults.duration;
    const easing = root.querySelector("#aniEasing").value || preset.defaults.easing;
    const delay = root.querySelector("#aniDelay").value || preset.defaults.delay;
    const iteration = root.querySelector("#aniIteration").value || preset.defaults.iteration;
    const direction = root.querySelector("#aniDirection").value || preset.defaults.direction;
    const fillMode = root.querySelector("#aniFillMode").value || "none";

    const keyframes = preset.keyframes.replace(preset.name, name);
    const fillModeStr = fillMode !== "none" ? `\n  animation-fill-mode: ${fillMode};` : "";

    const output = `${keyframes}\n\n.element {\n  animation: ${name} ${duration}s ${easing} ${delay}s ${iteration} ${direction};${fillModeStr}\n}`;

    const preview = `<div style="text-align:center;padding:30px 20px">
      <div style="display:inline-block;animation:${name} ${duration}s ${easing} ${delay}s ${iteration} ${direction}${fillMode !== 'none' ? ' ' + fillMode : ''};font-size:18px;font-weight:700;color:#3b82f6;padding:16px 28px;border:2px dashed #93c5fd;border-radius:10px;background:#eff6ff;cursor:default">
        ${htmlEscape(name)}
      </div>
      <style>${keyframes}</style>
      <button onclick="this.previousElementSibling.previousElementSibling.style.animation='none';this.previousElementSibling.previousElementSibling.offsetHeight;this.previousElementSibling.previousElementSibling.style.animation='${name} ${duration}s ${easing} ${delay}s ${iteration} ${direction}${fillMode !== 'none' ? ' ' + fillMode : ''}'" style="display:block;margin:12px auto 0;padding:4px 12px;font-size:11px;border:1px solid #d1d5db;border-radius:4px;background:#fff;color:#6b7280;cursor:pointer">Replay</button>
    </div>`;

    return { output, preview };
  }
};
