const express = require('express')
const router = express.Router()
const passport = require('passport')
const userController = require('../../controllers/userController')

router.post('/signup', userController.signUp)
router.post('/signin', passport.authenticate('local'), userController.signIn)
router.post('/facebooksignin', userController.facebookSignIn)
router.get('/current_user', passport.authenticate('token'), userController.getCurrentUser)
router.put('/profile', passport.authenticate('token'), userController.updateProfile)
router.put('/password', passport.authenticate('token'), userController.updatePassword)
router.put('/fbaccount', passport.authenticate('token'), userController.connectFacebookAccount)
router.put('/gaccount', passport.authenticate('token'), userController.connectGoogleAccount)


router.get('/google/signin', passport.authenticate('google-signin', { scope: ['profile', 'email'], prompt: 'select_account' }))
router.get('/google/signin/callback', passport.authenticate('google-signin'), userController.googleSigninCallback)

router.get('/google/connect', passport.authenticate('google-connect', { scope: ['profile'], prompt: 'select_account' }))
router.get('/google/connect/callback', passport.authenticate('google-connect'), userController.googleConnectCallback)

router.get('/facebook/signin', passport.authenticate('facebook-signin', { scope: ['email'] }))
router.get('/facebook/signin/callback', passport.authenticate('facebook-signin'), userController.facebookSigninCallback)

router.get('/facebook/connect', passport.authenticate('facebook-connect'))
router.get('/facebook/connect/callback', passport.authenticate('facebook-connect'), userController.facebookConnectCallback)

router.post('/signout', userController.signOut)

module.exports = router