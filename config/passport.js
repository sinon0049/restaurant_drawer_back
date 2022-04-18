const passport = require('passport')
const JwtStrategy = require('passport-jwt').Strategy
const ExtractJwt = require('passport-jwt').ExtractJwt
const db = require('../models')
const bcrypt = require('bcryptjs')
const User = db.User

let jwtOptions = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: 'secret',
}

module.exports = (app) => {
    app.use(passport.initialize())

    passport.use('token', new JwtStrategy(jwtOptions, async (jwt_payload, done) => {
        try {
            const user = User.findByPk(jwt_payload.id)
            if(!user) return done(null, false)
            return done(null, user)
        } catch (error) {
            console.log(error)
        }
        
    }))
}
