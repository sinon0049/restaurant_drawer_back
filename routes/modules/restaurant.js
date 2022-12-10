const express = require('express')
const router = express.Router()
const db = require('../../models')
const Restaurant = db.Restaurant
const passport = require('passport')

router.post('/', passport.authenticate('token'), async (req, res) => {
    try {
        const payLoad = {
            userId: req.user.id,
            ...req.body
        }
        await Restaurant.create(payLoad)
        return res.json({ status: 'success', message: 'record created successfully'})
    } catch (error) {
        console.log(error)
    }
})

router.get('/', passport.authenticate('token'), async (req, res) => {
    try {
        const userId = req.user.id
        const restaurants = await Restaurant.findAll({
            where: {
                userId
            },
            raw: true,
            order: [['createdAt', 'DESC']]
        })
        return res.json({ status: 'success', message: 'record get successfully', restaurants })
    } catch (error) {
        console.log(error)
    }
})

router.delete('/:restaurantId', passport.authenticate("token"), async (req, res) => {
    try {
        const { restaurantId } = req.params
        const restaurant = await Restaurant.findByPk(restaurantId)
        if(!restaurant) return res.json({ status: 'error', message: 'restaurant doens\'t exist' })
        await restaurant.destroy()
        return res.json({ status: 'success', message: 'restaurant deleted successfully' })
    } catch (error) {
        console.log(error)
    }
})

module.exports = router