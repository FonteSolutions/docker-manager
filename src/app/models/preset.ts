// import {DbService} from '../services/db.service';

export interface PublicPrivateCollection {
    'public': string;
    'private': string;
}
export interface ValueCollection {
    name: string;
    value: string;
}

export class Preset {
    id: string;
    name: string;
    cmd: string;
    ports: PublicPrivateCollection[] = [];
    volumes: PublicPrivateCollection[] = [];
    envs: ValueCollection[] = [];
    selected: boolean;

    // constructor(public dbService: DbService) {
    // }

    addPort(publicPort, privatePort) {
        this.ports.push({'public': publicPort, 'private': privatePort});
    }

    addVolume(publicVolume, privateVolume) {
        this.volumes.push({'public': publicVolume, 'private': privateVolume});
    }

    addEnv(name, value) {
        this.envs.push({'name': name, 'value': value});
    }

    removePort(portPublic, portPrivate) {
        this.ports = this.ports.filter(item => item.public != portPublic && item.private != portPrivate);
    }

    removeVolume(volumePublic, volumePrivate) {
        this.volumes = this.volumes.filter(item => item.public != volumePublic && item.private != volumePrivate);
    }

    removeEnv(envName, envValue) {
        this.envs = this.envs.filter(item => item.name != envName && item.value != envValue);
    }

    // save() {
    //     try {
    //         const stmt = this.dbService.db.prepare('SELECT id, name, cmd, ports, volumes, envs FROM presets WHERE name=:name');
    //         const result = stmt.getAsObject({':name': 'teste4'});
    //         if (result.id) {
    //             console.log('result', result);
    //         }
    //         // this.dbService.db.run('INSERT INTO presets (name, cmd, ports, volumes, envs) VALUES ("teste4", "cmd1", "ports1", "volumes1", "envs1")');
    //     } catch (err) {
    //         switch (true) {
    //             case err.message.indexOf('UNIQUE constraint failed') >= 0:
    //                 console.log('err', err.message.split(':')[1]);
    //                 break;
    //         }
    //         // console.log('ERORRR', err.message);
    //     }
    //     this.dbService.saveDb();
    // }

    prepare(): any[] {
        if (this.id) {
            return [
                this.name,
                this.cmd || '',
                JSON.stringify(this.ports),
                JSON.stringify(this.volumes),
                JSON.stringify(this.envs),
                this.id
            ];
        }
        return [
            this.name,
            this.cmd || '',
            JSON.stringify(this.ports),
            JSON.stringify(this.volumes),
            JSON.stringify(this.envs)
        ];
    }

    parse(row): Preset {
        this.id = row.id || null;
        this.name = row.name;
        this.cmd = row.cmd || '';
        this.ports = JSON.parse(row.ports);
        this.volumes = JSON.parse(row.volumes);
        this.envs = JSON.parse(row.envs);
        return this;
    }

    clone(): any {
        return Object.create(this);
    }
}
