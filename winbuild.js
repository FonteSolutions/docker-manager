// $ node winbuild.js
var electronInstaller = require('electron-winstaller');

console.log('teste11234');

resultPromise = electronInstaller.createWindowsInstaller({
    appDirectory: 'release/win32-x64/docker-manager-win32-x64/',
    outputDirectory: 'release/win32-x64/installers/',
    authors: 'My App Inc.',
    description: 'Meu app - Instalador',
    descriptionProduct: 'Meu app - Instalador',
    exe: 'docker-manager.exe'
  });

resultPromise.then(() => console.log("It worked!"), (e) => console.log(`No dice: ${e.message}`));