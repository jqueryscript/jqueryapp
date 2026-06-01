import { field, select, checkbox, htmlEscape } from "../tool-core.js";

export default {
  form: `
    <div class="field-grid">
      ${select({ id: "duMode", label: "Upload mode", options: [
        {label:"Directory (webkitdirectory)",value:"directory"},
        {label:"Multiple files",value:"multiple"},
        {label:"Single file",value:"single"}
      ], value: "directory" })}
      ${field({ id: "duAccept", label: "Accept file types", value: "image/*", help: "image/*, .pdf,.docx, video/*, or leave empty for all" })}
    </div>
    <div class="field-grid">
      ${field({ id: "duLabel", label: "Button label text", value: "Choose folder" })}
      ${checkbox({ id: "duRequired", label: "Required field", checked: false })}
    </div>
    <div class="field-grid">
      ${checkbox({ id: "duDragDrop", label: "Include drag-and-drop zone", checked: true })}
      ${checkbox({ id: "duShowFiles", label: "Show selected file list via JS", checked: false })}
    </div>`,
  generate(root) {
    const mode = root.querySelector("#duMode").value;
    const accept = root.querySelector("#duAccept").value.trim();
    const label = root.querySelector("#duLabel").value.trim() || "Choose folder";
    const required = root.querySelector("#duRequired").checked;
    const dragDrop = root.querySelector("#duDragDrop").checked;
    const showFiles = root.querySelector("#duShowFiles").checked;

    const inputAttrs = [
      'type="file"',
      mode === "directory" ? 'webkitdirectory="" directory=""' : "",
      mode === "multiple" ? "multiple" : "",
      accept ? `accept="${accept}"` : "",
      required ? "required" : "",
      'id="file-input"',
    ].filter(Boolean).join(" ");

    const lines = [];
    lines.push("<!-- Directory & File Upload Input Generator -->");
    if (mode === "directory") {
      lines.push("<!-- <input webkitdirectory> — Baseline 2025 -->");
      lines.push("<!-- Browser support: Chrome 30+, Edge 12+, Safari 11.1+, Firefox 50+ -->");
    }
    lines.push("");

    lines.push("<!-- HTML: File input -->");
    lines.push(`<label for="file-input">${label}</label>`);
    lines.push(`<input ${inputAttrs}>`);
    lines.push("");

    if (dragDrop) {
      lines.push("<!-- HTML: Drag-and-drop zone -->");
      lines.push(`<div id="drop-zone" class="drop-zone">`);
      lines.push(`  <p>${mode === "directory" ? "Drop a folder here" : "Drop files here"}</p>`);
      lines.push(`  <p>or</p>`);
      lines.push(`  <label for="file-input" class="button">${label}</label>`);
      lines.push(`</div>`);
      lines.push("");

      lines.push("<!-- CSS: Drag-and-drop styling -->");
      lines.push(".drop-zone {");
      lines.push("  border: 2px dashed #d1d5db;");
      lines.push("  border-radius: 12px;");
      lines.push("  padding: 32px;");
      lines.push("  text-align: center;");
      lines.push("  transition: border-color 0.2s, background 0.2s;");
      lines.push("}");
      lines.push(".drop-zone.dragover {");
      lines.push("  border-color: #3b82f6;");
      lines.push("  background: #eff6ff;");
      lines.push("}");
      lines.push("");
    }

    if (showFiles) {
      lines.push("<!-- JavaScript: Display selected files -->");
      lines.push("const input = document.getElementById('file-input');");
      lines.push("const list = document.getElementById('file-list');");
      lines.push("input.addEventListener('change', () => {");
      lines.push("  list.innerHTML = '';");
      lines.push("  for (const file of input.files) {");
      lines.push("    const item = document.createElement('li');");
      if (mode === "directory") {
        lines.push("    // file.webkitRelativePath shows the path within the directory");
        lines.push("    item.textContent = file.webkitRelativePath || file.name;");
      } else {
        lines.push("    item.textContent = `${file.name} (${(file.size / 1024).toFixed(1)} KB)`;");
      }
      lines.push("    list.appendChild(item);");
      lines.push("  }");
      lines.push("});");
      lines.push("");
    }

    if (dragDrop) {
      lines.push("<!-- JavaScript: Drag-and-drop events -->");
      lines.push("const zone = document.getElementById('drop-zone');");
      lines.push("zone.addEventListener('dragover', (e) => {");
      lines.push("  e.preventDefault();");
      lines.push("  zone.classList.add('dragover');");
      lines.push("});");
      lines.push("zone.addEventListener('dragleave', () => zone.classList.remove('dragover'));");
      lines.push("zone.addEventListener('drop', (e) => {");
      lines.push("  e.preventDefault();");
      lines.push("  zone.classList.remove('dragover');");
      if (mode === "directory") {
        lines.push("  // Access dropped directory entries via webkitGetAsEntry()");
        lines.push("  const items = [...e.dataTransfer.items];");
        lines.push("  items.forEach(item => {");
        lines.push("    const entry = item.webkitGetAsEntry();");
        lines.push("    if (entry && entry.isDirectory) {");
        lines.push("      // Handle directory entry");
        lines.push("    }");
        lines.push("  });");
      } else {
        lines.push("  input.files = e.dataTransfer.files;");
        lines.push("  input.dispatchEvent(new Event('change'));");
      }
      lines.push("});");
    }

    lines.push("");
    lines.push("<!-- Notes: -->");
    lines.push("<!-- 1. webkitdirectory works in all modern browsers. The `directory` attribute is the standard equivalent. -->");
    lines.push("<!-- 2. Use both `webkitdirectory` and `directory` for maximum compatibility. -->");
    lines.push("<!-- 3. file.webkitRelativePath provides the relative path of files within the selected directory. -->");
    lines.push("<!-- 4. Cannot pre-select a directory path — the user must manually choose the folder each time. -->");
    lines.push("<!-- 5. For server upload, use FormData with the input.files FileList. -->");

    // Preview
    const modeLabel = mode === "directory" ? "Directory" : mode === "multiple" ? "Multiple files" : "Single file";
    const preview = `<div style="border:2px dashed #d1d5db;border-radius:12px;padding:28px;text-align:center;background:#f9fafb">
      <div style="font-size:28px;margin-bottom:8px">${mode === "directory" ? "&#128193;" : "&#128206;"}</div>
      <div style="font-size:14px;font-weight:600;color:#374151;margin-bottom:4px">${mode === "directory" ? "Choose a folder" : "Choose files"}</div>
      <div style="font-size:12px;color:#6b7280;margin-bottom:12px">${mode === "directory" ? "All files in the folder will be available for upload" : `Mode: ${modeLabel}${accept ? ` &middot; Accept: ${accept}` : ""}`}</div>
      <div style="display:inline-block;background:#3b82f6;color:#fff;padding:8px 18px;border-radius:6px;font-size:13px;font-weight:600;cursor:default">${label}</div>
      ${accept ? `<div style="margin-top:10px;font-size:11px;color:#6b7280">Accepted types: ${accept}</div>` : ""}
    </div>`;

    return { output: lines.join("\n"), preview };
  }
};
