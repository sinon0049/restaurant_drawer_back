const bcrypt = require('bcryptjs')
const db = require('../models')
const User = db.User
const jwt = require('jsonwebtoken')
const { OAuth2Client } = require('google-auth-library')
const oauth2Client = new OAuth2Client()
const googleApiUrl = 'https://www.googleapis.com/oauth2/v3/userinfo'

import type { Request, Response } from "express"

const optCookie = {
    httpOnly: true,
    sameSite: 'Lax',
}

async function getGoogleData (access_token: string): Promise<any> {
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
    signUp: async (req: Request, res: Response) => {
        try {
            const { email, password, name, confirmPassword } = req.body
            const existingUser = await User.findOne({ where: { email }})

            if(existingUser) {
                return res.status(409).json({
                    status: 'error',
                    message: 'Email already used'
                })
            }

            if(password !== confirmPassword) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Passwords do not match'
                })
            }
            
            const hash = await bcrypt.hash(password, 10)
            const newUser = await User.create({
                email, name, password: hash
            })

            return res.status(201).json({
                status: 'success',
                message: 'Sign up successfully',
                user: newUser
            })
        } catch (error) {
            res.status(500).json({
                status: 'error',
                message: 'Internal server error.'
            })
        }
    },
    signIn: async (req: Request, res: Response) => {
        try {
            console.log(req.body)
            const { id, email, name, facebookId, googleId, password } = req.user!
            const payLoad = { id }
            const token = jwt.sign(payLoad, process.env.SECRET)
            res.cookie('token', token, optCookie)
            return res.status(200).json({
                status: 'success',
                message: 'Sign in successfully',
                token,
                user: {
                    id, email, name, facebookId, googleId,
                    isPwdSet: password ? true : false,
                }
            })
        } catch (error) {
            res.status(500).json({
                status: 'error',
                message: 'Internal server error.'
            })
        }
    },
    facebookSignIn: async (req: Request, res: Response) => {
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
            res.status(500).json({
                status: 'error',
                message: 'Internal server error.'
            })
        }
    },
    googleSignIn: async (req: Request, res: Response) => {
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
            res.status(500).json({
                status: 'error',
                message: 'Internal server error.'
            })
        }
    },
    getCurrentUser: async (req: Request, res: Response) => {
        try {
            const { id } = req.user!
            const user = await User.findByPk(id, { 
                raw: true,
                attributes: ['id', 'email', 'name', 'facebookId', 'googleId', 'password']
            })
            return res.json({
                ...user,
                isPwdSet: user.password ? true : false
            })
        } catch (error) {
            res.status(500).json({
                status: 'error',
                message: 'Internal server error.'
            })
        }
    },
    updateProfile: async (req: Request, res: Response) => {
        try {
            console.log(req.body)
            if(req.body.access_token) {
                const { googleId } = await getGoogleData(req.body.access_token)
                req.body.googleId = googleId
                delete req.body.access_token
            }

            const currentUser = req.user!
            const userId = currentUser.id
            const user = await User.findByPk(userId, {
                attributes: ['id', 'name', 'email', 'facebookId', 'googleId']
            })
            await user.update(req.body)
            return res.json({ status: "success", message: "Profile updated successfully.", user })
        } catch (error) {
            res.status(500).json({
                status: 'error',
                message: 'Internal server error.'
            })
        }
    },
    updatePassword: async (req: Request, res: Response) => {
        try {
            const { currentPassword, newPassword, confirmPassword } = req.body
            const { password: pwdHash, id } = req.user!

            // Have password in db but currentPassword is empty 
            if(pwdHash && !currentPassword.trim()) {
                return res.status(400).json({ 
                    status: 'error', 
                    message: 'Please type your password.' 
                })
            }
            // Have password but do not match currentPassword 
            if(pwdHash && !await bcrypt.compareSync(currentPassword, pwdHash)) {
                return res.status(400).json({ 
                    status: 'error', 
                    message: 'Incorrect password.' 
                })
            }
            // Confirm failed
            if(newPassword !== confirmPassword) {
                return res.status(400).json({ 
                    status: 'error', 
                    message: 'Please confirm your password.' 
                })
            }

            const newHash = await bcrypt.hash(newPassword, 10)
            await User.update({ password: newHash }, { 
                where: { id }
            })
            return res.status(200).json({
                status: 'success', 
                message: 'Password updated successfully.'
            })
        } catch (error) {
            res.status(500).json({
                status: 'error',
                message: 'Internal server error.'
            })
        }
    },
    connectFacebookAccount: async (req: Request, res: Response) => {
        try {
            const { facebookId } = req.body
            const currentUser = req.user!
            let user = await User.findOne({ where: { facebookId } })
            if(user !== null) return res.json({status: 'error', message: 'Account has been already registered.'})
            user = await User.findByPk(currentUser.id, { 
                attributes: ['id', 'name', 'email', 'facebookId', 'googleId']
            })
            await user.update({ facebookId })
            return res.json({status: 'success', message: 'Account connected successfully.', user})
        } catch (error) {
            res.status(500).json({
                status: 'error',
                message: 'Internal server error.'
            })
        }
    },
    connectGoogleAccount: async (req: Request, res: Response) => {
        try {
            const currentUser = req.user!
            const { googleId } = await getGoogleData(req.body.access_token)
            let user = await User.findOne({ where: { googleId } })
            if(user !== null) return res.json({status: 'error', message: 'Account has been already registered.'})
            user = await User.findByPk(currentUser.id, { 
                attributes: ['id', 'name', 'email', 'facebookId', 'googleId']
            })
            await user.update({ googleId })
            return res.json({status: 'success', message: 'Account connected successfully.', user})
        } catch (error) {
            res.status(500).json({
                status: 'error',
                message: 'Internal server error.'
            })
        }
    },
    googleSigninCallback: async (req: Request, res: Response) => {
        try {
            const payLoad = { id: req.user!.id }
            const token = jwt.sign(payLoad, process.env.SECRET)
            return res.redirect(`http://localhost:5173/oauth/callback?token=${token}`)
        } catch (error) {
            res.status(500).json({
                status: 'error',
                message: 'Internal server error.'
            })
        }
    },
    googleConnectCallback: async (req: Request, res: Response) => {
        try {
            const payLoad = { id: req.user!.id }
            const token = jwt.sign(payLoad, process.env.SECRET)
            return res.redirect(`https://localhost:5173/oauth/callback?token=${token}`)
        } catch (error) {
            res.status(500).json({
                status: 'error',
                message: 'Internal server error.'
            })
        }
    }
}