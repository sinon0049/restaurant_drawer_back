const express = require('express')
const router = express.Router()
const db = require('../../models')
const Work = db.Work
const passport = require('passport')
const jwt = require('jsonwebtoken')

router.get('/', passport.authenticate('token', { session: false }), (req, res) => {
    return Work.findAll()
        .then(works => {
            return res.send({ works })
        })
})

router.put('/:id', passport.authenticate('token', { session: false }), (req, res) => {
    if(!req.body) return res.send({ status: 'error', message: 'no data transmitted' })
    return Work.findByPk(req.params.id)
        .then(work => work.update(req.body))
        .then(() => res.send({ status: 'success', message: 'work update success' }))
})

router.post('/', passport.authenticate('token', { session: false }), (req, res) => {
    if(!req.body) return res.send({ status: 'error', message: 'no data transmitted' })
    const token = req.header('Authorization').replace('Bearer ', '')
    jwt.verify(token, 'secret', (err, decoded) => {
        const newWork = { ...req.body, userId: decoded.id}
        return Work.create(newWork)
        .then(() => res.send({ status: 'success', message: 'work update success' }))
    })
})

router.delete('/:id', passport.authenticate('token', { session: false }), (req, res) => {
    return Work.findByPk(req.params.id)
        .then(work => work.destroy())
        .then(() => res.send({ status: 'success', message: 'work delete success' }))
})

router.post('/done/:id', passport.authenticate('token', { session: false }), (req, res) => {
    return Work.findByPk(req.params.id)
        .then(work => work.update(req.body))
        .then(() => res.send({ status: 'success', message: 'work done success' }))
})

module.exports = router