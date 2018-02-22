import {Injectable} from '@angular/core';
import {Subject, Observable} from 'rxjs/Rx';
// import {Database} from 'sqlite3';
import 'rxjs/Rx';
import 'rxjs/add/observable/fromPromise';
import {Preset} from '../models/preset';
import * as fs from 'fs';
// import * as Knex from 'knex';
import {Database} from 'sql.js';
import {Observer} from 'rxjs/Observer';
declare var electron: any;
declare var db: Database;
declare var dbPath: any;

@Injectable()
export class DbService {

    public db: Database;

    constructor() {
        // let electron = require('electron');
        const app = electron.remote.app;
        this.db = db;
        // electron.remote.getCurrentWindow().removeAllListeners();
        // this.db = app['db'];
        // console.log(app, fs, app.docker);
        //
        this.db.run('CREATE TABLE IF NOT EXISTS presets (' +
            'id INTEGER PRIMARY KEY' +
            ', name TEXT NOT NULL UNIQUE' +
            ', cmd TEXT' +
            ', ports TEXT' +
            ', volumes TEXT' +
            ', envs TEXT' +
        ')');

        // const dbData = this.db.export();
        // const dbBuffer = new Buffer(dbData);
        // console.log(new Buffer(db.export()));
        // try {
        //     const stmt = this.db.prepare('SELECT id, name, cmd, ports, volumes, envs FROM presets WHERE name=:name');
        //     const result = stmt.getAsObject({':name': 'teste4'});
        //     if (result.id) {
        //         console.log('result', result);
        //     }
        //     this.db.run('INSERT INTO presets (name, cmd, ports, volumes, envs) VALUES ("teste4", "cmd1", "ports1", "volumes1", "envs1")');
        // } catch (err) {
        //     switch (true) {
        //         case err.message.indexOf('UNIQUE constraint failed') >= 0:
        //             console.log('err', err.message.split(':')[1]);
        //             break;
        //     }
        //     // console.log('ERORRR', err.message);
        // }
        this.saveDb();
        // fs.writeFileSync(dbPath, new Buffer(db.export()));
        // fs.writeFileSync(app['dbPath'], 'vaaaae');
        // console.log('fs', fs);

        // const stmt = this.db.prepare('SELECT * FROM presets');
        // const result = stmt.getColumnNames();

        // app['saveDb']();

        // electron.ipcRenderer.send('save-db', 'testes')

        // console.log(result);

        // this.db.schema.dropTableIfExists('preset');
        // this.db.schema.createTable('presets', (table) => {
        //     console.log('creating preset', table);
        //     table.increments('id');
        //     table.string('name');
        //     table.string('cmd');
        //     table.string('ports');
        //     table.string('volumes');
        //     table.string('envs');
        // }).then(res => {
        //     console.log('successsss', res);
        // }).catch(err => {
        //     console.log('errr', err);
        // });

        // console.log('tabela preset criada', this.db);

        // let preset = new Preset();
        // preset.name = 'angular-app';
        // preset.cmd = '/bin/bash';
        // preset.addPort(80, 80);
        // preset.addPort(443, 443);
        // preset.addPort(4200, 4200);
        // preset.addVolume('/home/basistecnologia/Documentos/www/', '/var/www/html/');
        // preset.addEnv('path_www', '/var/www/html/');
        //
        // this.db.insert(preset.prepare());

        // this.db('preset').select('name').map(row => {
        //     console.log('row', row);
        // });

        // this.db.sc

        // this.db.serialize(() => {
        //     this.db.run('CREATE TABLE IF NOT EXISTS preset (id INTEGER PRIMARY KEY, name TEXT NOT NULL UNIQUE, cmd TEXT, ports TEXT, volumes TEXT, envs TEXT)');

            // banco de talento
            // let preset = new Preset();
            // preset.name = 'angular-app';
            // preset.cmd = '/bin/bash';
            // preset.addPort(80, 80);
            // preset.addPort(443, 443);
            // preset.addPort(4200, 4200);
            // preset.addVolume('/home/basistecnologia/Documentos/www/', '/var/www/html/');
            // preset.addEnv('path_www', '/var/www/html/');

            // let stmt = this.db.prepare('INSERT INTO preset (name, cmd, ports, volumes, envs) VALUES (?, ?, ?, ?, ?)');
            // stmt.run(preset.prepare());
            // stmt.finalize();

            // sapiens
            // preset = new Preset();
            // preset.name = 'sapiens';
            // preset.cmd = '/bin/bash';
            // preset.addPort(80, 80);
            // preset.addPort(443, 443);
            // preset.addPort(5601, 5601);
            // preset.addPort(9200, 9200);
            // preset.addVolume('/home/basistecnologia/Documentos/www/', '/var/www/html/');
            // preset.addEnv('path_www', '/var/www/html/');
            // preset.addEnv('path_sapiens', '/var/www/html/sapiens/');

            // let stmt = this.db.prepare('INSERT INTO preset (name, cmd, ports, volumes, envs) VALUES (?, ?, ?, ?, ?)');
            // stmt.run(preset.prepare());
            // stmt.finalize();
        // });
        // this.db.close();
    }

    saveDb() {
        fs.writeFileSync(dbPath, new Buffer(db.export()));
    }

    save(sql: string, params?: any[]): Observable<any[]> {
        return Observable.create((observer: Observer<boolean>) => {
            try {
                this.db.run(sql, params);
            } catch (err) {
                switch (true) {
                    case err.message.indexOf('UNIQUE constraint failed') >= 0:
                        console.log('ERROR', err.message.split(':')[1]);
                        break;
                    default:
                        console.log('ERROR', err.message);
                }
            }
            this.saveDb();
            observer.next(true);
        });
    }

    all(sql: string, filters?: any, returnClass?: any): Observable<any[]> {
        return Observable.create((observer: Observer<Preset[]>) => {
            try {
                let result = [];
                this.db.each(sql, filters, (row) => {
                    if (returnClass) {
                        var obj = Object.create(returnClass);
                        result.push(obj.parse(row));
                    } else {
                        result.push(row);
                    }
                }, () => {
                    observer.next(result);
                });
                return result;
            } catch (err) {
                switch (true) {
                    case err.message.indexOf('UNIQUE constraint failed') >= 0:
                        console.log('ERROR', err.message.split(':')[1]);
                        break;
                    default:
                        console.log('ERROR', err.message);
                }
            }
        });
    }
}
