import express from 'express'
import passport from 'passport'
import restaurantController from '../../controllers/restaurantController.js'

const router = express.Router()

router.get('/', passport.authenticate('token', { session: false }), restaurantController.getRecord)
router.delete('/:restaurantId', passport.authenticate("token", { session: false }), restaurantController.deleteRecord)
router.post('/draw', passport.authenticate("token", { session: false }), restaurantController.drawRandomRestaurant)

export default router
