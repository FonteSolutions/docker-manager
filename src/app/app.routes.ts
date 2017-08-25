import {Routes} from '@angular/router';
import {HomeComponent} from './components/home/home.component';
import {ImagesComponent} from './components/images/images.component';
import {ContainersComponent} from './components/containers/containers.component';
import {InfoComponent} from "./components/info/info.component";

export const routes: Routes = [
    {path: '', component: HomeComponent},
    {path: 'home', component: HomeComponent},
    {path: 'info', component: InfoComponent},
    {path: 'images', component: ImagesComponent},
    {path: 'containers', component: ContainersComponent}
];
