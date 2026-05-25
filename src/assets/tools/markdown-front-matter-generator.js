import { field, textarea, select, checkbox, htmlEscape, attrEscape, normalizeUrl } from "../tool-core.js";

export default {
    form: `
      <div class="field-grid">
        ${field({ id: "fmTitle", label: "Title", value: "My New Post" })}
        ${field({ id: "fmDate", label: "Date", value: new Date().toISOString().split('T')[0] })}
        ${textarea({ id: "fmDescription", label: "Description", value: "A short description of the post." })}
        ${field({ id: "fmTags", label: "Tags (comma separated)", value: "web, css, static-site" })}
        ${select({ id: "fmLayout", label: "Layout", value: "post", options: [
          { label: "post", value: "post" },
          { label: "page", value: "page" },
          { label: "doc", value: "doc" },
          { label: "note", value: "note" },
          { label: "custom", value: "custom" }
        ]})}
        ${field({ id: "fmAuthor", label: "Author", value: "" })}
        ${field({ id: "fmSlug", label: "Slug", value: "" })}
      </div>
      <div class="check-grid">
        ${checkbox({ id: "fmDraft", label: "Draft" })}
      </div>`,
    generate(root) {
      const title = root.querySelector("#fmTitle").value.trim();
      const date = root.querySelector("#fmDate").value.trim();
      const description = root.querySelector("#fmDescription").value.trim();
      const tagsRaw = root.querySelector("#fmTags").value.trim();
      const layout = root.querySelector("#fmLayout").value;
      const author = root.querySelector("#fmAuthor").value.trim();
      let slug = root.querySelector("#fmSlug").value.trim();
      const draft = root.querySelector("#fmDraft").checked;
      const lines = ["---"];
      if (title) lines.push(`title: "${title.replace(/"/g, '\\"')}"`);
      if (date) lines.push(`date: ${date}`);
      if (description) lines.push(`description: "${description.replace(/"/g, '\\"')}"`);
      if (tagsRaw) {
        const tags = tagsRaw.split(",").map(t => t.trim()).filter(Boolean);
        lines.push(`tags: [${tags.join(", ")}]`);
      }
      if (layout) lines.push(`layout: ${layout}`);
      if (author) lines.push(`author: "${author.replace(/"/g, '\\"')}"`);
      if (!slug && title) {
        slug = title.toLowerCase()
          .replace(/[^a-z0-9\s-]/g, "")
          .replace(/[\s_]+/g, "-")
          .replace(/-+/g, "-")
          .replace(/^-+|-+$/g, "");
      }
      if (slug) lines.push(`slug: ${slug}`);
      if (draft) lines.push("draft: true");
      lines.push("---");
      return { output: lines.join("\n") };
    }
  };
