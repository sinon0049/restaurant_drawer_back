import bcrypt from 'bcryptjs'
import db from '../models/index.js'
import jwt from 'jsonwebtoken'
import type { CookieOptions, NextFunction, Request, Response } from 'express'
import { generateCsrfToken } from '../utils/generateCsrftoken.js'

const User = db.User

const optCookie: CookieOptions = {
    httpOnly: true,
    sameSite: "none",
    secure: true,
    maxAge: 60 * 60 * 1000,
    path: '/'
}

type OAuthProvider = 'google' | 'facebook'

const userController = {
    signUp: async (req: Request, res: Response, next: NextFunction) => {
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
            next(error)
        }
    },
    signIn: async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { id, email, name, facebookId, googleId, password } = req.user!
            const payLoad = { id }
            const token = jwt.sign(payLoad, process.env.SECRET!, { expiresIn: '1h' })
            req.session.regenerate((err) => {
                if(err) return next(err)
                req.session.csrfToken = generateCsrfToken()
                res.cookie('accessToken', token, optCookie)
                return res.status(200).json({
                    status: 'success',
                    message: 'Sign in successfully',
                    user: {
                        id, email, name, facebookId, googleId,
                        isPwdSet: password ? true : false,
                    },
                    csrfToken: req.session.csrfToken
                })
            })
        } catch (error) {
            next(error)
        }
    },
    signOut: async (req: Request, res: Response, next: NextFunction) => {
        try {
            req.session.regenerate((err) => {
                if(err) return next(err)
                req.session.csrfToken = generateCsrfToken()
                res.clearCookie('accessToken', optCookie)
                res.status(200).json({
                    status: 'success',
                    message: 'Sign out successfully',
                    csrfToken: req.session.csrfToken
                })
            }) 
        } catch (error) {
            next(error)
        }
    },
    getCurrentUser: async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { id } = req.user!
            const user = await User.findByPk(id, { 
                raw: true,
                attributes: ['id', 'email', 'name', 'facebookId', 'googleId', 'password']
            })

            if (!user) {
                return res.status(404).json({ status: 'error', message: 'User not found' })
            }

            const { password, ...safeUser } = user

            return res.json({
                ...safeUser,
                isPwdSet: Boolean(password)
            })
        } catch (error) {
            next(error)
        }
    },
    updateProfile: async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { id } = req.user!
            await User.update(
                req.body,
                {
                    where: {
                        id
                    },
                }
            )

            return res.status(200).json({ 
                status: "success",
                message: "Profile updated successfully."
            })
        } catch (error) {
            next(error)
        }
    },
    updatePassword: async (req: Request, res: Response, next: NextFunction) => {
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
            next(error)
        }
    },
    oauthSigninCallback: async (req: Request, res: Response, next: NextFunction) => {
        try {
            const payLoad = { id: req.user!.id }
            const token = jwt.sign(payLoad, process.env.SECRET!, { expiresIn: '1h' })
            res.cookie('accessToken', token, optCookie)
            return res.redirect(`${process.env.FRONTEND_URL}/oauth/signin/callback`)
        } catch (error) {
            next(error)
        }
    },
    oauthConnectCallback: (provider: OAuthProvider) => {
        return async (req: Request, res: Response, next: NextFunction) => {
            try {
                // check userId and provider stored in saveConnectInitiator function
                if(req.user === undefined
                    || req.session.oauthConnect === undefined 
                    || req.oauthUser === undefined
                    || req.user.id !== req.session.oauthConnect.userId
                    || provider !== req.session.oauthConnect.provider
                ) {
                    return res.sendStatus(403)
                }

                const data = req.oauthUser

                if(await User.findOne({ where: data })) {
                    delete req.session.oauthConnect
                    return res.redirect(`${process.env.FRONTEND_URL}/oauth/connect/callback?status=ACCOUNT_ALREADY_CONNECTED`)
                }

                const userId = req.user.id
                await User.update(
                    data,
                    {
                        where: {
                            id: userId
                        }
                    }
                )
                delete req.session.oauthConnect
                return res.redirect(`${process.env.FRONTEND_URL}/oauth/connect/callback?status=SUCCESS`)
            } catch (error) {
                next(error)
            }
        }
    },
    oauthDisconnect: async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { id } = req.user!
            await User.update(
                req.body,
                {
                    where: {
                        id
                    }
                }
            )

            return res.status(200).json({
                status: 'success',
                message: 'Account disconnected successfully'
            })
        } catch (error) {
            next(error)
        }
    },
    // save userId and oauth provider when oauth-connecting
    saveConnectInitiator: (provider: OAuthProvider) => {
        return (req: Request, res: Response, next: NextFunction) => {
            if(!req.user) {
                return res.status(401).json({
                    status: 'error',
                    message: 'Unauthorized',
                })
            }
            req.session.oauthConnect = {
                userId: req.user.id,
                provider
            }
            req.session.save(next)
        }
    },
    getCsrfToken: (req: Request, res: Response) => {
        if(!req.session.csrfToken) {
            req.session.csrfToken = generateCsrfToken()
        }

        return res.json({
            csrfToken: req.session.csrfToken
        })
    }
}

export default userController
