import {Component, OnInit} from '@angular/core';
import 'rxjs/Rx';
import {DockerService} from "../../services/docker.service";

@Component({
    selector: 'dm-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {
    
    constructor(private dockerService: DockerService) {
    }
    
    ngOnInit() {
        this.dockerService.info().subscribe(result => {
            console.log(result);
        });
    }
    
}
