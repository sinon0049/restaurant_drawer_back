const express = require('express')
const router = express.Router()
const db = require('../../models')
const Work = db.Work

router.get('/', (req, res) => {
    console.log(req.method, req.route.path)
    const works = Work.findAll()
    res.send({ works })
})

module.exports = router