// user from done() of passport.js
export interface AuthUser {
    id: number;
    email: string;
    password: string;
    name: string;
    facebookId: string;
    googleId: string;
    createdAt: Date;
    updatedAt: Date;
}

// used in passport oauth-connect callback
export interface GoogleConnectData extends Pick<AuthUser, 'googleId'> {}

export interface FacebookConnectData extends Pick<AuthUser, 'facebookId'> {}