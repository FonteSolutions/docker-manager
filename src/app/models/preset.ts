export class Preset {
    name: string;
    cmd: string;
    ports: any[];
    volumes: any[];
    envs: any[];

    prepare() {
        return [
            this.name,
            this.cmd,
            JSON.stringify(this.ports),
            JSON.stringify(this.volumes),
            JSON.stringify(this.envs)
        ];
    }

    parse(row): Preset {
        this.name = row.name;
        this.cmd = row.cmd;
        this.ports = JSON.parse(row.ports);
        this.volumes = JSON.parse(row.volumes);
        this.envs = JSON.parse(row.envs);
        return this;
    }
}
