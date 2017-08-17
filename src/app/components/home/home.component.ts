import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import {Store} from '@ngrx/store';
import {AppState} from '../../store/appState.store';
import {Subject} from 'rxjs/Rx';
import 'rxjs/Rx';
import {PingService} from "../../services/ping.service";

@Component({
    selector: 'ae-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {
    
    pings: any[];
    
    constructor(public store: Store<AppState>,
                private _pingService: PingService) {
        this.pings = new Array();
    }
    
    ngOnInit() {
        this._pingService.pingStream.subscribe(ping => {
            this.pings.push(ping);
        });
    }
    
    pingar() {
    
    }
    
}
