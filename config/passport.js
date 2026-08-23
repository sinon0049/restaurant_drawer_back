import passport from "passport"
import { Strategy as LocalStrategy } from "passport-local"
import { Strategy as JwtStrategy } from "passport-jwt"
import { ExtractJwt } from "passport-jwt"
import bcrypt from "bcryptjs"

const db = require('../models')
const User = db.User
require('dotenv').config()

let jwtOptions = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.SECRET,
}

export const usePassport = (app) => {
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
