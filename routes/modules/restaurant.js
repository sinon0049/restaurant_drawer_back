const express = require('express')
const router = express.Router()
const db = require('../../models')
const Restaurant = db.Restaurant
const jwt = require('jsonwebtoken')
const passport = require('passport')

router.post('/history', passport.authenticate('token', { session: false }), async (req, res) => {
    const userId = req.user.id
    if(!req.body) return res.send({status: 'error', message: 'no data'})
    const newRestaurant = { ...req.body, userId }
    await Restaurant.create(newRestaurant)
    return res.send({status: 'success', message: 'data send success'})
})

router.get('/history', passport.authenticate('token', { session: false }), async (req, res) => {
    const userId = req.user.id
    const results = await Restaurant.findAll({ where: { userId }})
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

module.exports = router