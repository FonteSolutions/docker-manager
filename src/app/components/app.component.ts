import {AppState} from './../store/appState.store';
import {Component, OnInit, AfterViewInit, ViewEncapsulation} from '@angular/core';

declare let $: any;
declare let jQuery: any;

/*
 * App Component
 * Top Level Component
 */
@Component({
    // The selector is what angular internally uses
    selector: 'app-container', // <app></app>
    styleUrls: ['./app.theme.scss'],
    encapsulation: ViewEncapsulation.None,
    templateUrl: './app.component.html'
})
export class AppComponent implements OnInit {
    //component initialization
    isDarkTheme: boolean = false;
    public profileService: any;
    
    constructor() {
        this.profileService = {
            user: {}
        };
    }
    
    ngOnInit() {
        const mat = require('materialize-css')
        $(function () {
            (<any>$('.button-collapse')).sideNav();
            (<any>$('.dropdown-button')).dropdown({
                hover: true,
                gutter: 0,
                belowOrigin: true
            });
        });
    }
    
    checkAuthentication() {
    }
    
    closeWindow() {
        const electron = require('electron');
        const app = electron.remote.app;
        app.quit();
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
