const express = require('express')
const router = express.Router()
const passport = require('passport')
const userController = require('../../controllers/userController')

// password signup/signin
router.post('/signup', userController.signUp)
router.post('/signin', passport.authenticate('local', { session: false }), userController.signIn)

// Google signin
router.get('/google/signin', passport.authenticate('google-signin', { scope: ['profile', 'email'], prompt: 'select_account', session: false }))
router.get('/google/signin/callback', passport.authenticate('google-signin', { session: false }), userController.oauthSigninCallback)

// Google connect
router.get('/google/connect', passport.authenticate('google-connect', { scope: ['profile'], prompt: 'select_account', session: false }))
router.get('/google/connect/callback', passport.authenticate('google-connect', { session: false }), userController.oauthConnectCallback)

// Facebook signin
router.get('/facebook/signin', passport.authenticate('facebook-signin', { scope: ['email'], session: false }))
router.get('/facebook/signin/callback', passport.authenticate('facebook-signin', { session: false }), userController.oauthSigninCallback)

// Facebook connect
router.get('/facebook/connect', passport.authenticate('facebook-connect', { session: false }))
router.get('/facebook/connect/callback', passport.authenticate('facebook-connect', { session: false }), userController.oauthConnectCallback)

// Disconnect account
router.post('/oauth/disconnect', passport.authenticate('token', { session: false }), userController.oauthDisconnect)

router.post('/signout', userController.signOut)

router.get('/current_user', passport.authenticate('token', { session: false }), userController.getCurrentUser)
router.put('/profile', passport.authenticate('token', { session: false }), userController.updateProfile)
router.put('/password', passport.authenticate('token', { session: false }), userController.updatePassword)

module.exports = router