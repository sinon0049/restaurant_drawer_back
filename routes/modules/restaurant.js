const express = require('express')
const router = express.Router()
const db = require('../../models')
const Restaurant = db.Restaurant
const Favorite = db.FavoriteRestaurant
const jwt = require('jsonwebtoken')
const passport = require('passport')
const user = require('../../models/user')

router.post('/history', passport.authenticate('token', { session: false }), async (req, res) => {
    const userId = req.user.id
    if(!req.body) return res.send({status: 'error', message: 'no data'})
    const newRestaurant = { ...req.body, userId }
    await Restaurant.create(newRestaurant)
    return res.send({status: 'success', message: 'data send success'})
})

router.get('/history', passport.authenticate('token', { session: false }), async (req, res) => {
    const userId = req.user.id
    const favorites = await Favorite.findAll({ where: { userId }, raw: true })
    const favoritesInArray = favorites.map(f => {return f.restaurantId})
    const restaurants = await Restaurant.findAll({ where: { userId }, raw: true })
    const results = restaurants.map(r => {
        return {
            ...r, 
            isFavorited: favoritesInArray.includes(r.id)
        }
    })
    return res.send({results})
})

router.delete('/history/:id', passport.authenticate('token', { session: false }), async (req, res) => {
    const userId = req.user.id
    const restaurant = await Restaurant.findByPk(req.params.id)
    if(restaurant.dataValues.userId !== userId) return res.send({status: 'error', message: 'incorrect user'})
    if(!Restaurant) return res.send({status: 'error', message: 'no target data'})
    restaurant.destroy()
    return  res.send({status: 'success', message: 'restaurant delete success'})
})

router.post('/history/togglefavorite/:id', passport.authenticate('token', { session: false }), async (req, res) => {
    try {
        const userId = req.user.id
        const restaurantId = Number(req.params.id)
        const { isFavorited } = req.body
        if(isFavorited === true) {
            const newData = { restaurantId, userId }
            await Favorite.create(newData)
            return res.send({ status: 'success', message: 'create favorite success'})
        }
        const favorite = await Favorite.findOne({ where: { userId, restaurantId }})
        await favorite.destroy()
        return res.send({ status: 'success', message: 'delete favorite success'})
    } catch (error) {
        console.log(error)
    }
})

module.exports = router