const express = require('express')
const router = express.Router()
const db = require('../../models')
const Work = db.Work

router.get('/', (req, res) => {
    return Work.findAll()
        .then(works => {
            return res.send({ works })
        })
})

router.put('/:id', (req, res) => {
    if(!req.body) return res.send({ status: 'error', message: 'no data transmitted' })
    return Work.findByPk(req.params.id)
        .then(work => work.update(req.body))
        .then(() => res.send({ status: 'success', message: 'work update success' }))
})

router.post('/', (req, res) => {
    if(!req.body) return res.send({ status: 'error', message: 'no data transmitted' })
    return Work.create(req.body)
        .then(() => res.send({ status: 'success', message: 'work update success' }))
})

router.delete('/:id', (req, res) => {
    return Work.findByPk(req.params.id)
        .then(work => work.destroy())
        .then(() => res.send({ status: 'success', message: 'work delete success' }))
})

router.post('/done/:id', (req, res) => {
    return Work.findByPk(req.params.id)
        .then(work => work.update(req.body))
        .then(() => res.send({ status: 'success', message: 'work done success' }))
})

module.exports = router