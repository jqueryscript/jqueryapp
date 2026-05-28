import { field, textarea, select, attrEscape } from "../tool-core.js";

export default {
  form: `
    <div class="field-grid">
      ${field({ id: "alAndroidPkg", label: "Android package name", help: "e.g. com.example.app", value: "com.example.app" })}
      ${field({ id: "alAndroidSha", label: "Android SHA-256 cert fingerprint", help: "Colon-separated hex. Get from: keytool -list -v -keystore keystore.jks", value: "14:6D:E9:83:C5:73:06:50:D8:EE:9E:3E:42:73:D9:2D:0B:39:D9:93:57:5E:82:50:20:51:EF:9C:2C:14:68:9E" })}
    </div>
    <div class="field-grid">
      ${field({ id: "alIosTeam", label: "iOS Team ID", help: "10-character Apple Developer Team ID. Found at developer.apple.com/account.", value: "ABCDEF1234" })}
      ${field({ id: "alIosBundle", label: "iOS Bundle ID", help: "e.g. com.example.app", value: "com.example.app" })}
    </div>
    <div class="field-grid">
      ${textarea({ id: "alIosPaths", label: "iOS path rules (one per line)", help: "URL paths to handle. Use * for all paths, /posts/* for a prefix, or / for exact match.", value: "*\n/posts/*\n/profile" })}
      ${select({ id: "alTarget", label: "Output target", options: [
        {label:"Both Android + iOS",value:"both"},
        {label:"Android only (assetlinks.json)",value:"android"},
        {label:"iOS only (apple-app-site-association)",value:"ios"}
      ], value: "both" })}
    </div>`,
  generate(root) {
    const androidPkg = root.querySelector("#alAndroidPkg").value.trim();
    const androidSha = root.querySelector("#alAndroidSha").value.trim();
    const iosTeam = root.querySelector("#alIosTeam").value.trim();
    const iosBundle = root.querySelector("#alIosBundle").value.trim();
    const iosPathsRaw = root.querySelector("#alIosPaths").value.trim();
    const target = root.querySelector("#alTarget").value;

    const iosPaths = iosPathsRaw ? iosPathsRaw.split("\n").map(s => s.trim()).filter(Boolean) : ["*"];

    const lines = [];

    if (target === "android" || target === "both") {
      if (!androidPkg || !androidSha) {
        lines.push("/* Android: Enter the package name and SHA-256 fingerprint to generate assetlinks.json. */");
      } else {
        const assetlinks = [
          {
            relation: ["delegate_permission/common.handle_all_urls"],
            target: {
              namespace: "android_app",
              package_name: androidPkg,
              sha256_cert_fingerprints: [androidSha]
            }
          }
        ];
        lines.push("/* === Android assetlinks.json === */");
        lines.push("/* Place at: /.well-known/assetlinks.json */");
        lines.push(JSON.stringify(assetlinks, null, 2));
      }
      lines.push("");
    }

    if (target === "ios" || target === "both") {
      if (!iosTeam || !iosBundle) {
        lines.push("/* iOS: Enter the Team ID and Bundle ID to generate the AASA file. */");
      } else {
        const components = iosPaths.map(p => {
          if (p === "*") return { "/": "*", comment: "All paths" };
          return { "/": p };
        });
        const aasa = {
          applinks: {
            apps: [],
            details: [
              {
                appIDs: [`${iosTeam}.${iosBundle}`],
                components: components.map(c => {
                  const obj = { "/": c["/"] };
                  if (c.comment) obj._comment = c.comment;
                  return obj;
                })
              }
            ]
          }
        };
        lines.push("/* === iOS apple-app-site-association === */");
        lines.push("/* Place at: /.well-known/apple-app-site-association (NO file extension!) */");
        lines.push("/* Also serve from: /.well-known/apple-app-site-association.json */");
        lines.push(JSON.stringify(aasa, null, 2));
      }
      lines.push("");
    }

    lines.push(
      "/* === Hosting Checklist === */",
      "/* 1. Place files at the /.well-known/ path on your domain root. */",
      "/* 2. Serve both files over HTTPS without redirects. */",
      "/* 3. Content-Type must be application/json. */",
      "/* 4. GitHub Pages: .well-known/ must be in your published site root. */",
      "/* 5. Netlify/Vercel: ensure /.well-known/ is not redirected by routing rules. */",
      "/* 6. Verify: https://yoursite.com/.well-known/assetlinks.json */",
      "/* 7. Verify: https://yoursite.com/.well-known/apple-app-site-association */",
      "/* 8. iOS: The AASA file is fetched ONCE per app install. Changes require app reinstall. */",
      "/* 9. Android: Changes to assetlinks.json take effect within 24 hours. */"
    );

    return { output: lines.join("\n") };
  }
};
