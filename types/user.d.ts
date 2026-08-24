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