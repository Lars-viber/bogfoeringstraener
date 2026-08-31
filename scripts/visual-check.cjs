const { app, BrowserWindow } = require("electron");
const { mkdir, writeFile } = require("node:fs/promises");
const { join } = require("node:path");

app.whenReady().then(async () => {
  const window = new BrowserWindow({width: 1280, height: 800, show: false});
  await window.loadURL("http://127.0.0.1:5173");
  await new Promise((resolve) => setTimeout(resolve, 800));

  const intro = await window.webContents.executeJavaScript(`({
    title: document.querySelector(".introduction h1")?.textContent,
    startButton: document.querySelector(".introduction__start")?.textContent,
    cardCount: document.querySelectorAll(".introduction__grid article").length
  })`);
  await window.webContents.executeJavaScript(`document.querySelector(".introduction__start")?.click()`);
  await new Promise((resolve) => setTimeout(resolve, 500));

  const layout = await window.webContents.executeJavaScript(`(() => {
    const voucher = document.querySelector(".voucher-strip")?.getBoundingClientRect();
    const accounts = [...document.querySelectorAll(".t-account")].map((element) => {
      const rect = element.getBoundingClientRect();
      return {top: Math.round(rect.top), left: Math.round(rect.left), right: Math.round(rect.right), bottom: Math.round(rect.bottom)};
    });
    return {
      viewport: {width: innerWidth, height: innerHeight},
      voucher: voucher && {top: Math.round(voucher.top), bottom: Math.round(voucher.bottom), height: Math.round(voucher.height)},
      accountCount: accounts.length,
      accounts,
      allAccountsVisible: accounts.every((account) => account.top >= 0 && account.bottom <= innerHeight),
      sameRow: new Set(accounts.map((account) => account.top)).size === 1,
      vatText: document.querySelector(".voucher-facts")?.textContent?.replace(/\\s+/g, " ").trim(),
      nextDisabled: document.querySelector(".button--next")?.disabled
    };
  })()`);

  const outputDir = join(__dirname, "..", ".qa");
  await mkdir(outputDir, {recursive: true});
  const image = await window.webContents.capturePage();
  await writeFile(join(outputDir, "bilag1-layout-1280x800.png"), image.toPNG());
  await writeFile(join(outputDir, "bilag1-layout-1280x800.json"), JSON.stringify({intro, layout}, null, 2));
  window.destroy();
  app.quit();
}).catch(async (error) => {
  const outputDir = join(__dirname, "..", ".qa");
  await mkdir(outputDir, {recursive: true});
  await writeFile(join(outputDir, "visual-check-error.txt"), String(error?.stack ?? error));
  app.quit();
});
