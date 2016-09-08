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

    $('#tb-add-image-list-search').on('click', 'tbody tr td a', function () {
        config.image = $(this).text();
        
        $('#tb-add-image-list-search').hide();
        $('#tb-add-image-list-tags-search').html('').show();
        
        wdtLoading.start({
            'category': 'pulling-image'
        });
        
        $.post('/list-image-tags', {name: $(this).text()}, function(data, textStatus, event) {
            data = data.trim().substring(1, data.length - 1).trim().split("\\n");
            for(var i=0,l=data.length;i<l;i++) {
                if(!data[i].trim()) {
                    continue;
                }
                $('#tb-add-image-list-tags-search').append('<li class="list-group-item"><a href="#">' + data[i] + '</a></li>');
            }
            // if($('#tb-add-image-list-tags-search li').length == 0) {
            //     $('#tb-add-image-list-tags-search').append('<li class="list-group-item"><a href="#">latest</a></li>');
            // }
            wdtLoading.done();
        });
    });

    $('#tb-add-image-list-tags-search').on('click', 'a', function () {
        config.version = $(this).text();
        $('#modal-add-image').modal('hide');
        
        var n = noty({
            layout: 'top',
            type: 'warning',
            closeWith: [],
            text: 'Pulling image ' + config.image + '...',
            animation: {
                open: 'animated slideInDown',
                close: 'animated slideOutUp',
                easing: 'swing',
                speed: 500
            }
        });
        $.post('/pull-image', {name: config.image, version: config.version}, function(data, textStatus, event) {
            $('.list-images').trigger('click');
            n.close();
            
            noty({
                layout: 'center',
                type: 'success',
                text: data.trim().split("\n").pop().split(":", 2)[1].trim(),
                animation: {
                    open: 'animated flipInX',
                    close: 'animated flipOutX',
                    easing: 'swing',
                    speed: 500
                }
            });
        });
    });

    $('#btn-image-search').on('click', function () {
        if($('#btn-image-search-loading').is(':visible')) {
            return;
        }

        wdtLoading.start({
            'category': 'pulling-image'
        });

        $('#btn-image-search').hide();
        $('#btn-image-search-loading').show();
        var name = $('#form-image-search').serializeArray()[0].value;
        
        $.post('/search-image', {name: name}, function(data, textStatus, event) {
            $('#btn-image-search').show();
            $('#btn-image-search-loading').hide();

            // @TODO Somente se tiver resultado
            $('#tb-add-image-list-search').show();
            $('#tb-add-image-list-search tbody').html('');

            data = data.trim().split("\\n");
            if(data.length > 1) {
                for (var i = 1, l = data.length; i < l; i++) {
                    var linha = data[i].trim().split(/\s+/);
                    if (linha.length > 1) {
                        var repo = linha.shift();
                        var official = linha.pop();
                        var stars = linha.pop();
                        var desc = linha.join(' ');
                        $('#tb-add-image-list-search').append('<tr class="text-center"><td><a href="#">' + repo + '</a></td><td>' + desc + '</td><td><span class="badge">' + stars + '</span></td></tr>')
                    }
                }
            }

            wdtLoading.done();
        });
    });

    /**
     * List server info and show
     */
    $('#btn-server-status-refresh').on('click', function () {
        $('#server-status').html('');
        $.getJSON('/server-status', function(data, textStatus, event) {
            initialLoads.loaded();
            data = data.split("\n");
            for(var i=0,l=data.length;i<l;i++) {
                var item = data[i].split(':', 2);
                if(item[1]) {
                    var html = '<li class="list-group-item">' + item[0].trim() + ' <span class="badge">' + item[1].trim() + '</span></li>';
                    $('#server-status').append(html);
                }
            }
        });
    }).trigger('click');

    /**
     * List all images then update list
     */
    $('.list-images').on('click', function() {
        $.getJSON('/list-images', function(data, textStatus, event) {
            initialLoads.loaded();
            if(event.status == 200) {
                $('#debug').text(data);
                data = data.trim().split('\n');

                $('#images-list').html('');
                if(data.length > 1) {
                    for(var i=1,l=data.length;i<l;i++) {
                        var linha = data[i].split(/\s+/);
                        if(linha.length > 1) {
                            var name = linha.shift();
                            var version = linha.shift();
                            var imageId = linha.shift();

                            var size1 = linha.pop();
                            var size2 = linha.pop();
                            var size = size2 + ' ' + size1;

                            $('#images-list').append('<li class="list-group-item" data-image-id="' + imageId + '"><span class="name">' + name + '</span> <span class="label label-warning version">' + version + '</span> <span class="label label-default">' + size + '</span> <span class="label label-info">' + linha.join(' ') + '</span><div class="btn-group pull-right" role="group"><button type="button" class="btn btn-xs btn-primary btn-run-image">Run</button><button type="button" class="btn btn-xs btn-warning btn-rename-image">Rename</button><button type="button" class="btn btn-xs btn-danger btn-remove-image">Remove</button></div></li>');
                        }
                    }
                } else {
                    $('#images-list').html('<span>You dont have pulled any docker images yet.</span>')
                }
            }
        });
    }).trigger('click');

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
                            $('.list-images').trigger('click');
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
     * List all running containers
     */
    $('.list-containers').on('click', function() {
        $.getJSON('/list-containers', function(data, textStatus, event) {
            initialLoads.loaded();
            $('#containers-list tbody').html('');
            data = data.trim();

            if(event.status == 200) {
                if(data.length == 0) {
                    $('#containers-list-none').show();
                    $('#containers-list').hide();
                    return;
                } else {
                    $('#containers-list-none').hide();
                    $('#containers-list').show();
                }
                
                var containers = data.split("\n");
                for(var i=0,l=containers.length;i<l;i++) {
                    var container = containers[i].trim().split('|');

                    var html = '<tr class="container-item" data-image-id="' + container[0] + '">' +
                        '<td class="text-center">' + container[0] + '</td>' +
                        '<td class="text-center">' + container[1] + '</td>' +
                        '<td>' + container[2] + '</td>' +
                        '<td>' + container[3] + '</td>' +
                        '<td class="text-center">' + container[4] + '</td>' +
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
            console.log($('#terminal_' + containerId));
            return;
        }

        var $terminal = $('<div class="terminal-item" id="terminal_' + containerId + '" data-container-id="' + containerId + '">' + containerId + '</div>');
        $('#terminal-bar').append($terminal);

        $terminal.dockmodal({
            showPopout: false,
            title: containerId
            // initialState: "minimized"
        });
        
        console.log($(this), containerId);
    });

    
});