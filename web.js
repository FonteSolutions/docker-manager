try {
	var nsHttp = require("http");
	var nsFs = require("fs");
    var nsUrl = require("url");
    var nsShell = require('shelljs');
    var debug = true;
    var silent;
    
    silent = debug ? false : true;
	
    nsHttp.createServer(function(request, response) {
        var pathname = nsUrl.parse(request.url).pathname;
        if(debug) {
            console.log("> Received request: " + pathname + " - From: " + (request.headers['x-forwarded-for'] != undefined ? request.headers['x-forwarded-for'] : request.connection.remoteAddress));
        }
        
        switch(true) {
            case pathname == '/list-images':
                if(debug) {
                    console.log('> COMMAND: ', 'docker images');
                }
                var out = nsShell.exec('docker images', {silent:silent});

                response.writeHeader(200, {'Content-type': 'text/plain'});
                response.write(JSON.stringify(out));
                response.end();
                break;
            
            case pathname == '/list-containers':
                if(debug) {
                    // console.log('> COMMAND: ', 'docker ps');
                    console.log('> COMMAND: ', 'docker ps --format "{{.ID}}|{{.Image}}|{{.CreatedAt}}|{{.Ports}}|{{.Names}}"');
                }
                // var out = nsShell.exec('docker ps', {silent:silent});
                var out = nsShell.exec('docker ps --format "{{.ID}}|{{.Image}}|{{.CreatedAt}}|{{.Ports}}|{{.Names}}"', {silent:silent});

                response.writeHeader(200, {'Content-type': 'text/plain'});
                response.write(JSON.stringify(out));
                response.end();
                break;

            case pathname == '/server-status':
                if(debug) {
                    console.log('> COMMAND: ', 'docker info');
                }
                var out = nsShell.exec('docker info', {silent:silent});

                response.writeHeader(200, {'Content-type': 'text/plain'});
                response.write(JSON.stringify(out));
                response.end();
                break;

            case pathname == '/search-image':
                var name = [];
                request.on('data', function(chunk) {
                    name.push(chunk);
                }).on('end', function() {
                    name = Buffer.concat(name).toString().split('=')[1];
                    name = decodeURIComponent(name).replace(/\+/, '-');
                    if(debug) {
                        console.log('> COMMAND: ', 'docker search ' + name);
                    }
                    var out = nsShell.exec('docker search ' + name, {silent:silent});

                    response.writeHeader(200, {'Content-type': 'text/plain'});
                    response.write(JSON.stringify(out));
                    response.end();
                });
                break;
            
            case pathname == '/list-image-tags':
                var name = [];
                request.on('data', function(chunk) {
                    name.push(chunk);
                }).on('end', function() {
                    name = Buffer.concat(name).toString().split('=')[1];
                    name = decodeURIComponent(name).replace(/\+/, '-');
                    var cmd = "wget -q https://registry.hub.docker.com/v1/repositories/" + name + "/tags -O -  | sed -e 's/[][]//g' -e 's/\"//g' -e 's/ //g' | tr '}' '\n'  | awk -F: '{print $3}'";
                    if(debug) {
                        console.log('> COMMAND: ', cmd);
                    }
                    var out = nsShell.exec(cmd, {silent:silent});

                    response.writeHeader(200, {'Content-type': 'text/plain'});
                    response.write(JSON.stringify(out));
                    response.end();
                });
                break;

            case pathname == '/pull-image':
                var data = [];
                request.on('data', function(chunk) {
                    data.push(chunk);
                }).on('end', function() {
                    data = Buffer.concat(data).toString().trim().split('&');
                    var _data = {};
                    for(var i=0,l=data.length;i<l;i++) {
                        _data[data[i].trim().split('=')[0]] = data[i].trim().split('=')[1];
                    }
                    _data.name = decodeURIComponent(_data.name).replace(/\+/, '-');
                    var _repo = _data.name;
                    if(_data.version != 'latest') {
                        _repo+= ':' + _data.version;
                    }
                    if(debug) {
                        console.log('> COMMAND: ', 'docker pull ' + _repo);
                    }
                    var out = nsShell.exec('docker pull ' + _repo, {silent:silent});

                    response.writeHeader(200, {'Content-type': 'text/plain'});
                    response.write(JSON.stringify(out));
                    response.end();
                });
                break;
            
            case pathname == '/remove-image':
                var imageId = [];
                request.on('data', function(chunk) {
                    imageId.push(chunk);
                }).on('end', function() {
                    imageId = Buffer.concat(imageId).toString().split('=')[1];
                    imageId = decodeURIComponent(imageId).replace(/\+/, '-');
                    if(debug) {
                        console.log('> COMMAND: ', 'docker rmi -f ' + imageId);
                    }
                    var out = nsShell.exec('docker rmi -f ' + imageId, {silent:silent});

                    response.writeHeader(200, {'Content-type': 'text/plain'});
                    response.write(JSON.stringify(out));
                    response.end();
                });
                break;
            
            case pathname == '/rename-image':
                var data = [];
                request.on('data', function(chunk) {
                    data.push(chunk);
                }).on('end', function() {
                    data = Buffer.concat(data).toString().trim().split('&');
                    var _data = {};
                    for(var i=0,l=data.length;i<l;i++) {
                        _data[data[i].trim().split('=')[0]] = data[i].trim().split('=')[1];
                    }
                    _data.name = decodeURIComponent(_data.name).replace(/\+/, '-');
                    _data.oldName = decodeURIComponent(_data.oldName).replace(/\+/, '-');

                    if(debug) {
                        console.log('> COMMAND: ', 'docker tag ' + _data.imageId + ' ' + _data.name);
                        console.log('> COMMAND: ', 'docker rmi ' + _data.oldName);
                    }
                    var out = nsShell.exec('docker tag ' + _data.imageId + ' ' + _data.name, {silent:silent});
                    var outRemove = nsShell.exec('docker rmi ' + _data.oldName, {silent:silent});

                    response.writeHeader(200, {'Content-type': 'text/plain'});
                    response.write(JSON.stringify(out));
                    response.end();
                });
                break;
            
            case pathname == '/run-image':
                var data = [];
                request.on('data', function(chunk) {
                    data.push(chunk);
                }).on('end', function() {
                    data = Buffer.concat(data).toString().trim();
                    data = decodeURIComponent(data).split('&');

                    var imageId, name = '', initialCommand = '', ports = [], volumes = [], interactive = false, terminal = false;

                    for(var i=0,l=data.length;i<l;i++) {
                        var param = data[i].split('=', 2);
                        switch(param[0]) {
                            case 'image-id':
                                imageId = param[1];
                                break;
                            case 'initial-command':
                                initialCommand = param[1];
                                break;
                            case 'name':
                                name = param[1];
                                break;
                            case 'terminal':
                                terminal = param[1] == 1 ? true : false;
                                break;
                            case 'interactive':
                                interactive = param[1] == 1 ? true : false;
                                break;
                            case 'port-local[]':
                                ports.push({'in':param[1], 'out': null});
                                break;
                            case 'port-docker[]':
                                ports[ports.length - 1].out = param[1];
                                break;
                            case 'volume-local[]':
                                volumes.push({'in':param[1], 'out': null});
                                break;
                            case 'volume-docker[]':
                                volumes[volumes.length - 1].out = param[1];
                                break;
                        }
                    }

                    var out = '';
                    if(imageId) {
                        var cmd = 'docker run -d ';

                        if (terminal == true) {
                            cmd += '-t ';
                        }
                        if (interactive == true) {
                            cmd += '-i ';
                        }
                        if (name) {
                            cmd += '--name ' + name + ' ';
                        }

                        for(var i=0,l=ports.length;i<l;i++) {
                            cmd+= '-p ' + ports[i].in + ':' + ports[i].out + ' ';
                        }

                        for(var i=0,l=volumes.length;i<l;i++) {
                            cmd+= '-v ' + volumes[i].in + ':' + volumes[i].out + ' ';
                        }

                        cmd+= imageId + ' ' + initialCommand;
                        
                        if(debug) {
                            console.log('> COMMAND: ', cmd);
                        }
                        out = nsShell.exec(cmd, {silent:silent});
                    }

                    response.writeHeader(200, {'Content-type': 'text/plain'});
                    response.write(JSON.stringify(out));
                    response.end();
                });
                break;

            case pathname == '/stop-container':
                var data = [];
                request.on('data', function(chunk) {
                    data.push(chunk);
                }).on('end', function() {
                    data = Buffer.concat(data).toString().trim().split('&');
                    var _data = {};
                    for(var i=0,l=data.length;i<l;i++) {
                        _data[data[i].trim().split('=')[0]] = data[i].trim().split('=')[1];
                    }
                    _data.containerId = decodeURIComponent(_data.containerId);

                    // if(debug) {
                    //     console.log('> COMMAND: ', 'docker stop ' + _data.containerId);
                    // }
                    // var out = nsShell.exec('docker stop ' + _data.containerId, {silent:silent});
                    
                    if(debug) {
                        console.log('> COMMAND: ', 'docker rm -f ' + _data.containerId);
                    }
                    var out = nsShell.exec('docker rm -f ' + _data.containerId, {silent:silent});

                    response.writeHeader(200, {'Content-type': 'text/plain'});
                    response.write(JSON.stringify(out));
                    response.end();
                });
                break;

            case request.url.indexOf('.js') != -1:
                nsFs.readFile('./' + request.url, function(err, js) {
                    if (err) {
                        throw err;
                    }
                    response.writeHeader(200, {'Content-type': 'text/javascript'});
                    response.write(js);
                    response.end();
                });
                break;
            
            case request.url.indexOf('.css') != -1:
                nsFs.readFile('./' + request.url, function(err, css) {
                    if (err) {
                        throw err;
                    }
                    response.writeHeader(200, {'Content-type': 'text/css'});
                    response.write(css);
                    response.end();
                });
                break;

            case request.url.indexOf('.woff') != -1 || request.url.indexOf('.woff2') != -1 || request.url.indexOf('.ttf') != -1:
                nsFs.readFile('./' + request.url, function(err, font) {
                    if (err) {
                        throw err;
                    }
                    response.writeHeader(200, {'Content-type': 'text/plain'});
                    response.write(font);
                    response.end();
                });
                break;

            case request.url.indexOf('.gif') != -1:
                nsFs.readFile('./' + request.url, function(err, gif) {
                    if (err) {
                        throw err;
                    }
                    response.writeHeader(200, {'Content-type': 'image/gif'});
                    response.write(gif);
                    response.end();
                });
                break;
            
            case request.url.indexOf('.png') != -1:
                nsFs.readFile('./' + request.url, function(err, png) {
                    if (err) {
                        throw err;
                    }
                    response.writeHeader(200, {'Content-type': 'image/png'});
                    response.write(png);
                    response.end();
                });
                break;
            
            default:
                nsFs.readFile('./app.html', function(err, html) {
                    if (err) {
                        throw err;
                    }
                    response.writeHeader(200, {'Content-type': 'text/html'});
                    response.write(html);
                    response.end();
                });
                break;
        }
    }).listen(31337);
    
    // @TODO TERMINAL - $ docker  exec -ti ed009594aaeb bash
    console.info('Running at http://127.0.0.1:31337/');

} catch(err) {
	console.log('Error:', err);
}
