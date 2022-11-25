const express = require('express')
const router = express.Router()
const restaurant = require('./modules/restaurant')
const user = require('./modules/user')

router.use('/restaurants', restaurant)
router.use('/users', user)

module.exports = router