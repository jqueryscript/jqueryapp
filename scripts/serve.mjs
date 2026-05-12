import { createServer } from "node:http";
import { createReadStream, existsSync, statSync } from "node:fs";
import path from "node:path";

const root = path.join(process.cwd(), "dist");
const port = Number(process.env.PORT || 4173);

const types = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml"
};

function resolvePath(urlPath) {
  const clean = decodeURIComponent(urlPath.split("?")[0]);
  let filePath = path.join(root, clean);
  if (!filePath.startsWith(root)) return null;
  if (existsSync(filePath) && statSync(filePath).isDirectory()) {
    filePath = path.join(filePath, "index.html");
  }
  if (!existsSync(filePath) && !path.extname(filePath)) {
    filePath = path.join(filePath, "index.html");
  }
  return filePath;
}

createServer((request, response) => {
  const filePath = resolvePath(request.url || "/");
  if (!filePath || !existsSync(filePath)) {
    response.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
    response.end("Not found");
    return;
  }

  response.writeHead(200, { "content-type": types[path.extname(filePath)] || "application/octet-stream" });
  createReadStream(filePath).pipe(response);
}).listen(port, () => {
  console.log(`Serving http://localhost:${port}`);
});
