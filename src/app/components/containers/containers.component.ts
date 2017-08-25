import {Component, OnInit} from '@angular/core';
import {DockerService} from "../../services/docker.service";
import 'rxjs/Rx';
import {toast} from "angular2-materialize";

@Component({
    selector: 'dm-containers',
    templateUrl: './containers.component.html',
    styleUrls: ['./containers.component.scss'],
})
export class ContainersComponent implements OnInit {

    containers: any[];

    constructor(private dockerService: DockerService) {
        this.containers = new Array();
    }

    ngOnInit() {
        this.updateContainers();
    }

    playPause(container) {
        switch (container.State) {
            case 'running':
                this.dockerService.containerPause(container.Id).subscribe(
                    () => {
                        this.updateContainers();
                    },
                    error => {
                        toast(error, 3000);
                    }
                );
                break;
            case 'paused':
                this.dockerService.containerResume(container.Id).subscribe(
                    () => {
                        this.updateContainers();
                    },
                    error => {
                        toast(error, 3000);
                    }
                );
                break;
            default:
                this.dockerService.containerStart(container.Id).subscribe(
                    () => {
                        this.updateContainers();
                    },
                    error => {
                        console.log(error);
                        toast(error, 3000);
                    }
                );
                break;
        }
    }

    stop(container) {
        if (container.State == 'paused') {
            this.dockerService.containerResume(container.Id).subscribe(
                () => {
                    this.dockerService.containerStop(container.Id).subscribe(() => {
                        this.updateContainers();
                    });
                },
                error => {
                    toast(error.json().message, 3000);
                }
            );
        } else {
            this.dockerService.containerStop(container.Id).subscribe(() => {
                this.updateContainers();
            });
        }
    }

    info(container) {
        this.dockerService.containerInfo(container.Id).subscribe(info => {
            console.log('info', info);
            let ports = new Array();
            for(let port in info.Config.ExposedPorts) {
                ports.push(port);
            }
            info.Config['ports'] = ports;
            container.info = info;
        });
    }

    remove(container) {
        this.dockerService.containerRemove(container.Id).subscribe(result => {
            this.updateContainers();
        });
    }

    updateContainers() {
        this.dockerService.containers().subscribe(containers => {
            this.containers = containers;
        });
    }

}
