const express = require('express')
const router = express.Router()
const passport = require('passport')
const userController = require('../../controllers/userController')

router.post('/signup', userController.signUp)
router.post('/signin', passport.authenticate('local', { session: false }), userController.signIn)
router.post('/facebooksignin', userController.facebookSignIn)
router.get('/current_user', passport.authenticate('token', { session: false }), userController.getCurrentUser)
router.put('/profile', passport.authenticate('token', { session: false }), userController.updateProfile)
router.put('/password', passport.authenticate('token', { session: false }), userController.updatePassword)

router.get('/google/signin', passport.authenticate('google-signin', { scope: ['profile', 'email'], prompt: 'select_account', session: false }))
router.get('/google/signin/callback', passport.authenticate('google-signin', { session: false }), userController.oauthSigninCallback)

router.get('/google/connect', passport.authenticate('google-connect', { scope: ['profile'], prompt: 'select_account', session: false }))
router.get('/google/connect/callback', passport.authenticate('google-connect', { session: false }), userController.oauthConnectCallback)

router.get('/facebook/signin', passport.authenticate('facebook-signin', { scope: ['email'], session: false }))
router.get('/facebook/signin/callback', passport.authenticate('facebook-signin', { session: false }), userController.oauthSigninCallback)

router.get('/facebook/connect', passport.authenticate('facebook-connect', { session: false }))
router.get('/facebook/connect/callback', passport.authenticate('facebook-connect', { session: false }), userController.oauthConnectCallback)

router.post('/signout', userController.signOut)

module.exports = router