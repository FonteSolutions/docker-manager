# DockerManager

## Pré requisitos

##### electron
```bash
$ sudo npm install -g electron --unsafe-perm=true
```

##### electron-packager
```bash
$ sudo npm install -g electron-packager
```

##### electron-installer-debian
```bash
$ sudo npm install -g electron-installer-debian
```

## Rodando em dev

```bash
$ npm install
$ npm run watch
$ npm run electron
```

## Gerando build

##### Para gerar  build

```bash
$ npm run build-package
```

##### Para gerar .deb (debian)

```bash
electron-installer-debian --src release/linux-x64/docker-manager-linux-x64/ --dest release/linux-x64/installers/ --arch amd64 --description Teste --productDescription ProdutoTeste
```

##### Para gerar .exe (windows)

```bash
node winbuild.js
```

## License

[MIT]

[Webpack]: http://webpack.github.io
[MIT]: http://markdalgleish.mit-license.org
[angular]: http://angular.io
[electron]: http://electron.atom.io/
[ngrx]: https://github.com/ngrx/store
[material2]: https://github.com/angular/material2
[electron-packager]: https://github.com/electron-userland/electron-packager
