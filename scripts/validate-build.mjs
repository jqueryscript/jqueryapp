import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const root = path.resolve(import.meta.dirname, "..");
const distDir = path.join(root, "dist");
const toolsDir = path.join(root, "src", "assets", "tools");
const tools = JSON.parse(fs.readFileSync(path.join(root, "data", "tools.en.json"), "utf8"));
const locales = JSON.parse(fs.readFileSync(path.join(root, "data", "locales.json"), "utf8"));
const site = JSON.parse(fs.readFileSync(path.join(root, "data", "site.json"), "utf8"));
const errors = [];
const warnings = [];

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(fullPath) : [fullPath];
  });
}

function addError(message) {
  errors.push(message);
}

function relative(file) {
  return path.relative(root, file).replaceAll("\\", "/");
}

function pageUrlForFile(file) {
  const rel = path.relative(distDir, file).replaceAll("\\", "/");
  const pathname = rel === "index.html" ? "/" : `/${rel.replace(/index\.html$/, "")}`;
  return new URL(pathname, site.baseUrl);
}

function targetFileForUrl(url) {
  let pathname;
  try {
    pathname = decodeURIComponent(url.pathname);
  } catch {
    return null;
  }
  const clean = pathname.replace(/^\/+/, "");
  if (!clean) return path.join(distDir, "index.html");
  const direct = path.join(distDir, clean);
  if (fs.existsSync(direct) && fs.statSync(direct).isFile()) return direct;
  const index = path.join(direct, "index.html");
  if (fs.existsSync(index)) return index;
  return direct;
}

function attribute(html, tagPattern, attributeName) {
  const tag = html.match(tagPattern)?.[0] || "";
  return tag.match(new RegExp(`${attributeName}="([^"]*)"`, "i"))?.[1] || "";
}

async function validateToolModules() {
  const expected = new Set(tools.map((tool) => `${tool.id}.js`));
  const actual = new Set(fs.readdirSync(toolsDir).filter((file) => file.endsWith(".js")));

  for (const file of expected) {
    if (!actual.has(file)) addError(`Missing tool module: src/assets/tools/${file}`);
  }
  for (const file of actual) {
    if (!expected.has(file)) addError(`Tool module has no data entry: src/assets/tools/${file}`);
  }

  for (const file of [...expected].sort()) {
    if (!actual.has(file)) continue;
    try {
      const module = await import(`${pathToFileURL(path.join(toolsDir, file)).href}?validate=1`);
      if (typeof module.default?.form !== "string") addError(`${file} must default-export a form string`);
      if (typeof module.default?.generate !== "function") addError(`${file} must default-export a generate function`);
    } catch (error) {
      addError(`Cannot import src/assets/tools/${file}: ${error.message}`);
    }
  }
}

function validateToolData() {
  const ids = new Set();
  for (const tool of tools) {
    if (ids.has(tool.id)) addError(`Duplicate tool id: ${tool.id}`);
    ids.add(tool.id);
    for (const field of ["name", "summary", "description", "quickAnswer", "whatIs"]) {
      if (typeof tool[field] !== "string" || !tool[field].trim()) addError(`${tool.id} is missing ${field}`);
    }
    for (const [field, minimum] of [["examples", 2], ["limitations", 3], ["verificationSteps", 2]]) {
      if (!Array.isArray(tool[field]) || tool[field].length < minimum) addError(`${tool.id} needs at least ${minimum} ${field}`);
    }
    if (!Array.isArray(tool.faq) || tool.faq.length < 1) addError(`${tool.id} needs at least 1 FAQ entry`);
  }

  for (const locale of site.locales.filter((item) => item !== site.defaultLocale)) {
    for (const tool of tools) {
      const localized = locales[locale]?.tools?.[tool.id];
      if (!localized?.name?.trim()) addError(`Missing localized name: ${locale}/${tool.id}`);
      if (!localized?.summary?.trim()) addError(`Missing localized summary: ${locale}/${tool.id}`);
    }
  }
}

function validateMojibake(files) {
  const suspicious = /[閳鈥闁鐢閻濞�]|â(?:€|€™|€œ|€)|Ã[^\s<]|Â[^\s<]/u;
  for (const file of files) {
    const text = fs.readFileSync(file, "utf8");
    const match = text.match(suspicious);
    if (match) addError(`Possible mojibake in ${relative(file)}: ${JSON.stringify(match[0])}`);
  }
}

function validatePng(file, expectedWidth, expectedHeight) {
  if (!fs.existsSync(file)) {
    addError(`Missing social image: ${relative(file)}`);
    return;
  }
  const buffer = fs.readFileSync(file);
  const isPng = buffer.length >= 24 && buffer.subarray(1, 4).toString("ascii") === "PNG";
  if (!isPng) {
    addError(`Invalid PNG social image: ${relative(file)}`);
    return;
  }
  const width = buffer.readUInt32BE(16);
  const height = buffer.readUInt32BE(20);
  if (width !== expectedWidth || height !== expectedHeight) {
    addError(`Social image must be ${expectedWidth}x${expectedHeight}: ${relative(file)} is ${width}x${height}`);
  }
}

function validateHtml() {
  const htmlFiles = walk(distDir).filter((file) => file.endsWith(".html"));
  const normalPages = htmlFiles.filter((file) => path.basename(file) !== "google9d00cdf8df0ddc4e.html");
  let shortTitles = 0;
  let longTitles = 0;
  let shortDescriptions = 0;
  let longDescriptions = 0;
  const checkedTargets = new Set();
  const checkedSocialImages = new Set();

  for (const file of normalPages) {
    const html = fs.readFileSync(file, "utf8");
    const title = html.match(/<title>([\s\S]*?)<\/title>/i)?.[1]?.trim() || "";
    const description = attribute(html, /<meta\s+name="description"[^>]*>/i, "content");
    const canonical = attribute(html, /<link\s+rel="canonical"[^>]*>/i, "href");
    const ogTitle = attribute(html, /<meta\s+property="og:title"[^>]*>/i, "content");
    const ogDescription = attribute(html, /<meta\s+property="og:description"[^>]*>/i, "content");
    const ogUrl = attribute(html, /<meta\s+property="og:url"[^>]*>/i, "content");

    if (!title) addError(`Missing title: ${relative(file)}`);
    if (!description) addError(`Missing meta description: ${relative(file)}`);
    if (!canonical) addError(`Missing canonical: ${relative(file)}`);
    if (!ogTitle || !ogDescription || !ogUrl) addError(`Missing essential Open Graph metadata: ${relative(file)}`);
    if (!/<h1(?:\s|>)/i.test(html)) addError(`Missing H1: ${relative(file)}`);
    if (title.length < 20) shortTitles += 1;
    if (title.length > 70) longTitles += 1;
    if (description.length < 50) shortDescriptions += 1;
    if (description.length > 180) longDescriptions += 1;

    const pageUrl = pageUrlForFile(file);
    const linkableHtml = html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "");
    for (const match of linkableHtml.matchAll(/\b(?:href|src)="([^"]+)"/gi)) {
      const ref = match[1];
      if (!ref || ref.startsWith("#") || /^(?:mailto:|tel:|javascript:|data:)/i.test(ref)) continue;
      let url;
      try {
        url = new URL(ref.replaceAll("&amp;", "&"), pageUrl);
      } catch {
        addError(`Invalid URL reference in ${relative(file)}: ${ref}`);
        continue;
      }
      if (url.origin !== new URL(site.baseUrl).origin) continue;
      const key = url.pathname;
      if (checkedTargets.has(key)) continue;
      checkedTargets.add(key);
      const target = targetFileForUrl(url);
      if (!target || !fs.existsSync(target)) addError(`Broken internal reference ${url.pathname} from ${relative(file)}`);
    }

    for (const match of html.matchAll(/<meta\s+(?:property="og:image"|name="twitter:image")[^>]*content="([^"]+)"[^>]*>/gi)) {
      let imageUrl;
      try {
        imageUrl = new URL(match[1], pageUrl);
      } catch {
        addError(`Invalid social image URL in ${relative(file)}: ${match[1]}`);
        continue;
      }
      if (imageUrl.origin !== new URL(site.baseUrl).origin || checkedSocialImages.has(imageUrl.pathname)) continue;
      checkedSocialImages.add(imageUrl.pathname);
      const imageFile = targetFileForUrl(imageUrl);
      validatePng(imageFile, 1200, 630);
    }
  }

  if (shortTitles || longTitles || shortDescriptions || longDescriptions) {
    warnings.push(`Metadata length review: ${shortTitles} short titles, ${longTitles} long titles, ${shortDescriptions} short descriptions, ${longDescriptions} long descriptions.`);
  }

  const sitemapFile = path.join(distDir, "sitemap.xml");
  const sitemap = fs.readFileSync(sitemapFile, "utf8");
  for (const match of sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)) {
    const url = new URL(match[1]);
    const target = targetFileForUrl(url);
    if (!target || !fs.existsSync(target)) addError(`Sitemap URL has no built page: ${url.href}`);
  }

  return htmlFiles;
}

await validateToolModules();
validateToolData();
const htmlFiles = validateHtml();
validateMojibake([
  ...walk(path.join(root, "data")).filter((file) => file.endsWith(".json")),
  ...htmlFiles,
]);

for (const warning of warnings) console.warn(`WARN: ${warning}`);
if (errors.length) {
  console.error(`\nBuild validation failed with ${errors.length} error(s):`);
  for (const error of errors) console.error(`- ${error}`);
  process.exitCode = 1;
} else {
  console.log(`Build validation passed: ${tools.length} tools, ${htmlFiles.length} HTML files, ${site.locales.length} locales.`);
}
