const express = require('express')
const router = express.Router()
const home = require('./modules/restaurant')
const restaurant = require('./modules/home')
const work = require('./modules/work')

router.use('/', home)
router.use('/restaurant', restaurant)
router.use('/worklist', work)

module.exports = router