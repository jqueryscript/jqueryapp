// Split tools.js into per-tool ES modules — robust version
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const toolsJsPath = path.join(__dirname, "..", "src", "assets", "tools.js");
const toolsDir = path.join(__dirname, "..", "src", "assets", "tools");

const source = fs.readFileSync(toolsJsPath, "utf8");

// Find the tools object: everything between "const tools = {" and the final "};"
const toolsStart = source.indexOf("const tools = {");
const afterOpen = source.indexOf("{", toolsStart) + 1;

// Find all tool key positions: "tool-id": {
const toolIdRegex = /^\s*"([^"]+)":\s*\{/gm;
toolIdRegex.lastIndex = afterOpen;

const entries = [];
let match;
while ((match = toolIdRegex.exec(source)) !== null) {
  entries.push({
    id: match[1],
    start: match.index + match[0].length - 1 // position of opening {
  });
}

// Find end position for each tool by looking at the next tool's key start
// or the tools object closing };
for (let i = 0; i < entries.length; i++) {
  entries[i].end = i + 1 < entries.length
    ? source.lastIndexOf("}", entries[i + 1].start - 5) + 1 // look backwards from next key
    : -1; // will be set below for last item
}

// Clean up: adjust to the actual comma+whitespace boundary between tools
for (let i = 0; i < entries.length - 1; i++) {
  // Find the actual closing } of this tool's config object
  const searchEnd = entries[i + 1].start;
  let depth = 0;
  let pos = entries[i].start;
  let inString = false;
  let stringDelim = "";
  let inTemplate = false;

  while (pos < searchEnd) {
    const ch = source[pos];
    const next = pos + 1 < source.length ? source[pos + 1] : "";

    if (inTemplate) {
      if (ch === "`" && source[pos - 1] !== "\\") {
        inTemplate = false;
      } else if (ch === "$" && next === "{") {
        depth++;
        pos += 1;
      }
    } else if (inString) {
      if (ch === stringDelim && source[pos - 1] !== "\\") {
        inString = false;
      }
    } else {
      if (ch === "`") {
        inTemplate = true;
      } else if (ch === '"' || ch === "'") {
        inString = true;
        stringDelim = ch;
      } else if (ch === "{") {
        depth++;
      } else if (ch === "}") {
        if (depth === 0) {
          entries[i].end = pos + 1;
          break;
        }
        depth--;
      }
    }
    pos++;
  }
}

// Handle last tool: find closing } of the tools object
{
  const i = entries.length - 1;
  let depth = 0;
  let pos = entries[i].start;
  let inString = false, inTemplate = false, stringDelim = "";

  while (pos < source.length) {
    const ch = source[pos];
    const next = pos + 1 < source.length ? source[pos + 1] : "";

    if (inTemplate) {
      if (ch === "`" && source[pos - 1] !== "\\") inTemplate = false;
      else if (ch === "$" && next === "{") { depth++; pos += 1; }
    } else if (inString) {
      if (ch === stringDelim && source[pos - 1] !== "\\") inString = false;
    } else {
      if (ch === "`") { inTemplate = true; }
      else if (ch === '"' || ch === "'") { inString = true; stringDelim = ch; }
      else if (ch === "{") { depth++; }
      else if (ch === "}") {
        if (depth === 0) {
          entries[i].end = pos + 1;
          break;
        }
        depth--;
      }
    }
    pos++;
  }
}

// Extract and validate each tool
fs.mkdirSync(toolsDir, { recursive: true });
let written = 0;
const ids = [];

for (const entry of entries) {
  const content = source.slice(entry.start, entry.end).trim();
  if (content.includes("form:") && content.includes("generate")) {
    const filePath = path.join(toolsDir, `${entry.id}.js`);
    const fileContent = `export default ${content.trimEnd()};\n`;
    fs.writeFileSync(filePath, fileContent, "utf8");
    ids.push(entry.id);
    written++;
  } else {
    console.warn(`SKIPPED ${entry.id}: missing form or generate (${content.length} chars)`);
  }
}

console.log(`Written ${written}/${entries.length} tool modules to ${toolsDir}`);

fs.writeFileSync(
  path.join(__dirname, "..", "data", "tool-ids.json"),
  JSON.stringify(ids, null, 2),
  "utf8"
);
console.log("Tool ID list written to data/tool-ids.json");
