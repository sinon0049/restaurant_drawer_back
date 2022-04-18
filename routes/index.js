const express = require('express')
const router = express.Router()
const home = require('./modules/home')
const restaurant = require('./modules/restaurant')
const work = require('./modules/work')
const user = require('./modules/user')

router.use('/restaurants', restaurant)
router.use('/worklist', work)
router.use('/users', user)
router.use('/', home)

module.exports = router