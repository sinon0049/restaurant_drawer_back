const express = require('express')
const router = express.Router()
const db = require('../../models')
const Work = db.Work
const passport = require('passport')
const jwt = require('jsonwebtoken')

//.then style
router.get('/', passport.authenticate('token', { session: false }), (req, res) => {
    const token = req.header('Authorization').replace('Bearer ', '')
    jwt.verify(token, 'secret', (err, decoded) => {
        const userId = decoded.id
        return Work.findAll({ where: { userId }})
        .then(works => {
            return res.send({ works })
        })
    })
})

router.put('/:id', passport.authenticate('token', { session: false }), (req, res) => {
    if(!req.body) return res.send({ status: 'error', message: 'no data transmitted' })
    const token = req.header('Authorization').replace('Bearer ', '')
    jwt.verify(token, 'secret', async (err, decoded) => {
        try {
            const userId = decoded.id
            const work = await Work.findByPk(req.params.id)
            if(work.dataValues.userId !== userId) return res.send({ status: 'error', message: 'oops! you are not the author!'})
            work.update(req.body)
            res.send({ status: 'success', message: 'work update success' })
        } catch (error) {
            console.log(error)
        }
    })
})

//.then style
router.post('/', passport.authenticate('token', { session: false }), (req, res) => {
    if(!req.body) return res.send({ status: 'error', message: 'no data transmitted' })
    const token = req.header('Authorization').replace('Bearer ', '')
    jwt.verify(token, 'secret', (err, decoded) => {
        const newWork = { ...req.body, userId: decoded.id}
        return Work.create(newWork)
        .then(() => res.send({ status: 'success', message: 'work create success' }))
    })
})

router.delete('/:id', passport.authenticate('token', { session: false }),  async (req, res) => {
    try {
        const token = req.header('Authorization').replace('Bearer ', '')
        jwt.verify(token, 'secret', async (err, decoded) => {
            try {
                const userId = decoded.id
                const work = await Work.findByPk(req.params.id)
                if(work.dataValues.userId !== userId) return res.send({ status: 'error', message: 'oops! you are not the author!'})
                work.destroy(req.body)
                res.send({ status: 'success', message: 'work delete success' })
            } catch (error) {
                console.log(error)
            }
        })
    } catch (error) {
        console.log(error)
    }
})

router.post('/done/:id', passport.authenticate('token', { session: false }), async (req, res) => {
    try {
        const token = req.header('Authorization').replace('Bearer ', '')
        jwt.verify(token, 'secret', async (err, decoded) => {
            try {
                const userId = decoded.id
                const work = await Work.findByPk(req.params.id)
                if(work.dataValues.userId !== userId) return res.send({ status: 'error', message: 'oops! you are not the author!'})
                work.update(req.body)
                res.send({ status: 'success', message: 'work done success' })
            } catch (error) {
                console.log(error)
            }
        })
    } catch (error) {
        console.log(error)
    }
})

module.exports = router