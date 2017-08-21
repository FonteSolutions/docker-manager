import {Injectable} from '@angular/core';
import {Http} from '@angular/http';
import {Subject, Observable} from 'rxjs/Rx';
import {dialog} from 'electron';
import 'rxjs/Rx';

@Injectable()
export class DockerService {

    public pingStream: Subject<number> = new Subject<number>();
    private _pingSeconds: number = 5;

    public statusText: string = '';
    public status: boolean = false;

    public endpoint: string = 'http://localhost:2375';
    public url: any = {};

    constructor(private _http: Http) {
        // Images
        this.url.images = '/images/json?all=1'; // GET
        this.url.imageInfo = '/images/{name}/json'; // GET
        this.url.imageHistory = '/images/{name}/history'; // GET
        this.url.imageSearch = '/images/search?term={term}'; // GET
        this.url.imageSearchTags = 'https://registry.hub.docker.com/v1/repositories/{name}/tags'; // GET
        this.url.imageCreate = '/images/create?fromImage={name}&tag={tag}'; // POST
        this.url.imageCommitFromContainer = '/commit'; // POST
        // Containers
        this.url.containers = '/containers/json?all=1'; // GET
        this.url.containerStart = '/containers/{container}/start'; // POST
        this.url.containerPause = '/containers/{container}/pause'; // POST
        this.url.containerResume = '/containers/{container}/unpause'; // POST
        this.url.containerStop = '/containers/{container}/stop?t=1'; // POST
        this.url.containerInfo = '/containers/{container}/json'; // GET
        this.url.containerCreate = '/containers/create'; // POST
        this.url.containerRestart = '/containers/{container}/restart?t=1'; // POST
        this.url.containerRename = '/containers/{container}/rename?name={name}'; // POST
        this.url.containerKill = '/containers/{container}/kill'; // POST
        this.url.containerRemove = '/containers/{container}?force=1'; // DELETE
        this.url.containerTop = '/containers/{container}/top'; // GET
        this.url.containerLogs = '/containers/{container}/logs?stdout=1'; // GET
        this.url.containerChanges = '/containers/{container}/changes'; // GET
        this.url.containerResizeTerminalLimits = '/containers/{container}/resize?w={width}&h={height}'; // POST TERMINAL STREAM FIX LIMITS
        this.url.containerStats = '/containers/{container}/stats'; // GET LIVE STREAM
        this.url.containerExport = '/containers/{container}/export'; // GET STREAM
        this.url.containerTerminalAttach = '/containers/{container}/attach?logs=1&stream=0&stdout=1'; // POST STREAM
        this.url.containerTerminalWebsocker = '/containers/{container}/attach/ws?logs=0&stream=1&stdin=1&stdout=1&stderr=1'; // GET STREAM
        // Info
        this.url.ping = '/_ping'; // GET
        this.url.info = '/info'; // GET
        this.url.version = '/version'; // GET
        this.url.events = '/events'; // GET STREAM
        this.url.networks = '/networks'; // GET
        this.url.networkInfo = '/networks/{network}'; // GET

        Observable.interval(this._pingSeconds * 1000)
            .subscribe(() => {
                let timeStart: number = performance.now();
                this._http.get(this.endpoint + this.url.ping)
                    .subscribe((data) => {
                        let timeEnd: number = performance.now();
                        let ping: number = timeEnd - timeStart;
                        this.pingStream.next(data.statusText == 'OK' ? 1 : 0);
                    });
            });
    }

    images() {
        return this._http.get(this.endpoint + this.url.images).map(images => images.json());
    }

    imageInfo(name) {
        let url = this.url.imageInfo.replace('{name}', name);
        return this._http.get(this.endpoint + url).map(images => images.json());
    }

    imageSearch(term) {
        let url = this.url.imageSearch.replace('{term}', term);
        return this._http.get(this.endpoint + url).map(images => images.json());
    }

    imageSearchTags(name) {
        let url = this.url.imageSearchTags.replace('{name}', name);
        return this._http.get(url).map(tags => tags.json());
    }

    imageCreate(name, tag) {
        let url = this.url.imageCreate.replace('{name}', name).replace('{tag}', tag);
        return this._http.post(this.endpoint + url, {}).map(images => images);
    }

    containers() {
        return this._http.get(this.endpoint + this.url.containers).map(containers => containers.json());
    }

    containerStart(container) {
        let url = this.url.containerStart.replace('{container}', container);
        return this._http.post(this.endpoint + url, {}).map(container => container);
    }

    containerPause(container) {
        let url = this.url.containerPause.replace('{container}', container);
        return this._http.post(this.endpoint + url, {}).map(container => container);
    }

    containerResume(container) {
        let url = this.url.containerResume.replace('{container}', container);
        return this._http.post(this.endpoint + url, {}).map(container => container);
    }

    containerStop(container) {
        let url = this.url.containerStop.replace('{container}', container);
        return this._http.post(this.endpoint + url, {}).map(container => container);
    }

    containerInfo(container) {
        let url = this.url.containerInfo.replace('{container}', container);
        return this._http.get(this.endpoint + url).map(container => container.json());
    }

}