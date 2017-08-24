import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {enableProdMode, NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {platformBrowserDynamic} from '@angular/platform-browser-dynamic';
import {RouterModule, Router} from '@angular/router';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {HttpModule} from '@angular/http';
import {StoreModule} from '@ngrx/store';
import {authStore, authInitialState} from './store/auth.store';
import 'materialize-css';
import {MaterializeModule} from "angular2-materialize";

import {HomeComponent} from './components/home/home.component';
import {AppComponent} from './components/app.component';
import {ImagesComponent} from './components/images/images.component';
import {ContainersComponent} from './components/containers/containers.component';

import {routes} from './app.routes';
import {DockerService} from "./services/docker.service";

/*
 * provide('AppStore', { useValue: appStore }),
 */
@NgModule({
    imports: [
        BrowserModule,
        FormsModule,
        ReactiveFormsModule,
        HttpModule,
        BrowserAnimationsModule,
        MaterializeModule.forRoot(),
        RouterModule.forRoot(routes, {useHash: true}),
        StoreModule.provideStore({authStore}, {authStore: authInitialState})
    ],
    providers: [
        DockerService
    ],
    declarations: [
        AppComponent,
        HomeComponent,
        ImagesComponent,
        ContainersComponent
    ],
    bootstrap: [AppComponent]
})

export class AppModule {
}

const process = require('process')
const isDev = process.argv[2] == 'dev' ? true : false
if (!isDev) {
    enableProdMode();
}

platformBrowserDynamic().bootstrapModule(AppModule);
