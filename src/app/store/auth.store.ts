import {ActionReducer, Action} from '@ngrx/store';

export const AUTH_ACTION_TYPES = {
    GITHUB_AUTH: 'GITHUB_AUTH',
    CHANGE_NAME: 'CHANGE_NAME',
};

export const authInitialState = {
    authToken: window.localStorage.getItem('authToken') || false,
    authenticated: false,
    username: '',
};

export const authStore: ActionReducer<Object> = (state: Object = authInitialState, action: Action) => {
    
    switch (action.type) {
        
        case AUTH_ACTION_TYPES.GITHUB_AUTH:
            localStorage.setItem('authToken', action.payload.token);
            return Object.assign(state, {authToken: action.payload.token, authenticated: true});
        
        case AUTH_ACTION_TYPES.CHANGE_NAME:
            return Object.assign(state, {username: action.payload.username});
        
        default:
            return state;
    }
};
