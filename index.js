"use strict";

const isDevMode = process.env.NODE_ENV === 'development';
const electron = require('electron');
const Tray = electron.Tray;
const Menu = electron.Menu;
const path = require('path');
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
const config = require('./config/data.js');

let tray = null;

app.on('ready', () => {
  tray = new Tray(path.join(__dirname, './src/icon/img.png'))
  const contextMenu = Menu.buildFromTemplate([
    { label: 'game-selector version : ' + app.getVersion() },
    { label: '설정파일 열기' , click() {
      var spawnObj = require('child_process').spawn,
      progToOpen = spawnObj('C:/windows/notepad.exe', [path.join(__dirname, '/config/data.js')]);
    }},
    { label: '세이브 폴더 열기' , click() {
      var spawnObj = require('child_process').spawn,
      progToOpen = spawnObj('C:/windows/explorer.exe', [path.join(__dirname, '/save')]);
    }},
    { label: '닫기' , click() { app.quit() }},
  ])
  tray.setToolTip('game-selector\nversion : ' + app.getVersion())
  tray.setContextMenu(contextMenu)

  const {screenWidth, screenHeight} = electron.screen.getPrimaryDisplay().workAreaSize;
  const width = 1600;
  const height = 800;
  const x = (screenWidth - width) / 2;
  const y = (screenHeight - width) / 2;

  let window = new BrowserWindow({
    fullscreenable: true,
    defaultEncoding: "utf8",
    kiosk : isDevMode ? false : config.kiosk,
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
    window.webContents.setZoomFactor(config.scale);
    if(isDevMode) {
      window.webContents.openDevTools();
    }
  });
  
});

app.on('window-all-closed', () => {
  app.quit();
});
