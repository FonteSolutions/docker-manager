export interface AppState {
    username: string;
    full_name: string;
    user_image_url: string;
    envato_entry_url: string;
    authToken: any;
    refresh_token: any;
    token_expires_in: any;
    authenticated: boolean;
    firebase_jwt: string;
    firebase_uid: string;
    items: Object[];
    projects: Object[];
};
