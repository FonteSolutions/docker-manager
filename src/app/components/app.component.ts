import {Component, OnInit, ViewEncapsulation} from '@angular/core';
import {DbService} from '../services/db.service';

declare let $: any;
declare let jQuery: any;

@Component({
    selector: 'app-container',
    styleUrls: ['./app.theme.scss'],
    encapsulation: ViewEncapsulation.None,
    templateUrl: './app.component.html'
})
export class AppComponent implements OnInit {

    public isDarkTheme: boolean = false;

    constructor(public dbService: DbService) {
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
            $('#modal-info').modal({
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
