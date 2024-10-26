import { app, ipcMain, dialog } from "electron";
import serve from "electron-serve";
import { createWindow } from "./helpers";
import { basename } from "path";

const isProd = process.env.NODE_ENV === "production";

if (isProd) serve({ directory: "app" });
else app.setPath("userData", `${app.getPath("userData")} (development)`);

(async () => {
  await app.whenReady();

  const mainWindow = createWindow("main", {
    minWidth: 400,
    minHeight: 725,
    width: 1175,
    height: 725,
  });

  if (isProd) await mainWindow.loadURL("app://./home");
  else {
    const port = process.argv[2];
    await mainWindow.loadURL(`http://localhost:${port}/home`);
  }

  ipcMain.handle("select-file", async function (_event, title) {
    const response = await dialog.showOpenDialog(mainWindow, {
      title,
      properties: ["openFile"],
      filters: [
        {
          name: "Media",
          extensions: ["png", "jpg", "jpeg", "gif", "webp"],
        },
      ],
    });

    if (!response.canceled && response.filePaths.length > 0) {
      return {
        path: response.filePaths[0],
        name: basename(response.filePaths[0]),
      };
    } else {
      return null;
    }
  });

  mainWindow.focus();
})();

app.on("window-all-closed", () => {
  app.quit();
});
