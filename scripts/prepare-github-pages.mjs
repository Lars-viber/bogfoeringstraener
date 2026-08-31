import { copyFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = fileURLToPath(new URL("..", import.meta.url));
const distDir = join(projectRoot, "dist");
const indexPath = join(distDir, "index.html");
const fallbackPath = join(distDir, "404.html");

if (!existsSync(indexPath)) {
  throw new Error("GitHub Pages-buildet mangler dist/index.html.");
}

copyFileSync(indexPath, fallbackPath);
console.log("GitHub Pages-fallback oprettet: dist/404.html");
