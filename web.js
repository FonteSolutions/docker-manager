try {
    // Includes
	var nsHttp = require("http");
	var nsFs = require("fs");
    var nsUrl = require("url");
    var nsShell = require('shelljs');
    // Debug
    var debug = true;
    var silent = debug ? false : true;
    // API
    var API = {
        url: 'http://localhost:2375/',
        cmdApi: 'curl ',
        run: function(action, params, isPost, isDelete, parseJsonReturned) {
            parseJsonReturned = parseJsonReturned == undefined ? true : parseJsonReturned;

            var cmd = API.cmdApi;
            if(isPost || isDelete) {
                if(isPost) {
                    cmd += '-X POST ';
                }
                if(isDelete) {
                    cmd += '-X DELETE ';
                }
                cmd+= '-H "Content-Type: application/json" ';
                if(params && params instanceof Object) {
                    cmd+= " -d '" + JSON.stringify(params) + "' ";
                }
                cmd+= API.url;
            } else {
                cmd+= API.url;

                if(params && params instanceof Object) {
                    action+= '?';
                    for(i in params) {
                        action+= i + '=' + params[i];
                        action+= '&';
                    }
                    action = action.substring(0, action.length - 1);
                }
            }

            if(debug) {
                console.log('\n\n\t> COMMAND: ', cmd + action + ' (PARSING: ' + parseJsonReturned +')\n');
            }
            var result = nsShell.exec(cmd + action, {silent:silent});
            if(parseJsonReturned) {
                result = JSON.parse(result);
                return JSON.stringify({
                    result:result
                });
            }
            return '';
        },
        runShell: function (cmd, parseJsonReturned) {
            parseJsonReturned = parseJsonReturned == undefined ? true : parseJsonReturned;
            if(debug) {
                console.log('> COMMAND: ', cmd + ' (PARSING: ' + parseJsonReturned +')\n');
            }
            var result = nsShell.exec(cmd, {silent:silent});
            if(parseJsonReturned) {
                result = JSON.parse(result);
                return JSON.stringify({
                    result:result
                });
            }
            return '';
        },
        runPure: function (cmd) {
            if(debug) {
                console.log('> COMMAND: ', cmd);
            }
            return nsShell.exec(cmd, {silent:silent});
        },
        parseResult: function (data) {
            data = Buffer.concat(data).toString().trim().split('&');
            var _data = {};
            for(var i=0,l=data.length;i<l;i++) {
                var item = data[i].trim().split('=');
                if(!item[0].trim() || !item[1].trim()) {
                    continue;
                }
                _data[item[0]] = decodeURIComponent(item[1]).replace(/\+/, '-');
            }
            return _data;
        }
    };

    nsHttp.createServer(function(request, response) {
        var pathname = nsUrl.parse(request.url).pathname;
        if(debug) {
            console.log("> Received request: " + pathname + " - From: " + (request.headers['x-forwarded-for'] != undefined ? request.headers['x-forwarded-for'] : request.connection.remoteAddress));
        }
        
        switch(true) {
            // List images
            case pathname == '/list-images':
                response.writeHeader(200, {'Content-type': 'application/json'});
                response.write(API.run('images/json'));
                response.end();
                break;
            // List containers
            case pathname == '/list-containers':
                response.writeHeader(200, {'Content-type': 'application/json'});
                response.write(API.run('containers/json'));
                response.end();
                break;
            // Get server status
            case pathname == '/server-status':
                response.writeHeader(200, {'Content-type': 'application/json'});
                response.write(API.run('info'));
                response.end();
                break;
            // Search images
            case pathname == '/search-image':
                var name = [];
                request.on('data', function(chunk) {
                    name.push(chunk);
                }).on('end', function() {
                    name = Buffer.concat(name).toString().split('=')[1];
                    name = decodeURIComponent(name).replace(/\+/, '-');

                    response.writeHeader(200, {'Content-type': 'application/json'});
                    response.write(API.run('images/search', {term: name}));
                    response.end();
                });
                break;
            // Search images tags
            case pathname == '/search-image-tags':
                var name = [];
                request.on('data', function(chunk) {
                    name.push(chunk);
                }).on('end', function() {
                    name = Buffer.concat(name).toString().split('=')[1];
                    name = decodeURIComponent(name).replace(/\+/, '-');

                    response.writeHeader(200, {'Content-type': 'text/plain'});
                    response.write(API.runShell('curl https://registry.hub.docker.com/v1/repositories/' + name + '/tags'));
                    response.end();
                });
                break;
            // Pull image
            case pathname == '/pull-image':
                var data = [];
                request.on('data', function(chunk) {
                    data.push(chunk);
                }).on('end', function() {
                    data = API.parseResult(data);

                    API.runPure('docker pull ' + data.name + ':' + data.version);

                    response.writeHeader(200, {'Content-type': 'text/plain'});
                    response.write(JSON.stringify({result: []}));
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

                    var out = ' ';
                    if(imageId) {
                        // var cmd = 'docker run -d --privileged -v /var/run/docker.sock:/var/run/docker.sock ';
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

                        API.run('containers/' + name + '?force=1', null, false, true, false);
                        out = API.runShell(cmd, false);
                    }

                    response.writeHeader(200, {'Content-type': 'text/plain'});
                    response.write(JSON.stringify(out));
                    response.end();
                    /*
                        // cmd+= imageId + ' ' + initialCommand;

                        API.run('containers/' + name + '?force=1', null, false, true, false);
                        var created = API.run('containers/create?name=' + name, {
                            Cmd: initialCommand,
                            Image: imageId
                        }, true);

                        var containerId = JSON.parse(created).result.Id;
                        out = API.run('containers/' + containerId + '/start?name=' + name, {RestartPolicy: {Name: 'always'}}, true, false, false);
                    }

                    response.writeHeader(200, {'Content-type': 'application/json'});
                    response.write(created);
                    response.end();*/
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

                    response.writeHeader(200, {'Content-type': 'text/plain'});
                    response.write(API.run('containers/' + _data.containerId + '/stop', {}, true, false, false));
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
