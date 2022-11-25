const express = require('express')
const router = express.Router()
const bcrypt = require('bcryptjs')
const db = require('../../models')
const User = db.User
const jwt = require('jsonwebtoken')
const passport = require('passport')
const { OAuth2Client } = require('google-auth-library')

router.post('/signup', async (req, res) => {
    try {
        const sameUser = await User.findOne({ where: { email: req.body.email }})
        if(sameUser) return res.json({
            status: 'error',
            message: 'email already exists'
        })
        bcrypt.genSalt(10, function(err, salt) {
            bcrypt.hash(req.body.password, salt, function(err, hash) {
                User.create({
                    email: req.body.email,
                    password: hash,
                    name: req.body.name
                })
                res.json({
                    status: 'success',
                    message: 'signup success'
                })
            })
        })
    } catch (error) {
        console.log(error)
    }
})

router.post('/signin', passport.authenticate('local'), async (req, res) => {
    try {
        const payLoad = { id: req.user.id }
        const token = jwt.sign(payLoad, process.env.SECRET)
        return res.json({
            status: 'success',
            message: 'signin success',
            token,
            user: {
                id: req.user.id,
                email: req.user.email,
                name: req.user.name
            }
        })
    } catch (error) {
        console.log(error)
    }
})

router.post('/fbsignin', async (req, res) => {
    try {
        console.log(req.body.facebookId)
        return res.json({status: "success"})
    } catch (error) {
        console.log(error)
    }
})

router.post('/googlesignin', async (req, res) => {
    try {
        const url = 'https://www.googleapis.com/oauth2/v3/userinfo'
        const oauth2Client = new OAuth2Client()
        oauth2Client.setCredentials({ access_token: req.body.access_token })
        const googleId = (await oauth2Client.request({url})).data.sub
        console.log(googleId)
        return res.json({status: "success"})
    } catch (error) {
        console.log(error)
    }
})

router.get('/get_current_user', passport.authenticate('token', { session: false }), (req, res) => {
    const token = req.get('Authorization').replace('Bearer ', '')
    jwt.verify(token, 'secret', async (err, decoded) => {
        const decodedId = decoded.id
        const user = await User.findByPk(decodedId, { raw: true })
        const { id, name, email } = user
        return res.json({ id, name, email })
    })
})

module.exports = router