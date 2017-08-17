//our root app component
import {Injectable} from '@angular/core';
import {Http} from '@angular/http';
import {Subject, Observable} from 'rxjs/Rx';
import 'rxjs/Rx';

@Injectable()
export class PingService {
    pingStream: Subject<number> = new Subject<number>();
    ping: number = 0;
    url: string = "https://www.brflow.com.br";
    
    constructor(private _http: Http) {
        Observable.interval(5000)
        .subscribe((data) => {
            let timeStart: number = performance.now();
            
            this._http.get(this.url)
            .subscribe((data) => {
                let timeEnd: number = performance.now();
                
                let ping: number = timeEnd - timeStart;
                this.ping = ping;
                this.pingStream.next(ping);
            });
        });
    }
}