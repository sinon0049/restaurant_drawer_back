const express = require('express')
const router = express.Router()
const db = require('../../models')
const Work = db.Work
const passport = require('passport')
const jwt = require('jsonwebtoken')

router.get('/', passport.authenticate('token', { session: false }), async (req, res) => {
    try {
        const userId = req.user.id
        const works = await Work.findAll({ where: { userId }, order: [['isDone', 'ASC'], ['dueDate', 'ASC']]})
        return res.send({ works })
    } catch (error) {
        console.log(error)
    }
})

router.put('/:id', passport.authenticate('token', { session: false }), async (req, res) => {
    try {
        if(!req.body) return res.send({ status: 'error', message: 'no data transmitted' })
        const userId = req.user.id
        const work = await Work.findByPk(req.params.id)
        if(work.dataValues.userId !== userId) {
            return res.send({ status: 'error', message: 'oops! you are not the author!'})
        }
        await work.update(req.body)
        return res.send({ status: 'success', message: 'work update success' })
    } catch (error) {
        console.log(error)
    }
    
})

router.post('/', passport.authenticate('token', { session: false }), async (req, res) => {
    try {
        if(!req.body) return res.send({ status: 'error', message: 'no data transmitted' })
        const userId = req.user.id
        const newWork = {
            ...req.body,
            userId
        }
        await Work.create(newWork)
        return res.send({ status: 'success', message: 'work create success' })
    } catch (error) {
        console.log(error)
    }
})

router.delete('/:id', passport.authenticate('token', { session: false }),  async (req, res) => {
    try {
        const userId = req.user.id
        const work = await Work.findByPk(req.params.id)
        if(work.dataValues.userId !== userId) return res.send({ status: 'error', message: 'oops! you are not the author!'})
        await work.destroy(req.body)
        res.send({ status: 'success', message: 'work delete success' })
    } catch (error) {
        console.log(error)
    }
})

router.post('/done/:id', passport.authenticate('token', { session: false }), async (req, res) => {
    try {
        const userId = req.user.id
        const work = await Work.findByPk(req.params.id)
        if(work.dataValues.userId !== userId) return res.send({ status: 'error', message: 'oops! you are not the author!'})
        work.update(req.body)
        res.send({ status: 'success', message: 'work done success' })
    } catch (error) {
        console.log(error)
    }
})

module.exports = router