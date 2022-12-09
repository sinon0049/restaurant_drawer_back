const express = require('express')
const router = express.Router()
const bcrypt = require('bcryptjs')
const db = require('../../models')
const User = db.User
const jwt = require('jsonwebtoken')
const passport = require('passport')
const { OAuth2Client } = require('google-auth-library')

async function getGoogleId(access_token) {
    try {
        const url = 'https://www.googleapis.com/oauth2/v3/userinfo'
        const oauth2Client = new OAuth2Client()
        oauth2Client.setCredentials({ access_token })
        return (await oauth2Client.request({url})).data.sub
    } catch (error) {
        console.log(error)
    }
}

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
                name: req.user.name,
                facebookId: req.user.facebookId,
                googleId: req.user.googleId,
                isPwdSet: req.user.password ? true : false,
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
                    name: user.name,
                    isPwdSet: user.dataValues.password ? true : false
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
        const googleId = await getGoogleId(req.body.access_token)
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
                    name: user.name,
                    isPwdSet: user.dataValues.password ? true : false
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
    try {
        const sameUser = await User.findOne({
            where: {
                email: req.body.email
            }
        })
        if(sameUser) return res.json({
            status: "error",
            message: "Please sign in first and connect your account."
        })
        await User.create({
            ...req.body,
            password: ''
        })
        return res.json({
            status: "success",
            ...req.body
        })
    } catch (error) {
        console.log(error)
    }
})

router.get('/current_user', passport.authenticate('token'), async (req, res) => {
    try {
        const userId = req.user.id
        const user = await User.findByPk(userId, { raw: true })
        return res.json({
            ...user,
            isPwdSet: user.password ? true : false
        })
    } catch (error) {
        console.log(error)
    }
})

router.put('/profile', passport.authenticate('token'), async (req, res) => {
    try {
        if(req.body.access_token) {
            const googleId = await getGoogleId(req.body.access_token)
            req.body.googleId = googleId
            delete req.body.access_token
        }
        const userId = req.user.id
        const user = await User.findByPk(userId, {
            attributes: ['id', 'name', 'email', 'facebookId', 'googleId']
        })
        await user.update(req.body)
        return res.json({ status: "success", message: "profile updated successfully", user })
    } catch (error) {
        console.log(error)
    }
})

router.put('/password', passport.authenticate('token'), async (req, res) => {
    try {
        const payLoad = { ...req.body }
        if(!payLoad.currentPwd.trim() && req.user.password) return res.json({ status: 'error', message: 'please type your password' })
        if(req.user.password && !bcrypt.compareSync(payLoad.currentPwd, req.user.password)) return res.json({ status: 'error', message: 'incorrect password' })
        if(payLoad.newPwd !== payLoad.confirmPwd) return res.json({ status: 'error', message: 'please confirm your password' })
        const user = await User.findByPk(req.user.id)
        const salt = await bcrypt.genSalt(10)
        const hash = await bcrypt.hash(payLoad.newPwd, salt)
        await user.update({ password: hash })
        return res.json({status: 'success', message: 'password updated successfully'})
    } catch (error) {
        console.log(error)
    }
})

module.exports = router