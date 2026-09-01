import { app, BrowserWindow, ipcMain } from "electron";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { getStuckHint, validateAnswer } from "../shared/validation.mjs";

const projectRoot = join(fileURLToPath(new URL("..", import.meta.url)));
const publicCourse = JSON.parse(readFileSync(join(projectRoot, "src", "data", "public-course.json"), "utf8"));
const privateCourse = JSON.parse(readFileSync(join(projectRoot, "shared", "course-solutions.json"), "utf8"));
const solutions = new Map(privateCourse.solutions.map((solution) => [solution.voucherId, solution]));

ipcMain.handle("trainer:get-course", () => publicCourse);
ipcMain.handle("trainer:check-answer", (_event, request) => {
  const solution = solutions.get(request?.voucherId);
  if (!solution) throw new Error("Ukendt bilag");
  if (request.requestHelp) {
    return {correct: false, balanced: false, message: "Her er et mere konkret spor:", hint: getStuckHint(solution), canAskForHelp: true};
  }
  return validateAnswer(solution, request.entries, request.attempt);
});

function createWindow() {
  const window = new BrowserWindow({
    width: 1280,
    height: 860,
    minWidth: 820,
    minHeight: 650,
    show: false,
    backgroundColor: "#f4f8fd",
    title: "Bogføringstræner",
    webPreferences: {
      preload: join(projectRoot, "electron", "preload.cjs"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });

  window.once("ready-to-show", () => window.show());
  window.webContents.setWindowOpenHandler(() => ({action: "deny"}));
  if (app.isPackaged) {
    window.loadFile(join(projectRoot, "dist", "index.html"));
  } else {
    window.loadURL("http://127.0.0.1:5173");
  }
}

app.whenReady().then(() => {
  createWindow();
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
