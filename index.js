"use strict";

const isDevMode = process.env.NODE_ENV === 'development';
const electron = require('electron');
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;

let tray = null;

app.on('ready', () => {
  const {screenWidth, screenHeight} = electron.screen.getPrimaryDisplay().workAreaSize;
  const width = 1280;
  const height = 720;
  const x = (screenWidth - width) / 2;
  const y = (screenHeight - width) / 2;

  let window = new BrowserWindow({
    fullscreenable: true,
    defaultEncoding: "utf8",
    x: x,
    y: y,
    width: width,
    height: height,
    autoHideMenuBar : true,
    webPreferences: {
        nodeIntegration: true,
    },
  })
  window.loadURL(`file://${__dirname}/src/index.html`);
  

  window.webContents.on('dom-ready', () => {
    window.webContents.setZoomFactor(0.8);
    if(isDevMode) {
      window.webContents.openDevTools();
    }
  });
  
});

app.on('window-all-closed', () => {
  app.quit();
});
