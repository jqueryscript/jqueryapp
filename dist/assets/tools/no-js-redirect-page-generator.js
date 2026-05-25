import { field, textarea, select, checkbox, htmlEscape, attrEscape, normalizeUrl } from "../tool-core.js";

export default {
    form: `
      ${field({ id: "redirectUrl", label: "Target URL", value: "https://example.com/new-page/" })}
      ${field({ id: "redirectDelay", label: "Delay seconds", value: "3", type: "number" })}
      ${field({ id: "redirectTitle", label: "Page title", value: "This page has moved" })}
      ${textarea({ id: "redirectMessage", label: "Body message", value: "This page has moved to a new location. You will be redirected shortly." })}`,
    generate(root) {
      const url = root.querySelector("#redirectUrl").value;
      const delay = root.querySelector("#redirectDelay").value;
      const title = root.querySelector("#redirectTitle").value;
      const message = root.querySelector("#redirectMessage").value;
      const output = '<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8">\n  <meta name="viewport" content="width=device-width, initial-scale=1">\n' +
        '  <title>' + htmlEscape(title) + '</title>\n' +
        '  <meta http-equiv="refresh" content="' + attrEscape(delay) + '; url=' + attrEscape(url) + '">\n' +
        '  <style>\n    * { margin: 0; padding: 0; box-sizing: border-box; }\n' +
        '    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; background: #f9f9f9; color: #333; }\n' +
        '    .container { text-align: center; padding: 2rem; max-width: 480px; }\n' +
        '    h1 { font-size: 1.5rem; margin-bottom: 1rem; }\n' +
        '    p { line-height: 1.6; margin-bottom: 1.5rem; }\n' +
        '    a { color: #0066cc; }\n  </style>\n</head>\n<body>\n  <div class="container">\n' +
        '    <h1>' + htmlEscape(title) + '</h1>\n' +
        (message ? '    <p>' + htmlEscape(message) + '</p>\n' : "") +
        '    <p><a href="' + attrEscape(url) + '">Go to ' + htmlEscape(url) + '</a></p>\n  </div>\n</body>\n</html>';
      return { output };
    }
  };
