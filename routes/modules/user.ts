import express from 'express'
import passport from 'passport'
import userController from '../../controllers/userController.js'
import authenticateToken from '../../middleware/authenticateToken.js'

const router = express.Router()

// password signup/signin
router.post('/signup', userController.signUp)
router.post(
    '/signin',
    passport.authenticate('local', {
        session: false 
    }), 
    userController.signIn
)

// Google signin
router.get(
    '/google/signin', 
    passport.authenticate('google-signin', {
        scope: ['profile', 'email'],
        prompt: 'select_account',
        session: false 
    })
)
router.get(
    '/google/signin/callback',
    passport.authenticate('google-signin', {
        session: false 
    }),
    userController.oauthSigninCallback
)

// Google connect
router.get(
    '/google/connect',
    authenticateToken,
    userController.saveConnectInitiator('google'),
    passport.authenticate('google-connect', {
        scope: ['profile'],
        prompt: 'select_account',
        session: false 
    })
)
router.get(
    '/google/connect/callback', 
    authenticateToken, 
    passport.authenticate('google-connect', {
        session: false, 
        assignProperty: 'oauthUser' 
    }),
    userController.oauthConnectCallback('google')
)

// Facebook signin
router.get(
    '/facebook/signin',
    passport.authenticate('facebook-signin', {
        scope: ['email'], 
        session: false 
    })
)
router.get(
    '/facebook/signin/callback',
    passport.authenticate('facebook-signin', {
        session: false 
    }),
    userController.oauthSigninCallback
)

// Facebook connect
router.get(
    '/facebook/connect',
    authenticateToken,
    userController.saveConnectInitiator('facebook'),
    passport.authenticate('facebook-connect', {
        session: false 
    })
)
router.get(
    '/facebook/connect/callback',
    authenticateToken,
    passport.authenticate('facebook-connect', {
        session: false, 
        assignProperty: 'oauthUser' 
    }),
    userController.oauthConnectCallback('facebook')
)

// Disconnect account
router.post('/oauth/disconnect', authenticateToken, userController.oauthDisconnect)

router.post('/signout', userController.signOut)

router.get('/current_user', authenticateToken, userController.getCurrentUser)
router.put('/profile', authenticateToken, userController.updateProfile)
router.put('/password', authenticateToken, userController.updatePassword)

export default router
