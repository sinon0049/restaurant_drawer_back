const express = require('express')
const router = express.Router()

router.get('/', (req, res) => {
    console.log(req.method, req.route.path)
})

module.exports = router