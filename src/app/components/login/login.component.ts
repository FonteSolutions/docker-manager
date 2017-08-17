import {Component, NgZone, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {Store} from '@ngrx/store';
import {AppState} from '../../store/appState.store';
import {Authentication} from '../../services/authentication';
import 'materialize-css';
import {toast} from "angular2-materialize";
declare let $: any;
declare let jQuery: any;

@Component({
    selector: 'ae-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
    public email: string;
    public password: string;
    
    constructor(private _router: Router,
                private _ngZone: NgZone,
                private auth: Authentication,
                public store: Store<AppState>) {
        this.auth = auth;
    }
    
    ngOnInit() {
        $(function() {
            (<any>$('.tooltipped')).tooltip({delay: 50});
        });
    }
    
    tryLogin() {
        if (!this.email || !this.password) {
            toast('E-mail/Senha são obrigatórios.', 3000);
            return;
        }
        switch (true) {
            case this.email == 'ln0001' && this.password == 'brscan@123':
                break;
            case this.email == 'guilherme.fontenele@brscan.com.br' && this.password == '123456':
                break;
            case this.email == 'harry.potter@brscan.com.br' && this.password == '123456':
                break;
            default:
                toast('E-mail/Senha inválidos.', 3000);
                return;
        }
        
        const router = this._router;
    
        toast('Login efetuado com sucesso!', 3000, 'rounded', function () {
            router.navigate(['/home']);
        });
    }
    
}
