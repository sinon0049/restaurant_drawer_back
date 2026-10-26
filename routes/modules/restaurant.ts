const express = require('express')
const router = express.Router()
const passport = require('passport')
const restaurantController = require('../../controllers/restaurantController')

router.get('/', passport.authenticate('token', { session: false }), restaurantController.getRecord)
router.delete('/:restaurantId', passport.authenticate("token", { session: false }), restaurantController.deleteRecord)
router.post('/draw', passport.authenticate("token", { session: false }), restaurantController.drawRandomRestaurant)

module.exports = router