import {Component, EventEmitter, OnInit, Output} from '@angular/core';
// import {Store} from '@ngrx/store';
// import {AppState} from '../../store/appState.store';
// import {Subject} from 'rxjs/Rx';
import 'rxjs/Rx';
// import {PingService} from "../../services/ping.service";

@Component({
    selector: 'dm-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {
    
    // pings: any[];
    
    constructor() {
    }
    
    ngOnInit() {
        // this._pingService.pingStream.subscribe(ping => {
        //     this.pings.push(ping);
        // });
    }
    
    pingar() {
    
    }
    
}
