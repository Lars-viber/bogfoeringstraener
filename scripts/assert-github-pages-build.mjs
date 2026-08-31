import { existsSync, readFileSync, readdirSync } from "node:fs";
import { extname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = fileURLToPath(new URL("..", import.meta.url));
const distDir = join(projectRoot, "dist");
const indexPath = join(distDir, "index.html");
const fallbackPath = join(distDir, "404.html");
const noJekyllPath = join(distDir, ".nojekyll");
const textExtensions = new Set([".css", ".html", ".js", ".json", ".map", ".mjs", ".svg", ".txt"]);

function filesBelow(directory) {
  return readdirSync(directory, {withFileTypes: true}).flatMap((entry) => {
    const path = join(directory, entry.name);
    return entry.isDirectory() ? filesBelow(path) : [path];
  });
}

for (const requiredPath of [indexPath, fallbackPath, noJekyllPath]) {
  if (!existsSync(requiredPath)) {
    throw new Error(`GitHub Pages-buildet mangler ${relative(projectRoot, requiredPath)}.`);
  }
}

const indexHtml = readFileSync(indexPath, "utf8");
const fallbackHtml = readFileSync(fallbackPath, "utf8");
if (fallbackHtml !== indexHtml) {
  throw new Error("dist/404.html er ikke en nøjagtig SPA-fallback for index.html.");
}
if (!indexHtml.includes("/bogfoeringstraener/assets/")) {
  throw new Error("GitHub Pages-buildet bruger ikke base-stien /bogfoeringstraener/.");
}

const buildFiles = filesBelow(distDir).filter((path) => textExtensions.has(extname(path).toLowerCase()));
const buildText = buildFiles.map((path) => readFileSync(path, "utf8")).join("\n");
if (buildText.includes("/api/check") || buildText.includes("/__trainer/")) {
  throw new Error("Det statiske build indeholder stadig en API-afhængighed.");
}
if (/cloudflare|wrangler|workerd/i.test(buildText)) {
  throw new Error("Det statiske client-build indeholder Cloudflare-specifik kode.");
}
if (!buildText.includes("Debitorer debiteres med fakturaens fulde beløb")) {
  throw new Error("Det lokale facit og den godkendte feedback er ikke med i det statiske build.");
}

console.log(`GitHub Pages-build bestået: ${buildFiles.length} statiske filer kontrolleret.`);
