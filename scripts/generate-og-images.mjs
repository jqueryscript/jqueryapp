// Zero-dependency OG image placeholder generator
// Generates minimal valid 1200x630 PNG files for social sharing
import { writeFileSync, mkdirSync } from "node:fs";
import { deflateSync } from "node:zlib";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const W = 1200, H = 630;
const __dirname = dirname(fileURLToPath(import.meta.url));
const DIR = join(__dirname, "..", "src", "assets", "social");

function crc32(buf) {
  let crc = 0xFFFFFFFF;
  for (const b of buf) {
    crc ^= b;
    for (let i = 0; i < 8; i++) {
      crc = (crc >>> 1) ^ (crc & 1 ? 0xEDB88320 : 0);
    }
  }
  return (crc ^ 0xFFFFFFFF) >>> 0;
}

function chunk(type, data) {
  const typeBytes = Buffer.from(type, "ascii");
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const crcInput = Buffer.concat([typeBytes, data]);
  const crcVal = Buffer.alloc(4);
  crcVal.writeUInt32BE(crc32(crcInput), 0);
  return Buffer.concat([len, typeBytes, data, crcVal]);
}

function makePng(width, height, r, g, b, label) {
  // Build raw pixel data: 24-bit RGB with filter byte per row
  const rawRows = [];
  for (let y = 0; y < height; y++) {
    rawRows.push(0); // filter: none
    for (let x = 0; x < width; x++) {
      // Simple gradient effect
      const factor = 1 - (y / height) * 0.3;
      const rr = Math.min(255, Math.round(r * factor + 30 * (y / height)));
      const gg = Math.min(255, Math.round(g * factor + 20 * (y / height)));
      const bb = Math.min(255, Math.round(b * factor + 10 * (y / height)));
      rawRows.push(rr, gg, bb);
    }
  }
  const raw = Buffer.from(rawRows);
  const compressed = deflateSync(raw);

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;  // bit depth
  ihdr[9] = 2;  // color type: RGB
  ihdr[10] = 0; // compression
  ihdr[11] = 0; // filter
  ihdr[12] = 0; // interlace

  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  return Buffer.concat([sig, chunk("IHDR", ihdr), chunk("IDAT", compressed), chunk("IEND", Buffer.alloc(0))]);
}

const images = [
  { file: "og-home.png", r: 24, g: 23, b: 21, label: "jquery.app" },
  { file: "og-tools.png", r: 15, g: 118, b: 110, label: "Tools" },
  { file: "og-seo.png", r: 59, g: 130, b: 246, label: "SEO" },
  { file: "og-html.png", r: 239, g: 68, b: 68, label: "HTML" },
  { file: "og-css.png", r: 139, g: 92, b: 246, label: "CSS" },
  { file: "og-assets.png", r: 245, g: 158, b: 11, label: "Assets" },
  { file: "og-github-pages.png", r: 34, g: 197, b: 94, label: "GitHub Pages" },
  { file: "og-github-pages-workflow.png", r: 34, g: 197, b: 94, label: "GitHub Pages" },
  { file: "og-blog-publisher.png", r: 236, g: 72, b: 153, label: "Blog Publisher" },
  { file: "og-beginner-css.png", r: 139, g: 92, b: 246, label: "CSS" },
  { file: "og-multilingual-site.png", r: 37, g: 99, b: 235, label: "Multilingual" },
];

mkdirSync(DIR, { recursive: true });

for (const { file, r, g, b } of images) {
  const png = makePng(W, H, r, g, b);
  writeFileSync(`${DIR}/${file}`, png);
}

console.log(`Generated ${images.length} OG images in ${DIR}`);
