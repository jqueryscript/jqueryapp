import { field, select, checkbox, htmlEscape } from "../tool-core.js";

export default {
  form: `
    <div class="field-grid">
      ${select({ id: "poMetric", label: "Metric to observe", options: [
        {label:"LCP — Largest Contentful Paint",value:"largest-contentful-paint"},
        {label:"FID — First Input Delay",value:"first-input"},
        {label:"INP — Interaction to Next Paint",value:"interaction"},
        {label:"CLS — Cumulative Layout Shift",value:"layout-shift"},
        {label:"FCP — First Contentful Paint",value:"first-contentful-paint"},
        {label:"TTFB — Time to First Byte",value:"navigation"},
        {label:"Long Animation Frames (LoAF)",value:"long-animation-frame"},
        {label:"Resource Timing (slow requests)",value:"resource"}
      ], value: "largest-contentful-paint" })}
      ${select({ id: "poMode", label: "Observer mode", options: [
        {label:"Buffered (capture past entries)",value:"buffered"},
        {label:"Live only",value:"live"},
        {label:"One-shot (disconnect after first)",value:"oneshot"}
      ], value: "buffered" })}
    </div>
    <div class="field-grid">
      ${checkbox({ id: "poSendBeacon", label: "Send to analytics via sendBeacon", checked: false })}
      ${checkbox({ id: "poGoodBad", label: "Include good/needs-improvement/poor thresholds", checked: true })}
    </div>`,
  generate(root) {
    const metric = root.querySelector("#poMetric").value;
    const mode = root.querySelector("#poMode").value;
    const sendBeacon = root.querySelector("#poSendBeacon").checked;
    const showThresholds = root.querySelector("#poGoodBad").checked;

    const metricLabel = root.querySelector("#poMetric").selectedOptions[0]?.text || metric;
    const buffered = mode === "buffered" || mode === "oneshot";

    const lines = [];
    lines.push("// PerformanceObserver — Baseline 2025");
    lines.push("// Browser: Chrome 73+, Edge 79+, Safari 15+, Firefox 89+");
    lines.push("// Observes performance metrics (Core Web Vitals) in real-time.");
    lines.push("");

    lines.push("const observer = new PerformanceObserver((list) => {");
    lines.push("  const entries = list.getEntries();");
    lines.push("  entries.forEach((entry) => {");

    if (metric === "largest-contentful-paint") {
      lines.push("    // LCP: time the largest content element became visible");
      lines.push("    const lcp = entry.renderTime || entry.loadTime;");
      if (showThresholds) {
        lines.push("    const rating = lcp <= 2500 ? 'good' : lcp <= 4000 ? 'needs-improvement' : 'poor';");
      }
      lines.push("    console.log('LCP:', lcp, 'ms');");
    } else if (metric === "first-input") {
      lines.push("    // FID: delay between first user interaction and event handler");
      lines.push("    const fid = entry.processingStart - entry.startTime;");
      if (showThresholds) lines.push("    const rating = fid <= 100 ? 'good' : fid <= 300 ? 'needs-improvement' : 'poor';");
      lines.push("    console.log('FID:', fid, 'ms');");
    } else if (metric === "layout-shift") {
      lines.push("    // CLS: sum of layout shift scores");
      lines.push("    if (!entry.hadRecentInput) {");
      if (showThresholds) {
        lines.push("      const rating = entry.value <= 0.1 ? 'good' : entry.value <= 0.25 ? 'needs-improvement' : 'poor';");
      }
      lines.push("      console.log('CLS:', entry.value);");
      lines.push("    }");
    } else if (metric === "interaction") {
      lines.push("    // INP: worst interaction latency");
      lines.push("    const inp = entry.duration;");
      if (showThresholds) lines.push("    const rating = inp <= 200 ? 'good' : inp <= 500 ? 'needs-improvement' : 'poor';");
      lines.push("    console.log('INP:', inp, 'ms');");
    } else if (metric === "first-contentful-paint") {
      lines.push("    console.log('FCP:', entry.startTime, 'ms');");
    } else if (metric === "navigation") {
      lines.push("    console.log('TTFB:', entry.responseStart, 'ms');");
    } else if (metric === "long-animation-frame") {
      lines.push("    console.log('Long frame:', entry.duration, 'ms');");
    } else if (metric === "resource") {
      lines.push("    if (entry.duration > 1000) console.warn('Slow:', entry.name, entry.duration, 'ms');");
    }

    if (sendBeacon) {
      lines.push("    navigator.sendBeacon('/analytics', JSON.stringify({");
      lines.push("      metric: '" + metric + "',");
      lines.push("      value: entry.startTime,");
      lines.push("      rating");
      lines.push("    }));");
    }

    lines.push("  });");
    if (mode === "oneshot") lines.push("  observer.disconnect();");
    lines.push("});");
    lines.push("");
    lines.push(`observer.observe({ type: '${metric}', buffered: ${buffered} });`);
    lines.push("");
    lines.push("// Notes:");
    lines.push("// 1. Use buffered: true to get past entries (useful for LCP/FCP measured before your JS runs).");
    lines.push("// 2. PerformanceObserver is more efficient than polling — it pushes entries when available.");
    lines.push("// 3. Each metric type needs its own observer unless using type inheritance.");
    lines.push("// 4. Core Web Vitals (LCP, INP, CLS) are the key metrics for Google ranking signals.");

    const thresholds = {
      "largest-contentful-paint": { good: "<= 2.5s", poor: "> 4s" },
      "first-input": { good: "<= 100ms", poor: "> 300ms" },
      "layout-shift": { good: "<= 0.1", poor: "> 0.25" },
      "interaction": { good: "<= 200ms", poor: "> 500ms" },
    };

    const t = thresholds[metric];
    const preview = `<div style="border:1px solid #e5e7eb;border-radius:10px;padding:14px;background:#f9fafb">
      <div style="font-size:13px;font-weight:600;color:#374151;margin-bottom:10px">
        PerformanceObserver: ${metricLabel}
      </div>
      ${t ? `<div style="display:flex;gap:8px;margin-bottom:10px">
        <span style="background:#dcfce7;color:#166534;padding:3px 10px;border-radius:12px;font-size:11px">Good: ${t.good}</span>
        <span style="background:#fef3c7;color:#92400e;padding:3px 10px;border-radius:12px;font-size:11px">Needs work</span>
        <span style="background:#fee2e2;color:#dc2626;padding:3px 10px;border-radius:12px;font-size:11px">Poor: ${t.poor}</span>
      </div>` : ""}
      <div style="display:flex;gap:8px">
        <span style="background:#dbeafe;color:#1e40af;padding:3px 10px;border-radius:12px;font-size:11px">buffered: ${buffered}</span>
        <span style="background:#dbeafe;color:#1e40af;padding:3px 10px;border-radius:12px;font-size:11px">mode: ${mode}</span>
        ${sendBeacon ? '<span style="background:#dbeafe;color:#1e40af;padding:3px 10px;border-radius:12px;font-size:11px">sendBeacon</span>' : ""}
      </div>
    </div>`;

    return { output: lines.join("\n"), preview };
  }
};
