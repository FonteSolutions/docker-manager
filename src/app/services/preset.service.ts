import {Injectable} from '@angular/core';
import {DbService} from './db.service';
import {Preset} from '../models/preset';
import {Observable} from 'rxjs/Observable';
import {Observer} from 'rxjs/Observer';
import 'rxjs/add/operator/map';

@Injectable()
export class PresetService {

    constructor(public dbService: DbService) {
    }

    all(): Observable<any[]> {
        return Observable.create((observer: Observer<Preset[]>) => {
            this.dbService.all('SELECT id, name, cmd, ports, volumes, envs FROM presets', {}, Preset.prototype).subscribe(presets => {
                observer.next(presets);
            });
        });
    }

    save(preset: Preset): Observable<Preset> {
        return Observable.create((observer: Observer<Preset>) => {
            if (preset.id) {
                this.dbService.save('UPDATE presets SET name=?, cmd=?, ports=?, volumes=?, envs=? WHERE id=?', preset.prepare()).subscribe(status => {
                    if (!status) {
                        observer.error('');
                    }
                });
                observer.next(preset);
            } else {
                this.dbService.save('INSERT INTO presets (name, cmd, ports, volumes, envs) VALUES (?, ?, ?, ?, ?)', preset.prepare()).subscribe(status => {
                    if (!status) {
                        observer.error('');
                    }
                    observer.next(preset);
                    // this.dbService.all('SELECT id, name, cmd, ports, volumes, envs FROM presets WHERE name = :name', {':name': preset.name}).subscribe(res => {
                    //     console.log('aaaaaa', res[0]);
                    //
                    //     observer.next(res[0]);
                    // });
                });
            }
        });
    }

    findByName(name): Observable<any> {
        return this.dbService.one('SELECT id, name, cmd, ports, volumes, envs FROM presets WHERE name = :name', {':name': name}, Preset.prototype);
    }

}
