import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const toolsDir = path.join(__dirname, "..", "src", "assets", "tools");

const importLine = `import { field, textarea, select, checkbox, htmlEscape, attrEscape, normalizeUrl } from "../tool-core.js";\n\n`;

const files = fs.readdirSync(toolsDir).filter(f => f.endsWith(".js"));
let count = 0;
for (const f of files) {
  const fp = path.join(toolsDir, f);
  let content = fs.readFileSync(fp, "utf8");
  if (!content.startsWith("import {")) {
    content = importLine + content;
    fs.writeFileSync(fp, content, "utf8");
    count++;
  }
}
console.log(`Added imports to ${count}/${files.length} files`);
