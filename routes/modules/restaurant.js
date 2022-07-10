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
    const favorite = await Favorite.findOne({ where: { placeId: req.body.placeId }})
    if(favorite){
        favorite.update({ lastVisit: new Date()})       
    }
    return res.send({status: 'success', message: 'data send success'})
})

router.get('/history', passport.authenticate('token', { session: false }), async (req, res) => {
    const userId = req.user.id
    const favorites = await Favorite.findAll({ where: { userId }, raw: true })
    const favoritesInArray = favorites.map(f => {return f.placeId})
    const restaurants = await Restaurant.findAll({ where: { userId }, raw: true, order: [['createdAt', 'DESC']] })
    const results = restaurants.map(r => {
        return {
            ...r, 
            isFavorited: favoritesInArray.includes(r.placeId)
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
        const newData = { ...req.body, userId }
        const favorite = await Favorite.findOne({ where: { userId, placeId: newData.placeId }})
        if(!favorite) {
            await Favorite.create(newData)
            return res.send({ status: 'success', message: 'create favorite success'})
        }
        await favorite.destroy()
        return res.send({ status: 'success', message: 'delete favorite success'})
    } catch (error) {
        console.log(error)
    }
})

router.get('/favorite', passport.authenticate('token', { session: false }), async (req, res) => {
    try {
        const userId = req.user.id
        const results = await Favorite.findAll({ where: { userId }, raw: true })
        res.send(results)
    } catch (error) {
        console.log(error)
    }
})

module.exports = router