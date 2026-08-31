import { spawn } from "node:child_process";
import { get } from "node:http";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const viteEntry = join(projectRoot, "node_modules", "vite", "bin", "vite.js");
const electronEntry = join(projectRoot, "node_modules", "electron", "dist", "electron.exe");

const vite = spawn(process.execPath, [viteEntry, "--host", "127.0.0.1", "--strictPort"], {
  cwd: projectRoot,
  stdio: "inherit",
});

async function waitForServer() {
  for (let attempt = 0; attempt < 80; attempt += 1) {
    const ready = await new Promise((resolve) => {
      const request = get("http://127.0.0.1:5173", (response) => {
        response.resume();
        resolve(response.statusCode === 200);
      });
      request.on("error", () => resolve(false));
      request.setTimeout(500, () => {
        request.destroy();
        resolve(false);
      });
    });
    if (ready) return;
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  throw new Error("Udviklingsserveren blev ikke klar i tide.");
}

try {
  await waitForServer();
  const electron = spawn(electronEntry, [projectRoot], {cwd: projectRoot, stdio: "inherit"});
  electron.on("exit", (code) => {
    vite.kill();
    process.exitCode = code ?? 0;
  });
} catch (error) {
  console.error(error);
  vite.kill();
  process.exitCode = 1;
}
