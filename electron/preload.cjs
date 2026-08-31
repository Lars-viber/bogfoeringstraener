const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("trainerApi", Object.freeze({
  getCourse: () => ipcRenderer.invoke("trainer:get-course"),
  checkAnswer: (request) => ipcRenderer.invoke("trainer:check-answer", request),
}));
