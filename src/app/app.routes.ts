import {Routes} from '@angular/router';
import {HomeComponent} from './components/home/home.component';
import {ImagesComponent} from './components/images/images.component';
import {ContainersComponent} from './components/containers/containers.component';

export const routes: Routes = [
    {path: '', component: HomeComponent},
    {path: 'home', component: HomeComponent},
    {path: 'images', component: ImagesComponent},
    {path: 'containers', component: ContainersComponent}
];
