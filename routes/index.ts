import express from 'express'
import restaurant from './modules/restaurant.js'
import user from './modules/user.js'

const router = express.Router()

router.use('/restaurants', restaurant)
router.use('/users', user)

export default router
