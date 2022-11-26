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

router.post('/facebooksignin', async (req, res) => {
    try {
        const facebookId = req.body.facebookId
        const user = await User.findOne({ where: { facebookId }})
        if(user) {
            const token = jwt.sign({ id: user.id }, process.env.SECRET)
            return res.json({
                status: 'success',
                message: 'signin success',
                token,
                user: {
                    id: user.id,
                    email: user.email,
                    name: user.name
                }
            })
        } else {
            return res.json({
                status: "error",
                message: "please sign up",
                facebookId
            })
        }
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
        const user = await User.findOne({ where: { googleId }})
        if(user) {
            const token = jwt.sign({ id: user.id }, process.env.SECRET)
            return res.json({
                status: 'success',
                message: 'signin success',
                token,
                user: {
                    id: user.id,
                    email: user.email,
                    name: user.name
                }
            })
        } else {
            return res.json({
                status: "error",
                message: "please sign up",
                googleId
            })
        }
    } catch (error) {
        console.log(error)
    }
})

router.post('/oauthsignup', async (req, res) => {
    const sameUser = await User.findOne({
        where: {
            email: req.body.email
        }
    })
    if(sameUser) return res.json({
        status: "error",
        message: "Please sign in first and connect your account."
    })
    const randomPwd = Math.random().toString(36).slice(-8)
    const salt = await bcrypt.genSalt(10)
    const password = await bcrypt.hash(randomPwd, salt)
    await User.create({
        ...req.body,
        password
    })
    return res.json({
        status: "success",
        ...req.body
    })
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