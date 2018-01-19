import {Injectable} from '@angular/core';
import {DbService} from './db.service';
import {Preset} from '../models/preset';

@Injectable()
export class PresetService {

    constructor(public dbService: DbService) {

    }

    all() {
        let preset = new Preset();
        this.dbService.db.each('SELECT id, name, cmd, ports, volumes, envs FROM preset', (err, row) => {
            preset.parse(row);
        });

        return preset;
        // return this.dbService.db.each('SELECT id, name, cmd, ports, volumes, envs FROM preset', (err, row) => {
        //     return row;
        // });
    }
}
