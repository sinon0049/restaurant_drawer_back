import passport from 'passport'
import { Strategy as LocalStrategy } from 'passport-local'
import { Strategy as JwtStrategy } from 'passport-jwt'
import { Strategy as GoogleStrategy } from 'passport-google-oauth20'
import { Strategy as FacebookStrategy } from 'passport-facebook'
import db from '../models/index.js'
import bcrypt from 'bcryptjs'
import 'dotenv/config'
import type { DoneCallback } from 'passport'
import type { Express, Request } from 'express'
import type { FacebookConnectData, GoogleConnectData } from '../types/user.js'

const User = db.User

type OAuthConnectDoneCallback<T> = (err: any, user: null | false | undefined | T) => void

interface JwtPayLoad {
    id: number;
    iat: number;
}

let jwtOptions = {
    jwtFromRequest: (req: Request) => {
        return req.cookies.token || null
     },
    secretOrKey: process.env.SECRET,
}

const usePassport = (app: Express) => {
    app.use(passport.initialize())

    passport.use(new LocalStrategy({usernameField: "email"}, async (email: string, password: string, done: DoneCallback) => {
        const user = await User.findOne({where: {email}, raw: true})
        if(!user) return done(null, false)
        if(!user.password) return done(null, false)
        if(!bcrypt.compareSync(password, user.password)) return done(null, false)
        return done(null, user)
    }))

    passport.use('token', new JwtStrategy(jwtOptions, async (jwt_payload: JwtPayLoad, done: DoneCallback) => {
        try {
            const user = await User.findByPk(jwt_payload.id, { raw: true })
            if(!user) return done(null, false)
            return done(null, user)
        } catch (error) {
            console.log(error)
        }
    }))

    passport.use('google-signin', new GoogleStrategy({
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: `${process.env.BACKEND_URL}/users/google/signin/callback`
        },
        async (accessToken: string, refreshToken: string, profile: any, done: DoneCallback) => {
            const user = await User.findOrCreate({
                where: {
                    googleId: profile.id
                },
                defaults: {
                    name: profile.displayName,
                    email: profile.emails[0].value
                }
            })

            return done(null, user[0].dataValues)
        }
    ))

    passport.use('google-connect', new GoogleStrategy({
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: `${process.env.BACKEND_URL}/users/google/connect/callback`
        },
        (accessToken: string, refreshToken: string, profile: any, done: OAuthConnectDoneCallback<GoogleConnectData>) => {
            return done(null, { googleId: profile.id })
        }
    ))

    passport.use('facebook-signin', new FacebookStrategy({
            clientID: process.env.FACEBOOK_CLIENT_ID,
            clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
            callbackURL: `${process.env.BACKEND_URL}/users/facebook/signin/callback`,
            profileFields: ["id", "displayName", "email"]
        },
        async (accessToken: string, refreshToken: string, profile: any, done: DoneCallback) => {
            const user = await User.findOrCreate({
                where: {
                    facebookId: profile.id
                },
                defaults: {
                    name: profile.displayName,
                    email: profile.emails[0].value
                }
            })

            return done(null, user[0].dataValues)
        }
    ))

    passport.use('facebook-connect', new FacebookStrategy({
            clientID: process.env.FACEBOOK_CLIENT_ID,
            clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
            callbackURL: `${process.env.BACKEND_URL}/users/facebook/connect/callback`,
        },
        (accessToken: string, refreshToken: string, profile: any, done: OAuthConnectDoneCallback<FacebookConnectData>) => {
            return done(null, { facebookId: profile.id })
        }
    ))
}

export default usePassport
