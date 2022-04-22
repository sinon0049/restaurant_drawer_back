const express = require('express')
const router = express.Router()
const db = require('../../models')
const Restaurant = db.Restaurant
const jwt = require('jsonwebtoken')
const passport = require('passport')

router.get('/', passport.authenticate('token', { session: false }), (req, res) => {
    console.log(req.method, req.route.path)
})

router.post('/history', passport.authenticate('token', { session: false }), (req, res) => {
    console.log(req.method, req.route.path)
    console.log(req.body)
    const token = req.header('Authorization').replace('Bearer ', '')
    jwt.verify(token, 'secret', async (err, decoded) => {
        const userId = decoded.id
        if(!req.body) return res.send({status: 'error', message: 'no data'})
        const newRestaurant = { ...req.body, userId }
        await Restaurant.create(newRestaurant)
        return res.send({status: 'success', message: 'data send success'})
    })
})

router.get('/history', passport.authenticate('token', { session: false }), (req, res) => {
    return Restaurant.findAll()
        .then(results => res.send({results}))
})

router.delete('/history/:id', passport.authenticate('token', { session: false }), (req, res) => {
    return Restaurant.findByPk(req.params.id)
        .then(restaurant => {
            if(!restaurant) res.send({status: 'error', message: 'no target data'})
            else restaurant.destroy()
        })
        .then(() => res.send({status: 'success', message: 'data delete success'}))
})

module.exports = router