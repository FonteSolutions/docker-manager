const electron = require('electron');
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
// const windowStateKeeper = require('electron-window-state');
const Menu = electron.Menu;
const Tray = electron.Tray;
const sqlite3 = require('sqlite3').verbose();
const Docker = require('dockerode');
var socket = '/var/run/docker.sock';
var docker = new Docker({ socketPath: socket });

// browser-window creates a native window
var mainWindow = null;

const process = require('process');
const path = process.argv[2] == 'dev' ? '/src/app' : '';

const db = new sqlite3.Database(__dirname + path + '/dkm.db');

if(path) {
    require('electron-reload')(__dirname, {
        electron: require('electron')
    });
}

app.on('window-all-closed', function () {
    // On macOS it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

const createWindow = function () {
    // Initialize the window to our specified dimensions
    mainWindow = new BrowserWindow({
        // frame: false,
        // enableLargerThanScreen: true,
        // x: 0,
        // y: 0,
        title: '',
        titleBarStyle: 'hidden',
        // icon: __dirname + '/src/assets/camera-icon.png'
        icon: __dirname + path + '/dist/assets/docker-sm.png'
    });

    // Tell Electron where to load the entry point from
    mainWindow.loadURL('file://' + __dirname + path + '/index.html');

    // console.log('dirname', __dirname);

    const screenElectron = electron.screen;
    const allScreens = screenElectron.getAllDisplays();

    var x = 0;
    var y = 0;
    var width = 0;
    var height = 0;
    // Select biggest screen monitor to open app
    for (var screen in allScreens) {
        if (allScreens[screen].workArea.width > width) {
            x = allScreens[screen].bounds.x;
            y = allScreens[screen].bounds.y;
            width = allScreens[screen].bounds.width;
            height = allScreens[screen].bounds.height;
        }
    }

    // Set Screen Position
    mainWindow.setPosition(x, y, true);
    // Set Screen Size
    mainWindow.setSize(width, height, true);

    // var mainWindowState = windowStateKeeper({
    //     defaultWidth: width,
    //     defaultHeight: height
    // });

    // App icon tray
    appIcon = new Tray(__dirname + path + '/dist/assets/docker-xs.png');
    var contextMenu = Menu.buildFromTemplate([
        {
            label: 'Abrir',
            click: mainWindow.show()
        },
        {
            label: 'Fechar',
            click: function () {
                app._events['will-quit']();
                app.quit();
            }
        }
    ]);
    appIcon.setToolTip('FonteSolutions <NomeDoApp>');
    appIcon.setContextMenu(contextMenu);

    // App menu
    mainWindow.setMenuBarVisibility(false);

    // Open the DevTools.
    if (path) {
        mainWindow.webContents.openDevTools();
    }

    // mainWindowState.manage(mainWindow);

    // Clear out the main window when the app is closed
    mainWindow.on('closed', function () {
        app._events['will-quit']();
        app.quit();
        mainWindow = null
    });

    app.docker = docker;
    app.db = db;
};

app.on('ready', createWindow);
app.on('show', function (event) {
    mainWindow.setHighlightMode('always');
});

app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (mainWindow === null) {
        createWindow()
    }
});
