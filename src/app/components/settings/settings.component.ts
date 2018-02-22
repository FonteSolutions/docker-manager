import {ChangeDetectorRef, Component, NgZone, OnInit} from '@angular/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {toast} from 'angular2-materialize';
import 'rxjs/Rx';

import {DockerService} from '../../services/docker.service';
import {PresetService} from '../../services/preset.service';
import {Preset} from '../../models/preset';
import {DbService} from '../../services/db.service';

declare let $: any;

@Component({
    selector: 'dm-settings',
    templateUrl: './settings.component.html',
    styleUrls: ['./settings.component.scss'],
})
export class SettingsComponent implements OnInit {
    public preset: any;
    public inputs: any;
    public data: any;
    public presets: Preset[];

    constructor(private dockerService: DockerService,
                private presetService: PresetService,
                private dbService: DbService,
                private zone: NgZone,
                private ref: ChangeDetectorRef) {
        this.preset = new Preset();
        this.presets = [];
        this.data = {
            presets: []
        };
        this.inputs = {
            portPublic: '',
            portPrivate: '',
            volumePublic: '',
            volumePrivate: '',
            envName: '',
            envValue: ''
        };
    }

    ngOnInit() {
        $(function() {
            $('#modal-add-edit-preset').modal({
                dismissible: true,
                opacity: .3,
                inDuration: 300,
                outDuration: 200,
                endingTop: '10%',
                ready: function(modal, trigger) {
                    $('#modal-add-edit-preset ul.tabs').tabs('select_tab', 'edit-preset-tab-general');
                    $('#name').focus();
                },
                complete: function() {
                }
            });
            $('#modal-add-edit-preset ul.tabs').tabs(
                // swipeable: true
                // responsiveThreshold : 1920
            );
        });
        this.loadAllPresets();
    }

    loadAllPresets() {
        this.zone.run(() => {
            this.presetService.all().subscribe((presets: any[]) => {
                this.presets = presets;
                console.log(this.presets);
                setTimeout(() => {
                    this.ref.detectChanges();
                }, 0);
            }, err => {
                toast('Error when get presets.', 5000);
            });

            // let preset = new Preset();
            // preset.name = 'sapiens';
            // preset.cmd = '/bin/bash';
            // preset.addPort(80, 80);
            // preset.addPort(443, 443);
            // preset.addPort(5601, 5601);
            // preset.addPort(9200, 9200);
            // preset.addVolume('/home/basistecnologia/Documentos/www/', '/var/www/html/');
            // preset.addEnv('path_www', '/var/www/html/');
            // preset.addEnv('path_sapiens', '/var/www/html/sapiens/');

            // let preset = new Preset();
            // preset.name = 'angular-app';
            // preset.cmd = '/bin/bash';
            // preset.addPort(80, 80);
            // preset.addPort(443, 443);
            // preset.addPort(4200, 4200);
            // preset.addVolume('/home/basistecnologia/Documentos/www/', '/var/www/html/');
            // preset.addEnv('path_www', '/var/www/html/');
            //
            // this.presetService.save(preset).subscribe(res => {
            //     console.log('salvouuu', res);
            // });
        });
    }

    selectPresetToEdit(preset: Preset) {
        for (let _preset in this.presets) {
            this.presets[_preset].selected = false;
        }
        preset.selected = true;

    }

    editPreset(preset: Preset) {
        $('#modal-add-edit-preset').modal('open');
        this.preset = preset;
    }

    addNewPreset() {
        this.preset = new Preset();
        $('#modal-add-edit-preset').modal('open');
    }

    savePreset() {
        console.log('save');

        this.presetService.save(this.preset).subscribe(preset => {
        //     // toast(`Preset ${this.preset.name} saved with success.`, 5000);
        //     // this.preset = new Preset();
        //     // $('#modal-add-edit-preset').modal('close');
        //     // this.loadAllPresets();
        // }, err => {
        //     console.log('deu erro', err);
        });
    }

    addPort() {
        if (!this.inputs.portPublic || !this.inputs.portPrivate) {
            return;
        }
        this.preset.ports.push({public: this.inputs.portPublic, private: this.inputs.portPrivate});
        this.inputs.portPublic = '';
        this.inputs.portPrivate = '';
    }

    addVolume() {
        if (!this.inputs.volumePublic || !this.inputs.volumePrivate) {
            return;
        }
        this.preset.volumes.push({public: this.inputs.volumePublic, private: this.inputs.volumePrivate});
        this.inputs.volumePublic = '';
        this.inputs.volumePrivate = '';
    }

    addEnv() {
        if (!this.inputs.envName || !this.inputs.envValue) {
            return;
        }
        this.preset.envs.push({name: this.inputs.envName, value: this.inputs.envValue});
        this.inputs.envName = '';
        this.inputs.envValue = '';
    }

    removePort(portPublic, portPrivate) {
        this.preset.removePort(portPublic, portPrivate);
    }

    removeVolume(volumePublic, volumePrivate) {
        this.preset.removeVolume(volumePublic, volumePrivate);
    }

    removeEnv(envName, envValue) {
        this.preset.removeEnv(envName, envValue);
    }

}
