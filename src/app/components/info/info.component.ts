import {Component, OnInit} from '@angular/core';
import {DockerService} from "../../services/docker.service";
import 'rxjs/Rx';

@Component({
    selector: 'dm-info',
    templateUrl: './info.component.html',
    styleUrls: ['./info.component.scss'],
})
export class InfoComponent implements OnInit {
    
    public data: any;
    
    constructor(private dockerService: DockerService) {
        this.data = {
            info: {},
            version: {}
        }
    }
    
    ngOnInit() {
        this.dockerService.version().subscribe(version => {
            this.data.version = version;
        });
        this.dockerService.info().subscribe(info => {
            this.data.info = info;
        });
    }
    
}
