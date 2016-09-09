$(document).ready(function() {

    $.noty.defaults.theme = 'relax';
    
    var initialLoads = {
        maxLoads: 3, // change with max loads you have
        loads: 0,
        loaded: function () {
            initialLoads.loads++;
            if(initialLoads.loads == initialLoads.maxLoads) {
                wdtLoading.done();
            }
        }
    };
    
    var config = {
        image: null,
        version: null
    };

    function formatBytes(bytes,decimals) {
        if(bytes == 0) return '0 Byte';
        var k = 1000; // or 1024 for binary
        var dm = decimals + 1 || 3;
        var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
        var i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    }

    function timestamp2date(timestamp) {
        var date = new Date(timestamp * 1000);
        var dateFormatted = (new String(date.getDate()).length == 1 ? '0' + date.getDate() : date.getDate()) + '/' + (new String(date.getMonth()).length == 1 ? '0' + date.getMonth() : date.getMonth()) + '/' + date.getFullYear();
        dateFormatted+= ' ' + (new String(date.getHours()).length == 1 ? '0' + date.getHours() : date.getHours()) + ':' + (new String(date.getMinutes()).length == 1 ? '0' + date.getMinutes() : date.getMinutes());
        return dateFormatted;
    }

    $('body').tooltip({
        selector: '[rel=tooltip]'
    });

    /**
     * List all images then update list
     */
    $('#btn-images-refresh').on('click', function() {
        $.getJSON('/list-images', function(data, textStatus, event) {
            initialLoads.loaded();
            if(event.status == 200) {
                $('#images-list').html('');

                if(data.result.length == 0) {
                    $('#images-list').html('<span>You dont have pulled any docker images yet.</span>')
                    return;
                }

                for(var i=0,l=data.result.length;i<l;i++) {
                    var item = data.result[i];
                    var name = item.RepoTags[0].split(':');
                    var version = name.pop();
                    name = name.pop();

                    var html =  '<li class="list-group-item" data-image-id="' + item.RepoTags[0] + '">' +
                                    '<span class="name">' +
                                        name +
                                    '</span> ' +
                                    '<span class="label label-warning version">' +
                                        version +
                                    '</span> ' +
                                    '<span class="label label-default"><span class="glyphicon glyphicon-file" aria-hidden="true"></span> ' +
                                        formatBytes(item.VirtualSize) +
                                    '</span> ' +
                                    '<span class="label label-info"><span class="glyphicon glyphicon-calendar" aria-hidden="true"></span> ' +
                                        timestamp2date(item.Created) +
                                    '</span> ' +
                                    '<div class="btn-group pull-right" role="group">' +
                                        '<button type="button" class="btn btn-xs btn-primary btn-run-image">Run</button>' +
                                        '<button type="button" class="btn btn-xs btn-warning btn-rename-image">Rename</button>' +
                                        '<button type="button" class="btn btn-xs btn-danger btn-remove-image">Remove</button>' +
                                    '</div>' +
                                '</li>';
                    $('#images-list').append(html);
                }
            }
        });
    }).trigger('click');

    /**
     * List all running containers
     */
    $('#btn-containers-refresh').on('click', function() {
        $.getJSON('/list-containers', function(data, textStatus, event) {
            initialLoads.loaded();
            if(event.status == 200) {
                $('#containers-list tbody').html('');

                if(data.result.length == 0) {
                    $('#containers-list-none').show();
                    $('#containers-list').hide();
                    return;
                }

                $('#containers-list-none').hide();
                $('#containers-list').show();

                for(var i=0,l=data.result.length;i<l;i++) {
                    var item = data.result[i];
                    var ports = '';
                    for(var j=0,k=item.Ports.length;j<k;j++) {
                        ports+= '<span class="label label-default">' + item.Ports[j].PrivatePort + ' <span class="glyphicon glyphicon-transfer" aria-hidden="true"></span> ' + item.Ports[j].PublicPort + '</span> ';
                    }

                    var html =  '<tr class="container-item" data-image-id="' + item.Id + '"  title="' + item.Id + '" rel="tooltip">' +
                                    '<td class="text-center"><strong>' + item.Names[0].substr(1) + '</strong></td>' +
                                    '<td>' + item.Image + '</td>' +
                                    '<td>' + timestamp2date(item.Created) + '</td>' +
                                    '<td>' + ports + '</td>' +
                                    '<td>' + item.Command + '</td>' +
                                    '<td><em>' + item.Status + '</em></td>' +
                                    '<td class="text-center">' +
                                        '<div class="btn-group">' +
                                            '<button class="btn btn-xs btn-danger btn-container-stop"><span class="glyphicon glyphicon-stop" aria-hidden="true"></span></button>' +
                                            '<button class="btn btn-xs btn-info btn-container-info"><span class="glyphicon glyphicon-info-sign" aria-hidden="true"></span></button>' +
                                            '<button class="btn btn-xs btn-warning btn-container-history"><span class="glyphicon glyphicon-book" aria-hidden="true"></span></button>' +
                                            '<button class="btn btn-xs btn-default btn-container-open-terminal"><span class="glyphicon glyphicon-console" aria-hidden="true"></span></button>' +
                                        '</div>' +
                                    '</td>' +
                                '</tr>';
                    $('#containers-list tbody').append(html);
                }
            }
        });
    }).trigger('click');

    /**
     * List server info and show
     */
    $('#btn-server-status-refresh').on('click', function () {
        $.getJSON('/server-status', function(data, textStatus, event) {
            initialLoads.loaded();
            if(event.status == 200) {
                $('#server-status').html('');
                var html = '<li class="list-group-item">Name <span class="badge">' + data.result.Name + '</span></li>';
                html+= '<li class="list-group-item">OS <span class="badge">' + data.result.OperatingSystem + '</span></li>';
                html+= '<li class="list-group-item">Kernel <span class="badge">' + data.result.KernelVersion + '</span></li>';
                html+= '<li class="list-group-item">Images <span class="badge">' + data.result.Images + '</span></li>';
                html+= '<li class="list-group-item">Containers <span class="badge">' + data.result.Containers + '</span></li>';
                html+= '<li class="list-group-item">IPv4Forwarding <span class="badge">' + data.result.IPv4Forwarding + '</span></li>';
                html+= '<li class="list-group-item">MemTotal <span class="badge">' + formatBytes(data.result.MemTotal) + '</span></li>';
                html+= '<li class="list-group-item">Memory Limit <span class="badge">' + data.result.MemoryLimit + '</span></li>';
                html+= '<li class="list-group-item">CPUs <span class="badge">' + data.result.NCPU + '</span></li>';
                html+= '<li class="list-group-item">Docker Root Dir <span class="badge">' + data.result.DockerRootDir + '</span></li>';
                $('#server-status').append(html);
            }
        });
    }).trigger('click');

    /**
     * Search images
     */
    $('#btn-image-search').on('click', function () {
        wdtLoading.start({
            'category': 'pulling-image'
        });

        var name = $('#form-image-search').serializeArray()[0].value;
        $.post('/search-image', {name: name}, function(data, textStatus, event) {
            wdtLoading.done();
            if(event.status == 200) {
                $('#tb-add-image-list-search').html('').hide();

                if(data.result.length == 0) {
                    return;
                }

                $('#tb-add-image-list-search').show();

                for (var i=0,l=data.result.length;i<l;i++) {
                    var item = data.result[i];
                    var html =  '<a class="list-group-item" href="#">' +
                                    '<span class="badge" title="Downloads" rel="tooltip">' + item.star_count + '</span>' +
                                    '<h4 class="list-group-item-heading name">' + item.name + (item.is_official ? ' <span class="glyphicon glyphicon-star text-info" aria-hidden="true" style="font-size: 13px; color: gold;"></span>' : '') + '</h4>' +
                                    '<p class="list-group-item-text description">' + item.description + '</p>' +
                                '</a>';
                    $('#tb-add-image-list-search').append(html);
                }
            }
        }, 'json');
    });

    /**
     * Search image
     */
    $('#tb-add-image-list-search').on('click', 'a', function () {
        config.image = $(this).find('.name').text().trim();

        wdtLoading.start({
            'category': 'pulling-image'
        });

        $.post('/search-image-tags', {name: config.image}, function(data, textStatus, event) {
            wdtLoading.done();
            if(event.status == 200) {
                $('#tb-add-image-list-search').hide();
                $('#tb-add-image-tag-list-search').html('').show();

                if(data.result.length == 0) {
                    return;
                }

                data.result.reverse();

                for(var i=0,l=data.result.length;i<l;i++) {
                    var item = data.result[i];

                    var html =  '<a class="list-group-item" href="#">' +
                                    item.name +
                                '</a>';
                    $('#tb-add-image-tag-list-search').append(html);
                }
            }
        }, 'json');
    });

    /**
     * Pull image with tag
     */
    $('#tb-add-image-tag-list-search').on('click', 'a', function () {
        config.version = $(this).text().trim();

        wdtLoading.start({
            'category': 'pulling-image'
        });

        var n = noty({
            layout: 'top',
            type: 'warning',
            closeWith: [],
            text: 'Pulling image ' + config.image + ':' + config.version + '...',
            animation: {
                open: 'animated slideInDown',
                close: 'animated slideOutUp',
                easing: 'swing',
                speed: 500
            }
        });

        $.post('/pull-image', {name: config.image, version: config.version}, function(data, textStatus, event) {
            wdtLoading.done();
            n.close();
            if (event.status == 200) {
                $('#btn-images-refresh').trigger('click');
                $('#modal-add-image').modal('hide');

                noty({
                    layout: 'center',
                    type: 'success',
                    text: 'Image ' + config.image + ':' + config.version + ' pulled with success.',
                    animation: {
                        open: 'animated flipInX',
                        close: 'animated flipOutX',
                        easing: 'swing',
                        speed: 500
                    }
                });
            } else {
                noty({
                    layout: 'center',
                    type: 'error',
                    text: 'Error on pulling image ' + config.image + ':' + config.version + '.',
                    animation: {
                        open: 'animated flipInX',
                        close: 'animated flipOutX',
                        easing: 'swing',
                        speed: 500
                    }
                });
            }
        });
    });

    /**
     * Port
     */
    $('#form-image-run .btn-add-port').on('click', function () {
        var html = '<div class="port">' +
            '<div class="col-xs-5 text-center">' +
                '<input type="text" class="form-control local" placeholder="local" name="port-local[]" />' +
            '</div>' +
            '<div class="col-xs-1 text-center divisor"><span class="glyphicon glyphicon-transfer" aria-hidden="true"></span></div>' +
            '<div class="col-xs-5 text-center">' +
                '<input type="text" class="form-control docker" placeholder="docker" name="port-docker[]" />' +
            '</div>' +
            '<div class="col-xs-1 text-center">' +
                '<button class="btn btn-sm btn-danger btn-remove-port"><span class="glyphicon glyphicon-remove" aria-hidden="true"></span></button>' +
            '</div>';
        $('#form-image-run .list-ports').append(html);
        if($('#form-image-run .list-ports').next()[0].tagName == 'HR') {
            $('#form-image-run .list-ports').after('<br clear="both" />');
        }
    });

    $('#form-image-run .list-ports').on('click', '.btn-remove-port', function () {
        $(this).closest('.port').remove();
        if($('#form-image-run .list-ports').next()[0].tagName == 'BR' && $('#form-image-run .list-ports .port').length == 0) {
            $('#form-image-run .list-ports').next().remove();
        }
    });

    /**
     * Volume
     */
    $('#form-image-run .btn-add-volume').on('click', function () {
        var html = '<div class="volume">' +
            '<div class="col-xs-5 text-center">' +
                '<input type="text" class="form-control local" placeholder="local" name="volume-local[]" />' +
            '</div>' +
            '<div class="col-xs-1 text-center divisor"><span class="glyphicon glyphicon-transfer" aria-hidden="true"></span></div>' +
            '<div class="col-xs-5 text-center">' +
                '<input type="text" class="form-control docker" placeholder="docker" name="volume-docker[]" />' +
            '</div>' +
            '<div class="col-xs-1 text-center">' +
                '<button class="btn btn-sm btn-danger btn-remove-volume"><span class="glyphicon glyphicon-remove" aria-hidden="true"></span></button>' +
            '</div>';
        $('#form-image-run .list-volumes').append(html);
    });

    $('#form-image-run .list-volumes').on('click', '.btn-remove-volume', function () {
        $(this).closest('.volume').remove();
    });

    /**
     * Run image click
     */
    $('#images-list').on('click', '.btn-run-image', function () {
        var $parent = $(this).closest('.list-group-item');
        var imageId = $parent.data('image-id');


        $('#modal-run-image').modal('show');
        $('#form-image-run .list-ports .port').remove();
        $('#form-image-run .list-volumes .volume').remove();

        $('#form-image-run .image-id').val(imageId);
        $('#form-image-run .name').text($parent.find('.name').text());
        $('#form-image-run .version').text($parent.find('.version').text());
        $('#form-image-run .initial-command').val('bash');
        $('#form-image-run .btn-add-port').trigger('click');
        $('#form-image-run .btn-add-port').trigger('click');
        $('#form-image-run .btn-add-volume').trigger('click');

        var $ports = $('#form-image-run .list-ports .port');
        $($ports.get(0)).find('.local').val('80');
        $($ports.get(0)).find('.docker').val('80');
        $($ports.get(1)).find('.local').val('443');
        $($ports.get(1)).find('.docker').val('443');

        var $volumes = $('#form-image-run .list-volumes .volume');
        $($volumes.get(0)).find('.local').val('/var/www/html/');
        $($volumes.get(0)).find('.docker').val('/var/www/html/');
    });

    $('#modal-run-image .btn-run').on('click', function () {
        $.post('/run-image', $('#form-image-run').serializeArray(), function(data, textStatus, event) {
            $('.list-containers').trigger('click');
        });
    });

    /**
     * Rename image click
     */
    $('#images-list').on('click', '.btn-rename-image', function () {
        var $parent = $(this).closest('.list-group-item');
        var imageId = $parent.data('image-id');
        
        $('#modal-rename-image').modal('show');
        $('#form-image-rename input[name=name]').val($parent.find('.name').text() + ':' + $parent.find('.version').text());
        $('#form-image-rename .image-id').val(imageId);
        $('#form-image-rename .old-name').val($parent.find('.name').text() + ':' + $parent.find('.version').text());
    });
    
    $('#modal-rename-image .btn-rename').on('click', function () {
        wdtLoading.start({
            'category': 'pulling-image'
        });
        
        $.post('/rename-image', {name: $('#form-image-rename input[name=name]').val(), imageId: $('#form-image-rename .image-id').val(), oldName: $('#form-image-rename .old-name').val()}, function(data, textStatus, event) {
            setTimeout(function () {
                $('.list-images').trigger('click');
                wdtLoading.done();
            }, 1000);
        });
    });

    /**
     * Remove image click
     */
    $('#images-list').on('click', '.btn-remove-image', function () {
        var $parent = $(this).closest('.list-group-item');
        var imageId = $parent.data('image-id');

        noty({
            layout: 'center',
            type: 'confirm',
            text: 'Are you sure to remove image ' + $parent.find('.name').text() + ' version ' + $parent.find('.version').text() + '?',
            buttons: [
                {
                    addClass: 'btn btn-primary',
                    text: 'Ok',
                    onClick: function ($noty) {
                        $noty.close();
                        $.post('/remove-image', {image: imageId}, function(data, textStatus, event) {
                            $('#btn-images-refresh').trigger('click');
                        });
                    }
                },
                {
                    addClass: 'btn btn-danger',
                    text: 'Cancel',
                    onClick: function ($noty) {
                        $noty.close();
                    }
                }
            ],
            animation: {
                open: 'animated flipInX',
                close: 'animated flipOutX',
                easing: 'swing',
                speed: 500
            }
        });
    });

    /**
     * Container stop
     */
    $('#containers-list tbody').on('click', '.btn-container-stop', function () {
        var containerId = $(this).closest('.container-item').data('image-id');
        $.post('/stop-container', {containerId: containerId}, function(data, textStatus, event) {
            $('.list-containers').trigger('click');
        });
    });

    /**
     * Container info
     */
    $('#containers-list tbody').on('click', '.btn-container-info', function () {
        var containerId = $(this).closest('.container-item').data('image-id');
        console.log($(this), containerId);
    });

    /**
     * Container history
     */
    $('#containers-list tbody').on('click', '.btn-container-history', function () {
        var containerId = $(this).closest('.container-item').data('image-id');
        console.log($(this), containerId);
    });

    /**
     * Container open terminal
     */
    $('#containers-list tbody').on('click', '.btn-container-open-terminal', function () {
        var containerId = $(this).closest('.container-item').data('image-id');

        if($('#terminal_' + containerId).length == 1) {
            $('#terminal_' + containerId).dockmodal('restore');
            return;
        }

        var $terminal = $('<div class="terminal-item" id="terminal_' + containerId + '" data-container-id="' + containerId + '" style="height:100%;"></div>');
        $('#terminal-bar').append($terminal);

        var term = new Terminal();

        $terminal.dockmodal({
            title: containerId,
            open: function ($content) {
                term.open($content[0]);

                var url = 'ws://localhost:2375/containers/' + containerId + '/attach/ws?logs=0&stream=1&stdin=1&stdout=1&stderr=1';
                var socket = new WebSocket(url);

                term.on('data', function (data) {
                    socket.send(data);
                });

                socket.onmessage = function (e) {
                    term.write(e.data);
                };

                term.sizeToFit();
                term.focus();

                setTimeout(function () {
                    socket.send('\r');
                }, 1000);
            },
            close: function ($term) {
                $('#terminal_' + containerId).remove();
            },
            popout: function ($term) {
                term.sizeToFit();
                term.focus();
            },
            restore: function ($term) {
                term.sizeToFit();
                term.focus();
            }
        });
    });
});