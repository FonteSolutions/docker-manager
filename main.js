const electron = require('electron');
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
const ipcMain = electron.ipcMain;
// const windowStateKeeper = require('electron-window-state');
const Menu = electron.Menu;
const Tray = electron.Tray;
const Docker = require('dockerode');
var socket = '/var/run/docker.sock';
var docker = new Docker({socketPath: socket});
var fs = require('fs');
// var SQL = require('sql.js');
var remote = electron.remote;
var mainWindow = null;

const process = require('process');
const path = process.argv[2] == 'dev' ? '/src/app' : '';
// const dbPath = __dirname + path + '/dkm.db';
//
// if (!fs.existsSync(dbPath)) {
//     fs.writeFileSync(dbPath, '');
// }
// var filebuffer = fs.readFileSync(dbPath);
// if (filebuffer) {
//     db = new SQL.Database(filebuffer);
// }

// if (path) {
//     require('electron-reload')(__dirname, {
//         electron: require('electron')
//     });
// }

const saveDb = function() {
    // setTimeout(function () {
    //     try {
    //         fs.unlinkSync(dbPath);
    //     } catch (e) {
    //         console.log("Unable to delete file; Exception: " + e);
    //     }
    fs.writeFileSync(dbPath, new Buffer(db.export()));
    // }, 10);
};

const createWindow = function () {
    mainWindow = new BrowserWindow({
        // frame: false,
        // enableLargerThanScreen: true,
        // x: 0,
        // y: 0,
        // show: false,
        title: '',
        titleBarStyle: 'hidden',
        // icon: __dirname + '/src/assets/camera-icon.png'
        icon: __dirname + path + '/dist/assets/docker-sm.png',
        webPreferences: {
            nodeIntegration: true,
            defaultEncoding: 'UTF-8'
        }
    });

    mainWindow.loadURL('file://' + __dirname + path + '/index.html');

    const screenElectron = electron.screen;
    const allScreens = screenElectron.getAllDisplays();

    var x = 0;
    var y = 0;
    var width = 0;
    var height = 0;
    for (var screen in allScreens) {
        if (allScreens[screen].workArea.width > width) {
            x = allScreens[screen].bounds.x;
            y = allScreens[screen].bounds.y;
            width = allScreens[screen].bounds.width;
            height = allScreens[screen].bounds.height;
        }
    }

    mainWindow.setPosition(x, y, true);
    mainWindow.setSize(width, height, true);

    // var mainWindowState = windowStateKeeper({
    //     defaultWidth: width,
    //     defaultHeight: height
    // });

    appIcon = new Tray(__dirname + path + '/dist/assets/docker-xs.png');
    var contextMenu = Menu.buildFromTemplate([
        {label: 'Abrir', click: mainWindow.show()},
        {label: 'Fechar', click: function () {
            app._events['will-quit']();
            app.quit();
        }}
    ]);
    appIcon.setToolTip('DockerManager');
    appIcon.setContextMenu(contextMenu);

    mainWindow.setMenuBarVisibility(false);

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
    // app.db = db;
    // app.dbPath = dbPath + '_';
    // window.electron = electron;
    // window.db = db;
    // window.fs = fs;
    // app.saveDb = saveDb;

    // ipcMain.removeAllListeners('refresh');

    // console.log(remote, mainWindow.getCurrentWindow());
};

// ipcMain.on('save-db', function(event, arg) {
//     // event.sender.send('blablabla', [arguments])
//     console.log('save-dbbb', arg);
//     saveDb();
// });

app.on('ready', createWindow);
// app.on('show', function (event) {
//     mainWindow.setHighlightMode('always');
// });

app.on('window-all-closed', function () {
    // On macOS it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
        app.quit()
    }
});

app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (mainWindow === null) {
        createWindow()
    }
});

process.on('uncaughtException', function (err) {
    console.log(err);
});
