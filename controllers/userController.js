const bcrypt = require('bcryptjs')
const db = require('../models')
const User = db.User
const jwt = require('jsonwebtoken')
const { OAuth2Client } = require('google-auth-library')
const oauth2Client = new OAuth2Client()
const googleApiUrl = 'https://www.googleapis.com/oauth2/v3/userinfo'

async function getGoogleData (access_token) {
    try {
        oauth2Client.setCredentials({ access_token })
        const { data } = await oauth2Client.request({ url: googleApiUrl })
        return {
            googleId: data.sub,
            name: data.name,
            email: data.email
        }
    } catch (error) {
        console.log(error)
    }
}

module.exports = {
    signUp: async (req, res) => {
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
    },
    signIn: async (req, res) => {
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
    },
    facebookSignIn: async (req, res) => {
        try {
            const facebookId = req.body.facebookId
            let user = await User.findOne({ where: { facebookId }})
            if(!user) user = await User.create(req.body)
            const token = jwt.sign({ id: user.id }, process.env.SECRET)
            return res.json({
                status: 'success',
                message: 'signin success',
                token,
                user: {
                    id: user.dataValues.id,
                    email: user.dataValues.email,
                    name: user.dataValues.name,
                    isPwdSet: user.dataValues.password ? true : false
                }
            })
        } catch (error) {
            console.log(error)
        }
    },
    googleSignIn: async (req, res) => {
        try {
            const googleData = await getGoogleData(req.body.access_token)
            const { googleId } = googleData
            let user = await User.findOne({ where: { googleId }})
            if(!user) user = await User.create(googleData)
            const token = jwt.sign({ id: user.id }, process.env.SECRET)
            return res.json({
                status: 'success',
                message: 'signin success',
                token,
                user: {
                    id: user.dataValues.id,
                    email: user.dataValues.email,
                    name: user.dataValues.name,
                    isPwdSet: user.dataValues.password ? true : false
                }
            })
        } catch (error) {
            console.log(error)
        }
    },
    // OAuthSignUp: async (req, res) => {
    //     try {
    //         const sameUser = await User.findOne({
    //             where: {
    //                 email: req.body.email
    //             }
    //         })
    //         if(sameUser) return res.json({
    //             status: "error",
    //             message: "Please sign in first and connect your account."
    //         })
    //         await User.create({
    //             ...req.body,
    //             password: ''
    //         })
    //         return res.json({
    //             status: "success",
    //             ...req.body
    //         })
    //     } catch (error) {
    //         console.log(error)
    //     }
    // },
    getCurrentUser: async (req, res) => {
        try {
            const userId = req.user.id
            const user = await User.findByPk(userId, { 
                raw: true,
                attributes: ['id', 'email', 'name', 'facebookId', 'googleId', 'password']
            })
            return res.json({
                ...user,
                isPwdSet: user.password ? true : false
            })
        } catch (error) {
            console.log(error)
        }
    },
    updateProfile: async (req, res) => {
        try {
            if(req.body.access_token) {
                const { googleId } = await getGoogleData(req.body.access_token)
                req.body.googleId = googleId
                delete req.body.access_token
            }
            const userId = req.user.id
            const user = await User.findByPk(userId, {
                attributes: ['id', 'name', 'email', 'facebookId', 'googleId']
            })
            await user.update(req.body)
            return res.json({ status: "success", message: "Profile updated successfully.", user })
        } catch (error) {
            console.log(error)
        }
    },
    updatePassword: async (req, res) => {
        try {
            const payLoad = { ...req.body }
            if(!payLoad.currentPwd.trim() && req.user.password) return res.json({ status: 'error', message: 'Please type your password.' })
            if(req.user.password && !bcrypt.compareSync(payLoad.currentPwd, req.user.password)) return res.json({ status: 'error', message: 'Incorrect password.' })
            if(payLoad.newPwd !== payLoad.confirmPwd) return res.json({ status: 'error', message: 'Please confirm your password.' })
            const user = await User.findByPk(req.user.id)
            const salt = await bcrypt.genSalt(10)
            const hash = await bcrypt.hash(payLoad.newPwd, salt)
            await user.update({ password: hash })
            return res.json({status: 'success', message: 'Password updated successfully.'})
        } catch (error) {
            console.log(error)
        }
    },
    connectFacebookAccount: async (req, res) => {
        try {
            const { facebookId } = req.body
            let user = await User.findOne({ where: { facebookId } })
            if(user !== null) return res.json({status: 'error', message: 'Account has been already registered.'})
            user = await User.findByPk(req.user.id, { 
                attributes: ['id', 'name', 'email', 'facebookId', 'googleId']
            })
            await user.update({ facebookId })
            return res.json({status: 'success', message: 'Account connected successfully.', user})
        } catch (error) {
            console.log(error)
        }
    },
    connectGoogleAccount: async (req, res) => {
        try {
            const { googleId } = await getGoogleData(req.body.access_token)
            let user = await User.findOne({ where: { googleId } })
            if(user !== null) return res.json({status: 'error', message: 'Account has been already registered.'})
            user = await User.findByPk(req.user.id, { 
                attributes: ['id', 'name', 'email', 'facebookId', 'googleId']
            })
            await user.update({ googleId })
            return res.json({status: 'success', message: 'Account connected successfully.', user})
        } catch (error) {
            console.log(error)
        }
    }
}