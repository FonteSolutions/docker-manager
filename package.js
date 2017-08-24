"use strict";

var packager = require('electron-packager');
var colors = require('colors');
var fs = require('fs');
var cp = require("child_process");
const dockerode = require('dockerode');
const pkg = require('./package.json');
const argv = require('minimist')(process.argv.slice(2));
const devDeps = Object.keys(pkg.devDependencies);
const appName = argv.name || pkg.productName || pkg.name;
const shouldUseAsar = argv.asar || false;
const shouldBuildAll = argv.all || false;
const arch = argv.arch || 'x64';
// const arch = argv.arch || 'all';
// const platform = argv.platform || 'win32';
const platform = argv.platform || 'linux';
// const platform = argv.platform || 'darwin';
var ncp = require('ncp').ncp;

const DEFAULT_OPTS = {
    dir: './src/app',
    name: appName,
    asar: shouldUseAsar
    // ignore: [].concat(devDeps.map(name => `/node_modules/${name}($|/)`))
};

// const icon = './src/app/dist/assets/app-icon';
const icon = './dist/assets/docker-sm.png';

if (icon) {
    DEFAULT_OPTS.icon = icon;
}

pack(platform, arch, function (err, appPath) {
    // console.log(DEFAULT_OPTS);
    if (err) {
        console.error(("Gerando build... " + err).red);
    } else {
        console.log("Build gerada com sucesso!".green);
        console.log(("Gerado em: ").green + (__dirname + '/' + appPath[0]).underline.green);
        console.log("Copiando imagens e fonts...".magenta.italic);

        const mainjs = __dirname + '/main.js';
        const indexhtml = __dirname + '/src/app/index.html';
        const output = __dirname + `/release/${platform}-${arch}/${appName}-${platform}-${arch}`;

        console.log(`Copiando ${mainjs} para ${output}/main.js`.magenta);
        console.log(`Copiando ${indexhtml} para ${output}/resources/app/index.html`.magenta);

        fs.createReadStream(mainjs).pipe(fs.createWriteStream(output + '/resources/app/main.js'));
        fs.createReadStream(indexhtml).pipe(fs.createWriteStream(output + '/resources/app/index.html'));

        const source = __dirname + '/src/assets';
        const destination = output + '/resources/assets';

        ncp(source, destination, function (err) {
            if (err) {
                return console.error(('Erro ao copiar as imagens. ' + err).red);
            }
            console.log('Imagens copiadas com sucesso!'.green);
        });

        // const sourceFonts = __dirname + '/node_modules/materialize-css/dist/fonts';
        // const destinationFonts = output + '/resources/fonts';
        // ncp(sourceFonts, destinationFonts, function (err) {
        //     if (err) {
        //         return console.error(('ERROR COPYING FONTS! ' + err).red);
        //     }
        //     console.log('FONTS COPIED SUCCESSFULLY'.green);
        // });
        const sourceFonts = __dirname + '/src/fonts';
        const destinationFonts = output + '/resources/fonts';
        ncp(sourceFonts, destinationFonts, function (err) {
            if (err) {
                return console.error(('Erro ao copiar fonts.' + err).red);
            }
            console.log('Fonts copiadas com sucesso!'.green);
        });

        process.chdir(output + '/resources/app');
        cp.exec('npm install');
    }
});

function pack(plat, arch, cb) {
    // there is no darwin ia32 electron
    if (plat === 'darwin' && arch === 'ia32') {
        return;
    }

    const iconObj = {
        icon: DEFAULT_OPTS.icon
    };

    const opts = Object.assign({}, DEFAULT_OPTS, iconObj, {
        platform: plat,
        arch,
        prune: true,
        all: shouldBuildAll,
        overwrite: true,
        appVersion: pkg.version || DEFAULT_OPTS.version,
        out: `release/${plat}-${arch}`
    });

    console.log('\x1Bc');
    console.log('Gerando build do app '.magenta.italic + appName.bold.magenta + '...'.magenta);

    packager(opts, cb);
}

