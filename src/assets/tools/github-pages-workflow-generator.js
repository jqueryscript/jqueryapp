import { field, textarea, select, checkbox, htmlEscape, attrEscape, normalizeUrl } from "../tool-core.js";

export default {
    form: `
      <div class="field-grid">
        ${select({
          id: "wfType",
          label: "Site type",
          value: "static",
          options: [
            { label: "Plain HTML / static files", value: "static" },
            { label: "Vite", value: "vite" },
            { label: "Astro", value: "astro" },
            { label: "Custom", value: "custom" }
          ]
        })}
        ${field({ id: "wfBuildCmd", label: "Build command", value: "npm run build" })}
        ${field({ id: "wfOutputDir", label: "Output directory", value: "dist" })}
        ${field({ id: "wfNodeVersion", label: "Node version", value: "22" })}
        ${checkbox({ id: "wfCNAME", label: "Include CNAME placeholder step", checked: true })}
      </div>`,
    generate(root) {
      const type = root.querySelector("#wfType").value;
      const presets = {
        static: { build: "", outDir: "." },
        vite: { build: "npm run build", outDir: "dist" },
        astro: { build: "npm run build", outDir: "dist" },
        custom: {
          build: root.querySelector("#wfBuildCmd").value.trim() || "npm run build",
          outDir: root.querySelector("#wfOutputDir").value.trim() || "dist"
        }
      };
      const config = presets[type];
      const nodeVersion = root.querySelector("#wfNodeVersion").value.trim() || "22";
      const includeCNAME = root.querySelector("#wfCNAME").checked;
      let buildStep = "";
      if (config.build) {
        buildStep = `\n\n      - name: Install dependencies\n        run: npm ci\n\n      - name: Build\n        run: ${config.build}`;
      }
      let cnameStep = "";
      if (includeCNAME) {
        cnameStep = `\n\n      - name: Write CNAME placeholder\n        run: echo "example.com" > ${config.outDir}/CNAME`;
      }
      let createCnameIfDir = "";
      if (includeCNAME && config.outDir !== ".") {
        createCnameIfDir = `\n      - name: Ensure output directory\n        run: mkdir -p ${config.outDir}`;
      }
      const yaml = `name: Deploy to GitHub Pages

on:
  push:
    branches:
      - main

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: false

jobs:
  deploy:
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: \${{ steps.deployment.outputs.page_url }}
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: "${nodeVersion}"${buildStep}${createCnameIfDir}${cnameStep}

      - uses: actions/configure-pages@v4

      - uses: actions/upload-pages-artifact@v3
        with:
          path: ${config.outDir}

      - uses: actions/deploy-pages@v4`;
      return { output: yaml };
    }
  };
