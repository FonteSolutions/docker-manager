import {ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, ViewChild} from '@angular/core';
import {toast} from "angular2-materialize";
import 'rxjs/Rx';
import {DockerService} from "../../services/docker.service";
import {Router} from "@angular/router";
// import * as Dockerode from "dockerode";

declare let $: any;
declare let jQuery: any;

@Component({
    selector: 'dm-images',
    // changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './images.component.html',
    styleUrls: ['./images.component.scss'],
})
export class ImagesComponent implements OnInit {
    
    inputs: any;
    images: any[];
    imageSearchParams: any;
    imagesResultedFromDockerHub: any[];
    imageToPull: string = '';
    tagsToPull: any[];
    imageToRun: any;
    
    constructor(private dockerService: DockerService,
                private ref: ChangeDetectorRef,
                private router: Router) {
        this.images = new Array();
        this.imagesResultedFromDockerHub = new Array();
        this.tagsToPull = new Array();
        this.imageToRun = {
            name: '',
            image: '',
            cmd: '',
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
        };
        this.imageSearchParams = {term: '', limit: null};
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
        });
    }
    
    askCreateContainer(image) {
        $('#name').focus();
        $('#modal-run-container').modal('open');
        this.imageToRun = {
            name: '',
            cmd: '/bin/bash',
            image: image.RepoTags[0],
            tty: true,
            ports: [{private: '80', public: '80'}, {private: '443', public: '443'}],
            volumes: [{private: '/home/fontenele/Documents/www/', public: '/var/www/html/'}],
            envs: []
        };
    }
    
    search() {
        this.dockerService.imageSearch(this.imageSearchParams.term).subscribe(images => {
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
        this.dockerService.imageCreate(name, tag,
            (err, output) => {
                this.updateImages();
                toast(`Image ${name} pulled with success.`, 5000);
                $('.progress').hide();
            },
            event => {
                toast(event.status, 200);
            }
        );
    }
    
    updateImages() {
        this.dockerService.images().subscribe(images => {
            this.images = images;
            // this.ref.detach();
            this.ref.detectChanges();
        });
    }
    
    addPort() {
        if (!this.inputs.portPublic || !this.inputs.portPrivate) {
            return;
        }
        this.imageToRun.ports.push({public: this.inputs.portPublic, private: this.inputs.portPrivate});
        this.inputs.portPublic = '';
        this.inputs.portPrivate = '';
    }
    
    addVolume() {
        if (!this.inputs.volumePublic || !this.inputs.volumePrivate) {
            return;
        }
        this.imageToRun.volumes.push({public: this.inputs.volumePublic, private: this.inputs.volumePrivate});
        this.inputs.volumePublic = '';
        this.inputs.volumePrivate = '';
    }
    
    addEnv() {
        if (!this.inputs.envName || !this.inputs.envValue) {
            return;
        }
        this.imageToRun.envs.push({name: this.inputs.envName, value: this.inputs.envValue});
        this.inputs.envName = '';
        this.inputs.envValue = '';
    }
    
    create() {
        this.dockerService.imageRun(this.imageToRun).subscribe(container => {
            $('#modal-run-container').modal('close');
            toast('Container created with success', 3000);
            this.router.navigate(['/containers']);
        }, error => {
            toast(error);
        });
    }
    
    createAndRun() {
        this.dockerService.imageRun(this.imageToRun).subscribe(container => {
            toast('Container created with success', 3000);
            this.dockerService.containerStart(container.id).subscribe(container => {
                $('#modal-run-container').modal('close');
                toast('Container started with success', 3000);
                this.router.navigate(['/containers']);
            });
        }, error => {
            toast(error);
        });
    }
    
}
