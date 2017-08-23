import {Injectable} from '@angular/core';
import {Http} from '@angular/http';
import {Subject, Observable} from 'rxjs/Rx';
import {dialog} from 'electron';
import 'rxjs/Rx';
import 'rxjs/add/observable/fromPromise';
import * as Dockerode from "dockerode";

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
    
    // List all images
    images() {
        return Observable.fromPromise(this.docker.listImages({all: true}));
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
    
}