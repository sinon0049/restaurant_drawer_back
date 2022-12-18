const express = require('express')
const router = express.Router()
const passport = require('passport')
const restaurantController = require('../../controllers/restaurantController')

router.post('/', passport.authenticate('token'), restaurantController.createRecord)
router.get('/', passport.authenticate('token'), restaurantController.getRecord)
router.delete('/:restaurantId', passport.authenticate("token"), restaurantController.deleteRecord)

module.exports = router