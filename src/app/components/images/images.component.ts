import {Component, OnInit, ViewChild} from '@angular/core';
import {DockerService} from "../../services/docker.service";
import 'rxjs/Rx';
import {toast} from "angular2-materialize";

declare let $: any;
declare let jQuery: any;

@Component({
    selector: 'dm-images',
    templateUrl: './images.component.html',
    styleUrls: ['./images.component.scss'],
})
export class ImagesComponent implements OnInit {
    
    inputs: any;
    images: any[];
    imagesResultedFromDockerHub: any[];
    imageToPull: string = '';
    tagsToPull: any[];
    imageToRun: any;

    constructor(private dockerService: DockerService) {
        this.images = new Array();
        this.imagesResultedFromDockerHub = new Array();
        this.tagsToPull = new Array();
        this.imageToRun = {
            name: '',
            image: '',
            tty: false,
            interactive: false,
            ports: [],
            volumes: [],
            envs: []
        };
        this.inputs = {
            portPublic: '',
            portPrivate: '',
            volumePublic: '',
            volumePrivate: '',
            envName: '',
            envValue: ''
        }
    }

    ngOnInit() {
        var self = this;
        $(function () {
            $('#modal-search').modal({
                    dismissible: true,
                    opacity: .3,
                    inDuration: 300,
                    outDuration: 200,
                    startingTop: '4%',
                    endingTop: '10%',
                    ready: function (modal, trigger) {
                        $('#term').focus();
                    },
                    complete: function () {
                        self.imagesResultedFromDockerHub = new Array();
                    }
                }
            );
            $('#modal-confirm').modal({
                    dismissible: true,
                    opacity: .3,
                    inDuration: 300,
                    outDuration: 200,
                    startingTop: '4%',
                    endingTop: '10%',
                    ready: function (modal, trigger) {
                    },
                    complete: function () {
                    }
                }
            );
            $('#modal-run-container').modal({
                    dismissible: true,
                    opacity: .3,
                    inDuration: 300,
                    outDuration: 200,
                    startingTop: '4%',
                    endingTop: '10%',
                    ready: function (modal, trigger) {
                    },
                    complete: function () {
                    }
                }
            );
        });

        this.updateImages();
    }

    info(image) {
        this.dockerService.imageInfo(image.Id).subscribe(info => {
            image.info = info;
            console.log('info', info);
        });
    }

    askCreateContainer(image) {
        $('#name').focus();
        $('#modal-run-container').modal('open');
        this.imageToRun = {
            name: '',
            image: image.RepoTags[0],
            tty: false,
            interactive: false,
            ports: [],
            volumes: [],
            envs: []
        };
        // this.imageToRun.image = image.RepoTags[0];
    }

    search() {
        let term = $('#term').val();
        this.dockerService.imageSearch(term).subscribe(images => {
            this.imagesResultedFromDockerHub = images;
        });
    }

    askPullFromSearch(image) {
        this.imageToPull = image;
        $('#modal-confirm').modal('open');
        this.dockerService.imageSearchTags(image.name).subscribe(tags => {
            this.tagsToPull = tags;
        });
    }

    pull(name, tag) {
        $('#modal-confirm').modal('close');
        $('#modal-search').modal('close');
        $('.progress').show();

        this.dockerService.imageCreate(name, tag).subscribe(result => {
            let _json = JSON.parse(('{"result":[' + result.text().replace(/(?:\r\n|\r|\n)/g, ',') + ']}').replace('},]', '}]'));
            _json.result.reverse();
            let html = '';
            for(let i in _json.result) {
                let log = _json.result[i];
                html+= log.status + '<br />';
            }
            $('.progress').hide();
            toast(html, 5000);
            this.updateImages();
        });
    }

    updateImages() {
        this.dockerService.images().subscribe(images => {
            this.images = images;
            console.log(images);
        });
    }
    
    addPort() {
        if(!this.inputs.portPublic || !this.inputs.portPrivate) {
            return;
        }
        this.imageToRun.ports.push({public: this.inputs.portPublic, private: this.inputs.portPrivate});
        this.inputs.portPublic = '';
        this.inputs.portPrivate = '';
    }
    
    addVolume() {
        if(!this.inputs.volumePublic || !this.inputs.volumePrivate) {
            return;
        }
        this.imageToRun.volumes.push({public: this.inputs.volumePublic, private: this.inputs.volumePrivate});
        this.inputs.volumePublic = '';
        this.inputs.volumePrivate = '';
    }

    addEnv() {
        if(!this.inputs.envName || !this.inputs.envValue) {
            return;
        }
        this.imageToRun.envs.push({name: this.inputs.envName, value: this.inputs.envValue});
        this.inputs.envName = '';
        this.inputs.envValue = '';
    }
    
    create() {
        console.log(this.imageToRun);
    }
    
    createAndRun() {
        console.log(this.imageToRun);
    }

}
