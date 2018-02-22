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
        let presets = [];
        return Observable.create((observer: Observer<Preset[]>) => {
            this.dbService.all('SELECT id, name, cmd, ports, volumes, envs FROM presets', {}, Preset.prototype).subscribe(presets => {
                observer.next(presets);
            });
            // this.dbService.db.each('SELECT id, name, cmd, ports, volumes, envs FROM preset', (err, row) => {
            //     presets.push(new Preset().parse(row));
            // });
        });
    }

    save(preset: Preset): Observable<Preset> {
        return Observable.create((observer: Observer<Preset>) => {
            if (preset.id) {
                // console.log(preset.prepare());
                // let stmt = this.dbService.db.prepare('UPDATE preset SET name = ?, cmd = ?, ports = ?, volumes = ?, envs = ? WHERE id = ?');
                // stmt.run(preset.prepare());
                // stmt.finalize(() => {
                // });
                observer.next(preset);
            } else {
                this.dbService.save('INSERT INTO presets (name, cmd, ports, volumes, envs) VALUES (?, ?, ?, ?, ?)', preset.prepare()).subscribe(status => {
                    if (!status) {
                        return false;
                    }
                    this.dbService.all('SELECT id, name, cmd, ports, volumes, envs FROM presets WHERE name = :name', {name: preset.name}).subscribe(res => {
                        console.log('aaaaaa', res);
                        observer.next(preset);
                    });
                    // stmt.run(preset.prepare());
                    // stmt.finalize(() => {
                });
                // });
            }
        });
    }

}
