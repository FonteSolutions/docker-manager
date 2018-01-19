import {Injectable} from '@angular/core';
import {Subject, Observable} from 'rxjs/Rx';
import {Database} from 'sqlite3';
import 'rxjs/Rx';
import 'rxjs/add/observable/fromPromise';

@Injectable()
export class DbService {

    public db: Database;

    constructor() {
        let electron = require('electron');
        const app = electron.remote.app;
        this.db = app['db'];
        this.db.serialize(() => {
            this.db.run('CREATE TABLE IF NOT EXISTS preset (id INTEGER PRIMARY KEY, name TEXT NOT NULL UNIQUE, cmd TEXT, ports TEXT, volumes TEXT, envs TEXT)');

            // var ports = [
            //     '80:80',
            //     '443:443',
            //     '9200:9200',
            //     '5601:5601'
            // ];
            // var volumes = [
            //     '/home/basistecnologia/Documentos/www/:/var/www/html/'
            // ];
            // var envs = [
            //     'abc:123'
            // ];
            //
            // var params = [
            //     'sapiens',
            //     '/bin/bash',
            //     JSON.stringify(ports),
            //     JSON.stringify(volumes),
            //     JSON.stringify(envs)
            // ];
            // // var stmt = this.db.prepare('INSERT INTO preset (name, cmd, ports, volumes, envs) VALUES (?, ?, ?, ?, ?)');
            // // stmt.run(params);
            // // stmt.finalize();
            //
            // this.db.each('SELECT id, name, cmd, ports, volumes, envs FROM preset', function(err, row) {
            //     console.log(row.id, row);
            // });





            // this.db.run('CREATE TABLE IF NOT EXISTS foo (id INTEGER)');
            //
            // var stmt = db.prepare("INSERT INTO lorem VALUES (?)");
            // for (var i = 0; i < 10; i++) {
            //     stmt.run("Ipsum " + i);
            // }
            // stmt.finalize();
            //
            // db.each("SELECT rowid AS id, info FROM lorem", function(err, row) {
            //     console.log(row.id + ": " + row.info);
            // });
        });
        // this.db.close();
    }
}
