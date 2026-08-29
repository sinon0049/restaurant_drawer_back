const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy
const JwtStrategy = require('passport-jwt').Strategy
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt
const db = require('../models')
const bcrypt = require('bcryptjs')
const User = db.User
require('dotenv').config()

let jwtOptions = {
    jwtFromRequest: (req) => {
        return req.cookies.token || null
     },
    secretOrKey: process.env.SECRET,
}

module.exports = (app) => {
    app.use(passport.initialize())

    passport.use(new LocalStrategy({usernameField: "email"}, async (email, password, done) => {
        const user = await User.findOne({where: {email}, raw: true})
        if(!user) return done(null, false)
        if(!user.password) return done(null, false)
        if(!bcrypt.compareSync(password, user.password)) return done(null, false)
        return done(null, user)
    }))

    passport.use('token', new JwtStrategy(jwtOptions, async (jwt_payload, done) => {
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
            callbackURL: "http://localhost:3000/users/google/callback"
        },
        async (accessToken: string, refreshToken: string, profile: any, done) => {
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
            callbackURL: "http://localhost:3000/users/google/connect/callback"
        },
        async (accessToken: string, refreshToken: string, profile: any, done) => {
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

    passport.serializeUser(function(user, done) {
        return done(null, user.id)
    })

    passport.deserializeUser(async function(id, done) {
        try {
            const user = await User.findByPk(id, { raw: true })
            done(null, user)
        } catch (error) {
            console.log(error)
        }
    })
}
