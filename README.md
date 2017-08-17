# Angular 2 Electron Brscan Starterkit

Estrutura para apps [electron] com [angular] usando [Webpack], [ngrx] e [material2]

Para rodar em dev:

## Run the example

```bash
$ npm install
$ npm run watch
$ npm run electron
```

## Packaging

Para gerar build

```bash
$ npm run build-package
```

Para gerar .deb

```bash
electron-installer-debian --src release/linux-x64/docker-manager-linux-x64/ --dest release/linux-x64/installers/ --arch amd64 --description Teste --productDescription ProdutoTeste
```

Para gerar .exe

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
