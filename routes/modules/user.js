const express = require('express')
const router = express.Router()
const passport = require('passport')
const userController = require('../../controllers/userController')

router.post('/signup', userController.signUp)
router.post('/signin', passport.authenticate('local'), userController.signIn)
router.post('/facebooksignin', userController.facebookSignIn)
router.post('/googlesignin', userController.googleSignIn)
router.get('/current_user', passport.authenticate('token'), userController.getCurrentUser)
router.put('/profile', passport.authenticate('token'), userController.updateProfile)
router.put('/password', passport.authenticate('token'), userController.updatePassword)
router.put('/fbaccount', passport.authenticate('token'), userController.connectFacebookAccount)
router.put('/gaccount', passport.authenticate('token'), userController.connectGoogleAccount)

module.exports = router