// import {AppState} from './../store/appState.store';
import {Component, OnInit, AfterViewInit, ViewEncapsulation} from '@angular/core';
import {DockerService} from "../services/docker.service";

declare let $: any;
declare let jQuery: any;

@Component({
    selector: 'app-container',
    styleUrls: ['./app.theme.scss'],
    encapsulation: ViewEncapsulation.None,
    templateUrl: './app.component.html'
})
export class AppComponent implements OnInit {
    isDarkTheme: boolean = false;
    dockerRemoteStatus: string;

    constructor(private dockerService: DockerService) {
        this.dockerRemoteStatus = 'fa fa-circle red-text';
    }
    
    ngOnInit() {
        require('materialize-css');
        $(function () {
            (<any>$('.button-collapse')).sideNav();
            (<any>$('.dropdown-button')).dropdown({
                hover: true,
                gutter: 0,
                belowOrigin: true
            });
        });

        this.dockerService.pingStream.subscribe(ping => {
            if(ping == 1) {
                this.dockerRemoteStatus = 'fa fa-circle green-text';
            } else {
                this.dockerRemoteStatus = 'fa fa-circle red-text';
            }
        });
    }
    
    closeWindow() {
        let electron = require('electron');
        // const app = electron.remote.app;
        // app.quit();
        const remote = electron.remote;
        const focusedWindow = remote.getCurrentWindow();
        focusedWindow.minimize();
    }
    
    restoreWindow() {
        const electron = require('electron');
        const remote = electron.remote;
        const focusedWindow = remote.getCurrentWindow();
        focusedWindow.restore();
    }
    
    minimizeWindow() {
        let electron = require('electron');
        const remote = electron.remote;
        const focusedWindow = remote.getCurrentWindow();
        focusedWindow.minimize();
    }
}
