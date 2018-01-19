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
import {MaterializeModule} from 'angular2-materialize';

import {AppComponent} from './components/app.component';
import {HomeComponent} from './components/home/home.component';
import {ImagesComponent} from './components/images/images.component';
import {ContainersComponent} from './components/containers/containers.component';
import {InfoComponent} from './components/info/info.component';

import {routes} from './app.routes';
import {DockerService} from './services/docker.service';
import {DbService} from './services/db.service';
import {PresetService} from './services/preset.service';
import {SettingsComponent} from './components/settings/settings.component';

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
        DockerService,
        PresetService,
        DbService
    ],
    declarations: [
        AppComponent,
        HomeComponent,
        ImagesComponent,
        InfoComponent,
        SettingsComponent,
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
