const express = require('express')
const router = express.Router()
const db = require('../../models')
const Restaurant = db.Restaurant

router.get('/', (req, res) => {
    console.log(req.method, req.route.path)
})

router.post('/history', (req, res) => {
    console.log(req.method, req.route.path)
    console.log(req.body)
    if(!req.body) return res.send({status: 'error', message: 'no data'})
    return Restaurant.create(req.body)
        .then(() => res.send({status: 'success', message: 'data send success'}))
})

router.get('/history', (req, res) => {
    return Restaurant.findAll()
        .then(results => res.send({results}))
})

router.delete('/history/:id', (req, res) => {
    return Restaurant.findByPk(req.params.id)
        .then(restaurant => {
            if(!restaurant) res.send({status: 'error', message: 'no target data'})
            else restaurant.destroy()
        })
        .then(() => res.send({status: 'success', message: 'data delete success'}))
})

module.exports = router