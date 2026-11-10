import 'express-session'

declare module 'express-session' {
    interface SessionData {
        oauthConnect?: {
            userId: number;
            provider: 'google' | 'facebook'
        }

        csrfToken?: string
    }
}