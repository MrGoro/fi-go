const { app, BrowserWindow, Tray, Menu } = require('electron');
const path = require('path');

let win;
let tray;

function createWindow () {
  // Create the browser window.
  win = new BrowserWindow({
    width: 500,
    height: 650,
    backgroundColor: '#eee',
    icon: `file://${__dirname}/dist/assets/logo.png`
  });

  win.setMenu(null);
  win.setResizable(false);

  win.loadURL(`file://${__dirname}/dist/index.html`);

  //// uncomment below to open the DevTools.
  // win.webContents.openDevTools()

  // Event when the window is closed.
  win.on('closed', function () {
    win = null
  });

  win.on('minimize',function(event){
    event.preventDefault();
    win.hide();
  });

  const iconPath = path.join(__dirname, 'dist/assets/logo.ico');
  tray = new Tray(iconPath);
  var contextMenu = Menu.buildFromTemplate([
    { label: 'Öffnen', click:  function(){
        win.show();
    } },
    { label: 'Beenden', click:  function(){
        win.isQuiting = true;
        win.quit();
    } }
  ]);
  tray.setToolTip('fi go!');
  tray.setContextMenu(contextMenu);
  tray.on('click', function () {
    win.isVisible() ? win.hide() : win.show()
  });
}

// Create window on electron intialization
app.on('ready', createWindow);

// Quit when all windows are closed.
app.on('window-all-closed', function () {

  // On macOS specific close process
  if (process.platform !== 'darwin') {
    app.quit()
  }
});

app.on('activate', function () {
  // macOS specific close process
  if (win === null) {
    createWindow()
  }
});
