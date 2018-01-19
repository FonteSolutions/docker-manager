import {Injectable} from '@angular/core';
import {Http} from '@angular/http';
import {Subject, Observable} from 'rxjs/Rx';
import {dialog} from 'electron';
import 'rxjs/Rx';
import 'rxjs/add/observable/fromPromise';
import * as Dockerode from 'dockerode';

@Injectable()
export class DockerService {

    public docker: Dockerode;
    public url: any = {
        imageSearchTags: 'https://registry.hub.docker.com/v1/repositories/{name}/tags' // GET
    };

    constructor(private _http: Http) {
        let electron = require('electron');
        const app = electron.remote.app;
        this.docker = app['docker'];
    }

    // System version
    version() {
        return Observable.fromPromise(this.docker.version());
    }

    // System info
    info() {
        return Observable.fromPromise(this.docker.info());
    }

    // List all images
    images() {
        return Observable.fromPromise(this.docker.listImages({all: false}));
    }

    // Inspect image
    imageInfo(name) {
        return Observable.fromPromise(this.docker.getImage(name).inspect());
    }

    // Search images on DockerHub
    imageSearch(term) {
        return Observable.fromPromise(this.docker.searchImages({term: term}));
    }

    // Search image tags
    imageSearchTags(name) {
        let url = this.url.imageSearchTags.replace('{name}', name);
        return this._http.get(url).map(tags => tags.json());
    }

    // Pull Image
    imageCreate(name, tag, onSuccess, onProgress) {
        var self = this;
        return this.docker.createImage({fromImage: name, tag: tag}, (err, stream) => {
            self.docker.modem.followProgress(stream, onSuccess, onProgress);
        });
    }

    // Image Create
    imageRun(imageData) {
        let hostConfig = {
            'PortBindings': {},
            'Binds': []
        };
        let exposedPorts = {};
        for (let i in imageData.ports) {
            exposedPorts[imageData.ports[i].public + '/tcp'] = {};
            hostConfig.PortBindings[imageData.ports[i].public + '/tcp'] = [{'HostPort': imageData.ports[i].private}];
        }
        let envs = [];
        for (let i in imageData.envs) {
            envs.push(imageData.envs[i].name + '=' + imageData.envs[i].value);
        }
        let volumes = {};
        for (let i in imageData.volumes) {
            hostConfig.Binds.push(imageData.volumes[i].private + ':' + imageData.volumes[i].public);
        }

        const opts = {
            name: imageData.name,
            Image: imageData.image,
            Cmd: imageData.cmd,
            Tty: imageData.tty,
            AttachStdin: true,
            AttachStdout: true,
            AttachStderr: true,
            OpenStdin: true,
            StdinOnce: true,
            ExposedPorts: exposedPorts,
            Env: envs,
            HostConfig: hostConfig,
            Volumes: volumes
        };

        return Observable.fromPromise(this.docker.createContainer(opts));
    }

    // List all containers
    containers() {
        return Observable.fromPromise(this.docker.listContainers({all: true}));
    }

    // Start container
    containerStart(container) {
        return Observable.fromPromise(this.docker.getContainer(container).start());
    }

    // Pause container
    containerPause(container) {
        return Observable.fromPromise(this.docker.getContainer(container).pause());
    }

    // Resume container
    containerResume(container) {
        return Observable.fromPromise(this.docker.getContainer(container).unpause());
    }

    // Stop container
    containerStop(container) {
        return Observable.fromPromise(this.docker.getContainer(container).stop());
    }

    // Inspect container
    containerInfo(container) {
        return Observable.fromPromise(this.docker.getContainer(container).inspect());
    }

    // Remove container
    containerRemove(container) {
        return Observable.fromPromise(this.docker.getContainer(container).remove());
    }

    // Container attach
    containerAttach(container) {
        return Observable.fromPromise(this.docker.getContainer(container.Id).attach({logs: false, stream: true, stdin: true, stdout: true, stderr: false}));
    }

}
