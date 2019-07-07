const {app, BrowserWindow, protocol, ipcMain} = require("electron");
const https = require("https");
const vm = require("vm");
const {autoUpdater} = require("electron-updater");
const isDev = require("electron-is-dev");
let win;
function createWindow() {
  win = new BrowserWindow({width: 800, height: 600});
  win.loadFile("index.html");
  win.on("closed", () => {
    win = null;
  });
}
app.on("ready", function() {
  createWindow();
  protocol.registerFileProtocol("puddle", function(request, callback) {
    const url = request.url.substr(7);
    https.get(url, function(res) {
      res.on("data", function(data) {
        vm.runInNewContext(data);
      });
    });
    callback({path: "${__dirname}/opening.html"});
  });
  if (isDev == false) {autoUpdater.checkForUpdates();}
});
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
app.on("activate", () => {
  if (win === null) {
    createWindow();
  }
});
if (isDev == false) {
  autoUpdater.on("update-downloaded", (info) => {
    win.webContents.send("updateReady");
  });
}
ipcMain.on("quitAndInstall", (event, arg) => {
  if (isDev == false) {autoUpdater.quitAndInstall();}
});
