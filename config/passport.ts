const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy
const JwtStrategy = require('passport-jwt').Strategy
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const db = require('../models')
const bcrypt = require('bcryptjs')
const User = db.User
require('dotenv').config()

import type { DoneCallback } from "passport";
import type { Express } from "express";
import type { Request } from "express";
import type { FacebookConnectData, GoogleConnectData } from "../types/user";

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

module.exports = (app: Express) => {
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