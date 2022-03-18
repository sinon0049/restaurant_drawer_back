const express = require('express')
const { path } = require('express/lib/application')
const router = express.Router()

router.get('/', (req, res) => {
    console.log(req.method, req.route.path)
})

module.exports = router