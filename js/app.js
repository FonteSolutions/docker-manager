$(document).ready(function() {

    $.noty.defaults.theme = 'relax';
    
    var initialLoads = {
        maxLoads: 2, // change with max loads you have
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

    var K_GLOBAL = {
        TIMER: {
            CONTAINERSTATS: false,
            CONTAINERSTATSINTERVAL: null,
            CONTAINERSTATSCREATED: false,
            ALLCONTAINERSTATS: false,
            ALLCONTAINERSTATSINTERVAL: null,
            ALLCONTAINERSTATSCREATED: false
        }
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

    $('.btn-open-server-info').on('click', function() {
        var apiVersions = {
            '1.12': '1.24',
            '1.11': '1.23',
            '1.10': '1.22',
            '1.9': '1.21',
            '1.8': '1.20',
            '1.7': '1.19',
            '1.6': '1.18'
        };
        $.getJSON('/server-status', function(data, textStatus, event) {
            initialLoads.loaded();
            if(event.status == 200) {
                $('#modal-server-info .modal-body ul').html('');
                var html = '<li class="list-group-item">Name <span class="label label-right label-default">' + data.result.Name + '</span></li>';
                html+= '<li class="list-group-item">Docker Version <span class="label label-right label-default">' + data.result.ServerVersion + '</span></li>';
                html+= '<li class="list-group-item">Docker API Version <span class="label label-right label-default">' + apiVersions[data.result.ServerVersion.substr(0, 4)] + '</span></li>';
                html+= '<li class="list-group-item">OS <span class="label label-right label-default">' + data.result.OperatingSystem + ' / ' + data.result.Architecture + '</span></li>';
                html+= '<li class="list-group-item">MemTotal <span class="label label-right label-default">' + formatBytes(data.result.MemTotal) + '</span></li>';
                html+= '<li class="list-group-item">CPUs <span class="label label-right label-default">' + data.result.NCPU + '</span></li>';
                html+= '<li class="list-group-item">Kernel <span class="label label-right label-default">' + data.result.KernelVersion + '</span></li>';
                html+= '<li class="list-group-item">Images <span class="label label-right label-default">' + data.result.Images + '</span></li>';
                html+= '<li class="list-group-item">Containers <span rel="tooltip" title="Containers Stopped" class="label label-right label-danger">' + data.result.ContainersStopped + '</span> <span rel="tooltip" title="Containers Paused" class="label label-right label-warning">' + data.result.ContainersPaused + '</span> <span rel="tooltip" title="Containers Running" class="label label-right label-success">' + data.result.ContainersRunning + '</span> <span rel="tooltip" title="Total Containers" class="label label-default label-right">' + data.result.Containers + '</span></li>';
                html+= '<li class="list-group-item">IPv4Forwarding <span class="label label-right label-default">' + data.result.IPv4Forwarding + '</span></li>';
                html+= '<li class="list-group-item">Memory Limit <span class="label label-right label-default">' + data.result.MemoryLimit + '</span></li>';
                html+= '<li class="list-group-item">Docker Root Dir <span class="label label-right label-default">' + data.result.DockerRootDir + '</span></li>';
                $('#modal-server-info .modal-body ul').append(html);
            }
        });
    });

    $('.btn-view-containers').on('click', function() {
        $('#view-images').hide();
        $('#view-containers').show();
        $('#navbar-top li').removeClass('active');
        $('#navbar-top li.btn-view-containers').addClass('active');
    });

    $('.btn-view-images').on('click', function() {
        $('#view-containers').hide();
        $('#view-images').show();
        $('#navbar-top li').removeClass('active');
        $('#navbar-top li.btn-view-images').addClass('active');
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
                                    '<div class="btn-group pull-right" role="group" style="margin-top: -7px;margin-right: -12px">' +
                                        '<button type="button" class="btn btn-primary btn-run-image">Run</button>' +
                                        '<button type="button" class="btn btn-warning btn-rename-image">Rename</button>' +
                                        '<button type="button" class="btn btn-danger btn-remove-image">Remove</button>' +
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
                    $('#btn-containers-stats').hide();
                    return;
                }

                $('#containers-list-none').hide();
                $('#containers-list').show();
                $('#btn-containers-stats').show();

                var containersRunning = 0;

                for(var i=0,l=data.result.length;i<l;i++) {
                    var item = data.result[i];
                    var haveWebPort = false
                    var ports = '';
                    for(var j=0,k=item.Ports.length;j<k;j++) {
                        if(item.Ports[j].PrivatePort == 80) {
                            haveWebPort = item.Ports[j].PublicPort;
                        }
                        ports+= '<span class="label label-default">' + item.Ports[j].PrivatePort + ' <span class="glyphicon glyphicon-transfer" aria-hidden="true"></span> ' + item.Ports[j].PublicPort + '</span> ';
                    }
                    // Beginning all stopped
                    var showBtnPlay = true;
                    var showBtnStop = false;
                    var statusBgClass = '';
                    var statusString = '';
                    switch(item.State) {
                        case 'exited':
                            statusBgClass = 'warning';
                            statusString = 'Exited';
                            break;
                        case 'created':
                            statusBgClass = 'info';
                            statusString = 'Created';
                            break;
                        case 'running':
                            containersRunning++;
                            showBtnPlay = false;
                            showBtnStop = true;
                            statusBgClass = 'success';
                            statusString = 'Running';
                            break;
                    }

                    var IPAddress = item.NetworkSettings.Networks.bridge.IPAddress;
                    if(haveWebPort) {
                        IPAddress = '<a title="Open URL in other tab" rel="tooltip" target="_blank" href="http://localhost:' + haveWebPort + '/">' + IPAddress + '</a>';
                    }

                    var html =  '<tr class="font-terminal container-item ' + statusBgClass + '" data-image-id="' + item.Id + '">' +
                                    '<td class="text-center">' + item.Id.substr(0, 12) + '</td>' +
                                    '<td class="text-center container-name"><strong>' + item.Names[0].substr(1) + '</strong></td>' +
                                    '<td>' + item.Image + '</td>' +
                                    '<td>' + ports + '</td>' +
                                    '<td class="text-center">' + IPAddress + '</td>' +
                                    '<td class="text-center">' +
                                        '<div class="btn-group">' +
                                            '<button rel="tooltip" title="Info" class="btn btn-xs btn-info btn-container-info"><span class="glyphicon glyphicon-info-sign" aria-hidden="true"></span></button>' +
                                            (showBtnPlay ? '<button rel="tooltip" title="Start" class="btn btn-xs btn-success btn-container-play"><span class="glyphicon glyphicon-play" aria-hidden="true"></span></button>' : '') +
                                            (showBtnStop ? '<button rel="tooltip" title="Stop" class="btn btn-xs btn-default btn-container-stop"><span class="glyphicon glyphicon-stop" aria-hidden="true"></span></button>' : '') +
                                            '<button rel="tooltip" title="Remove" class="btn btn-xs btn-danger btn-container-remove"><span class="glyphicon glyphicon-remove" aria-hidden="true"></span></button>' +
                                            '<button rel="tooltip" title="Logs" class="btn btn-xs btn-warning btn-container-history"><span class="glyphicon glyphicon-book" aria-hidden="true"></span></button>' +
                                            '<button rel="tooltip" title="Terminal" class="btn btn-xs btn-default btn-container-open-terminal"><span class="glyphicon glyphicon-console" aria-hidden="true"></span></button>' +
                                        '</div>' +
                                    '</td>' +
                                '</tr>';
                    $('#containers-list tbody').append(html);
                }

                if(containersRunning == 0) {
                    $('#btn-containers-stats').hide();
                }
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
                    var html =  '<a title="View ' + item.name + ' versions" rel="tooltip" class="list-group-item" href="#">' +
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

                    var html =  '<a title="Install ' + config.image + ':' + item.name + '" rel="tooltip" class="list-group-item" href="#">' +
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

        $.post('/pull-image', {name: config.image, version: config.version}, function(data, textStatus, event) {
            wdtLoading.done();
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
     * Link
     */
    $('#form-image-run .btn-add-link').on('click', function () {
        var html = '<div class="link">' +
            '<div class="col-xs-5 text-center">' +
                '<input type="text" class="form-control local" placeholder="local" name="link-local[]" />' +
            '</div>' +
            '<div class="col-xs-1 text-center divisor"><span class="glyphicon glyphicon-transfer" aria-hidden="true"></span></div>' +
            '<div class="col-xs-5 text-center">' +
                '<input type="text" class="form-control docker" placeholder="docker" name="link-docker[]" />' +
            '</div>' +
            '<div class="col-xs-1 text-center">' +
                '<button class="btn btn-sm btn-danger btn-remove-link"><span class="glyphicon glyphicon-remove" aria-hidden="true"></span></button>' +
            '</div>';
        $('#form-image-run .list-links').append(html);
    });

    $('#form-image-run .list-links').on('click', '.btn-remove-link', function () {
        $(this).closest('.link').remove();
    });

    /**
     * Env
     */
    $('#form-image-run .btn-add-env').on('click', function () {
        var html = '<div class="env">' +
            '<div class="col-xs-5 text-center">' +
                '<input type="text" class="form-control param" placeholder="param" name="env-param[]" />' +
            '</div>' +
            '<div class="col-xs-1 text-center divisor"><span class="glyphicon glyphicon-transfer" aria-hidden="true"></span></div>' +
            '<div class="col-xs-5 text-center">' +
                '<input type="text" class="form-control value" placeholder="value" name="env-value[]" />' +
            '</div>' +
            '<div class="col-xs-1 text-center">' +
                '<button class="btn btn-sm btn-danger btn-remove-env"><span class="glyphicon glyphicon-remove" aria-hidden="true"></span></button>' +
            '</div>';
        $('#form-image-run .list-envs').append(html);
    });

    $('#form-image-run .list-envs').on('click', '.btn-remove-env', function () {
        $(this).closest('.env').remove();
    });

    /**
     * Open modal Run Image
     */
    var containerPresets = [];
    $('#images-list').on('click', '.btn-run-image', function () {
        var $parent = $(this).closest('.list-group-item');
        var imageId = $parent.data('image-id');

        $('#modal-run-image').modal('show');
        $('#form-image-run .list-ports .port').remove();
        $('#form-image-run .list-volumes .volume').remove();
        $('#form-image-run .list-links .link').remove();
        $('#form-image-run .list-envs .env').remove();

        $('#form-image-run .image-id').val(imageId);
        $('#form-image-run .input-name').val('');
        $('#form-image-run .name').text($parent.find('.name').text());
        $('#form-image-run .version').text($parent.find('.version').text());
        $('#form-image-run .initial-command').val('bash');

        $.getJSON('/container-presets', function(data, textStatus, event) {
            containerPresets = data;
            var total = 0;
            $('#container-preset-list').html('');
            for(i in containerPresets) {
                total++;
                var $li = $('<li title="Select ' + i + ' preset" rel="tooltip" class="container-preset-item"></li>');
                $li.data('container-preset-data', containerPresets[i]);
                $li.data('container-preset-name', i);
                $('#container-preset-list').append($li.append($('<a href="javascript:void(0)">' + i + '</a>')));
            }
            if(total > 0) {
                // $('#container-preset-list .divider').show();
            }
        });
    });

    /**
     * Add new container preset
     */
    $('#container-preset-list .container-preset-add').on('click', function () {
        // console.log("aeee", this);
    });
    /**
     * Select container preset
     */
    $('#container-preset-list').on('click', '.container-preset-item', function () {
        if($(this).hasClass('bg-success')) {
            $(this).removeClass('bg-success');
            var name = $(this).data('container-preset-name');
            var preset = $(this).data('container-preset-data');

            $('#form-image-run .list-ports .port[data-preset-name="' + name + '"]').remove();
            $('#form-image-run .list-volumes .volume[data-preset-name="' + name + '"]').remove();
            $('#form-image-run .list-links .link[data-preset-name="' + name + '"]').remove();
            $('#form-image-run .list-envs .env[data-preset-name="' + name + '"]').remove();
        } else {
            $(this).addClass('bg-success');
            var name = $(this).data('container-preset-name');
            var preset = $(this).data('container-preset-data');

            // SET CONTAINER-PRESETS.INI PARAMS
            if(preset.name) {
                $('#form-image-run .input-name').val(preset.name);
            }
            if(preset.command) {
                $('#form-image-run .initial-command').val(preset.command);
            }
            if(preset.terminal === true) {
                $('#terminal').prop('checked', true);
            }
            if(preset.terminal === false) {
                $('#terminal').prop('checked', false);
            }
            if(preset.interactive === true) {
                $('#interactive').prop('checked', true);
            }
            if(preset.interactive === false) {
                $('#interactive').prop('checked', false);
            }
            if(preset.background === true) {
                $('#background').prop('checked', true);
            }
            if(preset.background === false) {
                $('#background').prop('checked', false);
            }
            for(ports in preset.ports) {
                for(port in preset.ports[ports]) {
                    var _port = preset.ports[ports][port].split(':');
                    if($.trim(_port[0]).length > 0 && $.trim(_port[1]).length > 0) {
                        $('#form-image-run .btn-add-port').trigger('click');
                        $('#form-image-run .list-ports .port:last').attr('data-preset-name', name);
                        $('#form-image-run .list-ports .port:last .local').val(_port[0]);//.attr('readonly', true);
                        $('#form-image-run .list-ports .port:last .docker').val(_port[1]);//.attr('readonly', true);
                    }
                }
            }
            for(volumes in preset.volumes) {
                for(volume in preset.volumes[volumes]) {
                    var _volume = preset.volumes[volumes][volume].split(':');
                    if($.trim(_volume[0]).length > 0 && $.trim(_volume[1]).length > 0) {
                        $('#form-image-run .btn-add-volume').trigger('click');
                        $('#form-image-run .list-volumes .volume:last').attr('data-preset-name', name);
                        $('#form-image-run .list-volumes .volume:last .local').val(_volume[0]);//.attr('readonly', true);
                        $('#form-image-run .list-volumes .volume:last .docker').val(_volume[1]);//.attr('readonly', true);
                    }
                }
            }
            for(links in preset.links) {
                for(link in preset.links[links]) {
                    var _link = preset.links[links][link].split(':');
                    if($.trim(_link[0]).length > 0 && $.trim(_link[1]).length > 0) {
                        $('#form-image-run .btn-add-link').trigger('click');
                        $('#form-image-run .list-links .link:last').attr('data-preset-name', name);
                        $('#form-image-run .list-links .link:last .local').val(_link[0]);//.attr('readonly', true);
                        $('#form-image-run .list-links .link:last .docker').val(_link[1]);//.attr('readonly', true);
                    }
                }
            }
            for(envs in preset.envs) {
                for(env in preset.envs[envs]) {
                    var _env = preset.envs[envs][env].split(':');
                    if($.trim(_env[0]).length > 0 && $.trim(_env[1]).length > 0) {
                        $('#form-image-run .btn-add-env').trigger('click');
                        $('#form-image-run .list-envs .env:last').attr('data-preset-name', name);
                        $('#form-image-run .list-envs .env:last .param').val(_env[0]);//.attr('readonly', true);
                        $('#form-image-run .list-envs .env:last .value').val(_env[1]);//.attr('readonly', true);
                    }
                }
            }
            // GO TO THE FIRST TAB
            $('#form-image-run a[href="#run-image-ports"]').click();
        }
    });

    $('#modal-run-image .btn-run').on('click', function () {
        wdtLoading.start({
            'category': 'pulling-image'
        });

        $.post('/run-image', $('#form-image-run').serializeArray(), function(data, textStatus, event) {
            wdtLoading.done();
            if (event.status == 200) {
                $('.btn-view-containers').click();
                $('#btn-containers-refresh').trigger('click');

            }
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
     * Container play
     */
    $('#containers-list tbody').on('click', '.btn-container-play', function () {
        var containerId = $(this).closest('.container-item').data('image-id');
        $.post('/play-container', {containerId: containerId}, function(data, textStatus, event) {
            $('#btn-containers-refresh').trigger('click');
        });
    });

    /**
     * Container stop
     */
    $('#containers-list tbody').on('click', '.btn-container-stop', function () {
        var containerId = $(this).closest('.container-item').data('image-id');
        $.post('/stop-container', {containerId: containerId}, function(data, textStatus, event) {
            $('#btn-containers-refresh').trigger('click');
        });
    });

    /**
     * Container info
     */
    $('#containers-list tbody').on('click', '.btn-container-info', function () {
        var containerId = $(this).closest('.container-item').data('image-id');
        wdtLoading.start({
            'category': 'pulling-image'
        });
        $.post('/container-status',{'containerId':containerId}, function(data, textStatus, event) {
            wdtLoading.done();
            if(event.status == 200) {
                $('#modal-container-info .modal-body table tbody').html('');

                var portsString = '';
                for(var i in data.result.Config.ExposedPorts) {
                    portsString+= '<span class="label label-default">' + i + '</span> ';
                }

                // Create Datetime to pt-BR format
                var created = data.result.Created.replace('T', ' ').substr(0, 19).split(' ');
                created[0] = created[0].split('-').reverse().join('/');

                // Started Datetime to pt-BR format
                var started = data.result.State.StartedAt.replace('T', ' ').substr(0, 19).split(' ');
                started[0] = started[0].split('-').reverse().join('/');

                // Finished Datetime to pt-BR format
                var finished = data.result.State.FinishedAt.replace('T', ' ').substr(0, 19).split(' ');
                finished[0] = finished[0].split('-').reverse().join('/');
                if(finished[0] == '01/01/0001') {
                    finished = ['Running'];
                }

                var linksString = '';
                for(var i in data.result.HostConfig.Links) {
                    var link = data.result.HostConfig.Links[i].split(':');
                    link[0] = link[0].substr(1);
                    link[1] = link[1].replace(data.result.Name, '').substr(1);
                    linksString+= '<span class="label label-default">' + link[0] + '</span> <span aria-hidden="true" class="glyphicon glyphicon-transfer" style="top: 4px;"></span> <span class="label label-default">' + link[1] + '</span><br />';
                }
                if(linksString.length == 0) {
                    linksString = '-';
                }
                var volumesString = '';
                for(var i in data.result.Mounts) {
                    var volume = data.result.Mounts[i];
                    volumesString+= '<span class="label label-default">' + volume.Source + '</span> <span aria-hidden="true" class="glyphicon glyphicon-transfer" style="top: 4px;"></span> <span class="label label-default">' + volume.Destination + '</span><br />';
                }

                var statusString = '';
                var statusClass = 'label-default';
                var statusBgClass = 'label-default';
                switch(data.result.State.Status) {
                    case 'exited':
                        statusClass = 'label-warning';
                        statusBgClass = 'bg-warning';
                        statusString = 'Exited';
                        $('#modal-container-info .modal-body .panel-stats').hide();
                        $('#modal-container-info .modal-body .panel-top').hide();
                        $('#modal-container-info .modal-body .panel-network').hide();
                        $('#modal-container-info .modal-body .panel-stats .panel-body').html('');
                        console.log("sumir");
                        break;
                    case 'created':
                        statusClass = 'label-info';
                        statusBgClass = 'bg-info';
                        statusString = 'Created';
                        $('#modal-container-info .modal-body .panel-stats').hide();
                        $('#modal-container-info .modal-body .panel-top').hide();
                        $('#modal-container-info .modal-body .panel-network').hide();
                        $('#modal-container-info .modal-body .panel-stats .panel-body').html('');
                        break;
                    case 'running':
                        statusClass = 'label-success';
                        statusBgClass = 'bg-success';
                        statusString = 'Running';
                        $('#modal-container-info .modal-body .panel-stats').show();
                        $('#modal-container-info .modal-body .panel-top').show();
                        $('#modal-container-info .modal-body .panel-network').show();

                        wdtLoading.start({
                            'category': 'pulling-image'
                        });

                        // Top
                        $.post('/container-top',{'containerId':containerId}, function(dataTop, textStatus, event) {
                            var html = '';
                            for(var i in dataTop.result.Processes) {
                                var item = dataTop.result.Processes[i];
                                html+= '<tr>';
                                for(var j in item) {
                                    html+= '<td>' + item[j] + '</td>';
                                }
                                html+= '</tr>';
                            }
                            $('#modal-container-info .modal-body table.tb-container-top tbody').html(html);
                            var html = '<tr>';
                            for(var i in dataTop.result.Titles) {
                                var item = dataTop.result.Titles[i];
                                html+= '<th>' + item + '</th>';
                            }
                            html+= '</tr>';
                            $('#modal-container-info .modal-body table.tb-container-top thead').html(html);
                        });

                        var indicatorColors = [
                            '#00ff00',
                            '#fffd00',
                            '#ff000f',
                            '#0039ff',
                            '#0039ff',
                            '#fb00ff',
                            '#5B7AFF'
                        ];

                        K_GLOBAL.TIMER.CONTAINERSTATSCREATED = false;

                        var calculateCPUPercent = function(_lastCPU, _lastSystem, _cpu, _system, _processors) {
                            var percent = 0.0;
                            var cpuDelta = parseFloat(_cpu - _lastCPU);
                            var systemDelta = parseFloat(_system - _lastSystem);

                            if(cpuDelta > 0 && systemDelta > 0) {
                                percent = cpuDelta / systemDelta * parseFloat(_processors) * 100.0;
                            }

                            return percent / _processors;
                        };

                        var bytesToSize = function(bytes) {
                            var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
                            if (bytes == 0) return [0, sizes[0]];
                            var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
                            return [Math.round(bytes / Math.pow(1024, i), 2), sizes[i]];
                        };

                        var reloadTime = 3000;
                        var lastTotalCPU = 0;
                        var lastSystemCPU = 0;
                        var lastReceivedBytes = 0;
                        var lastTransmitBytes = 0;
                        var seriesProcessors, seriesNetworkReceived, seriesNetworkTransmit;

                        K_GLOBAL.TIMER.CONTAINERSTATS = function () {
                            $.post('/container-stats',{'containerId':containerId}, function(dataStats, textStatus, event) {
                                if(!K_GLOBAL.TIMER.CONTAINERSTATSCREATED) {
                                    wdtLoading.done();
                                    // Processors
                                    $('#modal-container-info .modal-body .panel-stats .panel-body').html($('<div id="chart-processors" style="min-width: 310px;height: 190px; margin: 0 auto;"></div>'));
                                    Highcharts.setOptions({
                                        global: {
                                            useUTC: false
                                        }
                                    });
                                    Highcharts.chart('chart-processors', {
                                        chart: {
                                            type: 'spline',
                                            animation: Highcharts.svg,
                                            marginRight: 10,
                                            events: {
                                                load: function() {
                                                    seriesProcessors = this.series[0];
                                                }
                                            }
                                        },
                                        title: {
                                            text: 'CPU Stats'
                                        },
                                        xAxis: {
                                            type: 'datetime',
                                            tickPixelInterval: 150
                                        },
                                        yAxis: {
                                            title: {
                                                text: 'Percent'
                                            },
                                            plotLines: [{
                                                value: 0,
                                                width: 1,
                                                color: '#808080'
                                            }]
                                        },
                                        tooltip: {
                                            formatter: function() {
                                                return '<b>' + this.series.name + '</b><br />' + Highcharts.dateFormat('%d/%m/%Y %H:%M:%S', this.x) + '<br />' + Highcharts.numberFormat(this.y, 3) + '%';
                                            }
                                        },
                                        plotOptions: {
                                            spline: {
                                                marker: {
                                                    enabled: true
                                                }
                                            }
                                        },
                                        legend: {
                                            enabled: true
                                        },
                                        exporting: {
                                            enabled: false
                                        },
                                        series: [{
                                            name: '% Used from CPU',
                                            data: (function() {
                                                var data = [];
                                                var time = (new Date()).getTime();
                                                var i;
                                                for(i = -50; i<=0; i++) {
                                                    data.push({
                                                        x: time + i * 1000,
                                                        y: 0
                                                    });
                                                }
                                                return data;
                                            }())
                                        }]
                                    });

                                    // Network
                                    $('#modal-container-info .modal-body .panel-network .panel-body').html($('<div id="chart-network" style="min-width: 310px;height: 190px; margin: 0 auto;"></div>'));
                                    Highcharts.setOptions({
                                        global: {
                                            useUTC: false
                                        }
                                    });
                                    Highcharts.chart('chart-network', {
                                        chart: {
                                            type: 'spline',
                                            animation: Highcharts.svg,
                                            marginRight: 10,
                                            events: {
                                                load: function() {
                                                    seriesNetworkReceived = this.series[0];
                                                    seriesNetworkTransmit = this.series[1];
                                                }
                                            }
                                        },
                                        title: {
                                            text: 'Network Stats'
                                        },
                                        xAxis: {
                                            type: 'datetime',
                                            tickPixelInterval: 150
                                        },
                                        yAxis: {
                                            title: {
                                                text: 'Bytes'
                                            },
                                            plotLines: [{
                                                value: 0,
                                                width: 1,
                                                color: '#808080'
                                            }]
                                        },
                                        tooltip: {
                                            formatter: function() {
                                                var y = bytesToSize(this.y);
                                                return '<b>' + this.series.name + '</b><br />' + Highcharts.dateFormat('%d/%m/%Y %H:%M:%S', this.x) + '<br />' + y[0] + y[1];
                                            }
                                        },
                                        plotOptions: {
                                            spline: {
                                                marker: {
                                                    enabled: true
                                                }
                                            }
                                        },
                                        legend: {
                                            enabled: true
                                        },
                                        exporting: {
                                            enabled: false
                                        },
                                        series: [{
                                            name: 'Received',
                                            data: (function() {
                                                var data = [];
                                                var time = (new Date()).getTime();
                                                var i;
                                                for(i = -50; i<=0; i++) {
                                                    data.push({
                                                        x: time + i * 1000,
                                                        y: 0
                                                    });
                                                }
                                                return data;
                                            }())
                                        }, {
                                            name: 'Transmit',
                                            data: (function() {
                                                var data = [];
                                                var time = (new Date()).getTime();
                                                var i;
                                                for(i = -50; i<=0; i++) {
                                                    data.push({
                                                        x: time + i * 1000,
                                                        y: 0
                                                    });
                                                }
                                                return data;
                                            }())
                                        }]
                                    });

                                    K_GLOBAL.TIMER.CONTAINERSTATSCREATED = true;
                                }

                                // Processors
                                var totalCPU = dataStats.result.cpu_stats.cpu_usage.total_usage;
                                var systemCPU = dataStats.result.cpu_stats.system_cpu_usage;
                                var processors = dataStats.result.cpu_stats.cpu_usage.percpu_usage.length;
                                var percent = 0.0;
                                if(lastTotalCPU > 0 && lastSystemCPU > 0) {
                                    percent = calculateCPUPercent(lastTotalCPU, lastSystemCPU, totalCPU, systemCPU, processors);
                                }
                                var x = (new Date()).getTime();
                                var y = percent;
                                seriesProcessors.addPoint([x, y], true, true);
                                $('#modal-container-info .modal-body .panel-stats .container-stats-cpu-realtime').text(Highcharts.numberFormat(percent, 3) + '%');
                                lastTotalCPU = totalCPU;
                                lastSystemCPU = systemCPU;

                                // Network
                                var receivedBytes = dataStats.result.networks['eth0'].rx_bytes;
                                var transmitBytes = dataStats.result.networks['eth0'].tx_bytes;
                                var totalBytesReceived = lastReceivedBytes == 0 ? 0 : receivedBytes - lastReceivedBytes;
                                var totalBytesTransmit = lastTransmitBytes == 0 ? 0 : transmitBytes - lastTransmitBytes;

                                var x = (new Date()).getTime();
                                var y = totalBytesReceived;
                                seriesNetworkReceived.addPoint([x, y], true, true);
                                var size = bytesToSize(totalBytesReceived);
                                $('#modal-container-info .modal-body .panel-network .container-stats-network-realtime').text(size[0] + ' ' + size[1]);
                                var x = (new Date()).getTime();
                                var y = totalBytesTransmit;
                                seriesNetworkTransmit.addPoint([x, y], true, true);
                                var size = bytesToSize(totalBytesTransmit);
                                $('#modal-container-info .modal-body .panel-network .container-stats-network-realtime').append(' / ' + size[0] + ' ' + size[1]);

                                lastReceivedBytes = receivedBytes;
                                lastTransmitBytes = transmitBytes;
                            });
                        };
                        K_GLOBAL.TIMER.CONTAINERSTATS();
                        K_GLOBAL.TIMER.CONTAINERSTATSINTERVAL = setInterval(K_GLOBAL.TIMER.CONTAINERSTATS, reloadTime);
                        break;
                }

                $('#modal-container-info .status-info')
                    .html(statusString)
                    .removeClass('label-warning')
                    .removeClass('label-info')
                    .removeClass('label-success')
                    .addClass(statusClass);

                $('#modal-container-info .modal-header, #modal-container-info .modal-footer')
                    .removeClass('bg-warning')
                    .removeClass('bg-info')
                    .removeClass('bg-success')
                    .addClass(statusBgClass);

                $('#modal-container-info .container-name').html(data.result.Name.substr(1) + ' - Info');

                var html = '<tr><td width="130">Image</td><td>' + data.result.Config.Image + '</td></tr>';
                html+= '<tr><td>Name</td><td>' + data.result.Name.substr(1) + '</td></tr>';
                html+= '<tr><td>Initial Command</td><td>' + data.result.Config.Cmd.join(', ') + '</td></tr>';
                html+= '<tr><td>Started at</td><td>' + started.join(' ') + '</td></tr>';
                html+= '<tr><td>Finished at</td><td>' + finished.join(' ') + '</td></tr>';
                html+= '<tr><td>Env Params</td><td>' + data.result.Config.Env.join('<br />') + '</td></tr>';
                html+= '<tr><td>Ports Exposed</td><td>' + portsString + '</td></tr>';
                html+= '<tr><td>Terminal</td><td>' + data.result.Config.Tty + '</td></tr>';
                html+= '<tr><td>Created on</td><td>' + created.join(' ') + '</td></tr>';
                html+= '<tr><td>Volumes</td><td>' + volumesString + '</td></tr>';
                html+= '<tr><td>Links</td><td>' + linksString + '</td></tr>';
                $('#modal-container-info .modal-body table.tb-container-info tbody').html(html);
                $('#modal-container-info').modal('show');
            }
        });
    });

    $('#modal-container-info').on('hide.bs.modal', function() {
        clearInterval(K_GLOBAL.TIMER.CONTAINERSTATSINTERVAL);
        $('#modal-container-info .modal-body .panel-stats').hide();
        $('#modal-container-info .modal-body .panel-top').hide();
        $('#modal-container-info .modal-body .panel-network').hide();
        $('#modal-container-info .modal-body .panel-stats .panel-body').html('');
    });

    $('#btn-containers-stats').on('click', function() {
        $('#modal-containers-stats').modal('show');
        $.getJSON('/list-containers', function(data, textStatus, event) {
            wdtLoading.start({
                'category': 'pulling-image'
            });

            var ids = [];
            for(var i = 0, l = data.result.length; i < l; i++) {
                var item = data.result[i];
                switch(item.State) {
                    case 'running':
                        ids.push(item.Id);
                        break;
                }
            }

            K_GLOBAL.TIMER.ALLCONTAINERSTATSCREATED = false;

            var calculateCPUPercent = function(_lastCPU, _lastSystem, _cpu, _system, _processors) {
                var percent = 0.0;
                var cpuDelta = parseFloat(_cpu - _lastCPU);
                var systemDelta = parseFloat(_system - _lastSystem);

                if(cpuDelta > 0 && systemDelta > 0) {
                    percent = cpuDelta / systemDelta * parseFloat(_processors) * 100.0;
                }

                return percent / _processors;
            };

            var bytesToSize = function(bytes) {
                var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
                if (bytes == 0) return [0, sizes[0]];
                var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
                return [Math.round(bytes / Math.pow(1024, i), 2), sizes[i]];
            };

            var reloadTime = 4000;
            var lastTotalCPU = {};
            var lastSystemCPU = {};
            var lastReceivedBytes = {};
            var lastTransmitBytes = {};
            var seriesProcessors = {}, seriesNetworkReceived = {}, seriesNetworkTransmit = {};
            K_GLOBAL.TIMER.ALLCONTAINERSTATS = function () {
                $.post('/container-stats-by-ids', {'ids': ids}, function (dataStats, textStatus, event) {
                    if(!K_GLOBAL.TIMER.ALLCONTAINERSTATSCREATED) {
                        wdtLoading.done();
                        $('#modal-containers-stats .modal-body').html('');
                        for(var i = 0, l = dataStats.length; i < l; i++) {
                            var id = dataStats[i].id;
                            var item = dataStats[i].data.result;
                            var $tr = $('#containers-list tbody tr[data-image-id=' + id + ']');
                            var name = $tr.find('.container-name').text();

                            var panelContainer =
                                '<div class="panel panel-success panel-container" data-container-id="'+ id +'">' +
                                    '<div class="panel-heading">' + name + '' +
                                        '<div class="pull-right">' +
                                            '<span class="label label-default margin-right">Network: <span class="container-stats-network-realtime"></span></span>' +
                                            '<span class="label label-info">CPU: <span class="container-stats-cpu-realtime"></span></span>' +
                                        '</div>' +
                                    '</div>' +
                                    '<div class="panel-body">' +
                                        '<div class="col-xs-6 stats">' +
                                            '<div id="chart-processors-' + id + '" style="min-width: 310px;height: 180px; margin: 0 auto;"></div>' +
                                        '</div>' +
                                        '<div class="col-xs-6 network">' +
                                            '<div id="chart-network-' + id + '" style="min-width: 310px;height: 180px; margin: 0 auto;"></div>' +
                                        '</div>' +
                                    '</div>' +
                                '</div>';

                            $('#modal-containers-stats .modal-body').append(panelContainer);

                            // Processors
                            Highcharts.setOptions({
                                global: {
                                    useUTC: false
                                }
                            });
                            Highcharts.chart('chart-processors-' + id, {
                                chart: {
                                    type: 'spline',
                                    animation: Highcharts.svg,
                                    marginRight: 10,
                                    events: {
                                        load: function() {
                                            seriesProcessors[id] = this.series[0];
                                        }
                                    }
                                },
                                title: {
                                    text: 'CPU Stats'
                                },
                                xAxis: {
                                    type: 'datetime',
                                    tickPixelInterval: 150
                                },
                                yAxis: {
                                    title: {
                                        text: 'Percent'
                                    },
                                    plotLines: [{
                                        value: 0,
                                        width: 1,
                                        color: '#808080'
                                    }]
                                },
                                tooltip: {
                                    formatter: function() {
                                        return '<b>' + this.series.name + '</b><br />' + Highcharts.dateFormat('%d/%m/%Y %H:%M:%S', this.x) + '<br />' + Highcharts.numberFormat(this.y, 3) + '%';
                                    }
                                },
                                plotOptions: {
                                    spline: {
                                        marker: {
                                            enabled: true
                                        }
                                    }
                                },
                                legend: {
                                    enabled: true
                                },
                                exporting: {
                                    enabled: false
                                },
                                series: [{
                                    name: '% Used from CPU',
                                    data: (function() {
                                        var data = [];
                                        var time = (new Date()).getTime();
                                        var i;
                                        for(i = -15; i<=0; i++) {
                                            data.push({
                                                x: time + i * 1000,
                                                y: 0
                                            });
                                        }
                                        return data;
                                    }())
                                }]
                            });

                            // Network
                            Highcharts.chart('chart-network-' + id, {
                                chart: {
                                    type: 'spline',
                                    animation: Highcharts.svg,
                                    marginRight: 10,
                                    events: {
                                        load: function() {
                                            seriesNetworkReceived[id] = this.series[0];
                                            seriesNetworkTransmit[id] = this.series[1];
                                        }
                                    }
                                },
                                title: {
                                    text: 'Network Stats'
                                },
                                xAxis: {
                                    type: 'datetime',
                                    tickPixelInterval: 100
                                },
                                yAxis: {
                                    title: {
                                        text: 'Bytes'
                                    },
                                    plotLines: [{
                                        value: 0,
                                        width: 1,
                                        color: '#808080'
                                    }]
                                },
                                tooltip: {
                                    formatter: function() {
                                        var y = bytesToSize(this.y);
                                        return '<b>' + this.series.name + '</b><br />' + Highcharts.dateFormat('%d/%m/%Y %H:%M:%S', this.x) + '<br />' + y[0] + y[1];
                                    }
                                },
                                plotOptions: {
                                    spline: {
                                        marker: {
                                            enabled: true
                                        }
                                    }
                                },
                                legend: {
                                    enabled: true
                                },
                                exporting: {
                                    enabled: false
                                },
                                series: [{
                                    name: 'Received',
                                    data: (function() {
                                        var data = [];
                                        var time = (new Date()).getTime();
                                        var i;
                                        for(i = -15; i<=0; i++) {
                                            data.push({
                                                x: time + i * 1000,
                                                y: 0
                                            });
                                        }
                                        return data;
                                    }())
                                }, {
                                    name: 'Transmit',
                                    data: (function() {
                                        var data = [];
                                        var time = (new Date()).getTime();
                                        var i;
                                        for(i = -15; i<=0; i++) {
                                            data.push({
                                                x: time + i * 1000,
                                                y: 0
                                            });
                                        }
                                        return data;
                                    }())
                                }]
                            });
                        }

                        K_GLOBAL.TIMER.ALLCONTAINERSTATSCREATED = true;
                    }

                    for(var i = 0, l = dataStats.length; i < l; i++) {
                        var id = dataStats[i].id;
                        var item = dataStats[i].data.result;

                        if(!lastTotalCPU[id]) {
                            lastTotalCPU[id] = 0;
                        }
                        if(!lastSystemCPU[id]) {
                            lastSystemCPU[id] = 0;
                        }
                        if(!lastReceivedBytes[id]) {
                            lastReceivedBytes[id] = 0;
                        }
                        if(!lastTransmitBytes[id]) {
                            lastTransmitBytes[id] = 0;
                        }

                        // CPU
                        var totalCPU = item.cpu_stats.cpu_usage.total_usage;
                        var systemCPU = item.cpu_stats.system_cpu_usage;
                        var processors = item.cpu_stats.cpu_usage.percpu_usage.length;
                        var percent = 0.0;
                        if (lastTotalCPU[id] > 0 && lastSystemCPU[id] > 0) {
                            percent = calculateCPUPercent(lastTotalCPU[id], lastSystemCPU[id], totalCPU, systemCPU, processors);
                        }
                        var x = (new Date()).getTime();
                        var y = percent;
                        seriesProcessors[id].addPoint([x, y], true, true);
                        $('#modal-containers-stats .modal-body .panel[data-container-id="' + id + '"] .container-stats-cpu-realtime').text(Highcharts.numberFormat(percent, 3) + '%');
                        // container-stats-cpu-realtime
                        lastTotalCPU[id] = totalCPU;
                        lastSystemCPU[id] = systemCPU;

                        // Network
                        var receivedBytes = item.networks['eth0'].rx_bytes;
                        var transmitBytes = item.networks['eth0'].tx_bytes;
                        var totalBytesReceived = (!lastReceivedBytes[id] || lastReceivedBytes[id] == 0) ? 0 : receivedBytes - lastReceivedBytes[id];
                        var totalBytesTransmit = (!lastTransmitBytes[id] || lastTransmitBytes[id] == 0) ? 0 : transmitBytes - lastTransmitBytes[id];

                        var x = (new Date()).getTime();
                        var y = totalBytesReceived;
                        seriesNetworkReceived[id].addPoint([x, y], true, true);
                        var size = bytesToSize(totalBytesReceived);
                        $('#modal-containers-stats .modal-body .panel[data-container-id="' + id + '"] .container-stats-network-realtime').text(size[0] + ' ' + size[1]);
                        var x = (new Date()).getTime();
                        var y = totalBytesTransmit;
                        seriesNetworkTransmit[id].addPoint([x, y], true, true);
                        var size = bytesToSize(totalBytesTransmit);
                        $('#modal-containers-stats .modal-body .panel[data-container-id="' + id + '"] .container-stats-network-realtime').append(' / ' + size[0] + ' ' + size[1]);

                        lastReceivedBytes[id] = receivedBytes;
                        lastTransmitBytes[id] = transmitBytes;
                    }
                });
            };
            K_GLOBAL.TIMER.ALLCONTAINERSTATS();
            K_GLOBAL.TIMER.ALLCONTAINERSTATSINTERVAL = setInterval(K_GLOBAL.TIMER.ALLCONTAINERSTATS, reloadTime);
        });

    });

    $('#modal-containers-stats').on('hide.bs.modal', function() {
        clearInterval(K_GLOBAL.TIMER.ALLCONTAINERSTATSINTERVAL);
    });

    /**
     * Container remove
     */
    $('#containers-list tbody').on('click', '.btn-container-remove', function () {
        var containerId = $(this).closest('.container-item').data('image-id');
        $.post('/container-remove',{'containerId':containerId}, function(data, textStatus, event) {
            if (event.status == 200) {
                $('#btn-containers-refresh').trigger('click');
            }
        });
    });

    /**
     * Container history
     */
    $('#containers-list tbody').on('click', '.btn-container-history', function () {
        var containerId = $(this).closest('.container-item').data('image-id');
        var that = this;
        wdtLoading.start({
            'category': 'pulling-image'
        });
        $.post('/container-logs',{'containerId':containerId}, function(data, textStatus, event) {
            wdtLoading.done();
            if (event.status == 200) {

                $('#modal-container-log .modal-body table tbody').html('');
                var name = $(that).parents('.container-item').find('.container-name').text();
                $('#modal-container-log .container-name').text(name + ' - Logs');

                var html = '';
                for(var i in data.result) {
                    var item = data.result[i];
                    var statusString = '';
                    var statusClass = '';
                    var statusBgClass = '';
                    switch(item.Kind) {
                        case 0:
                            statusString = 'Modified';
                            statusClass = 'label-warning';
                            statusBgClass = 'warning';
                            break;
                        case 1:
                            statusString = 'Added';
                            statusClass = 'label-success';
                            statusBgClass = 'success';
                            break;
                        case 2:
                            statusString = 'Deleted';
                            statusClass = 'label-danger';
                            statusBgClass = 'danger';
                            break;
                    }
                    html+= '<tr class="' + statusBgClass + '"><td>' + item.Path + '<span class="label label-right ' + statusClass + '">' + statusString + '</span></td></tr>';
                }

                $('#modal-container-log .modal-body table tbody').html(html);
                $('#modal-container-log').modal('show');
            }
        });
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