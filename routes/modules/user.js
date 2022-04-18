const express = require('express')
const router = express.Router()
const bcrypt = require('bcryptjs')
const db = require('../../models')
const User = db.User
const jwt = require('jsonwebtoken')

router.post('/signup', (req, res) => {
    console.log(req.body)
    bcrypt.genSalt(10, function(err, salt) {
        bcrypt.hash(req.body.password, salt, function(err, hash) {
            User.create({
                email: req.body.email,
                password: hash
            })
            res.send({
                status: 'success',
                message: 'signup success'
            })
        })
    })
})

router.post('/signin', async (req, res) => {
    try {
        console.log(req.body)
        if(!req.body.email.trim() || !req.body.password.trim()) return res.json({ status: 'error', message: 'empty email or password' })
        const { email, password } = req.body
        const user = await User.findOne({ where: { email }, raw: true })
        if(!user) return res.status(401).json({ status: 'error', message: 'incorrect email or password' })
        if(!bcrypt.compareSync(password, user.password)) return res.status(401).json({ status: 'error', message: 'incorrect email or password' })
        const payLoad = { id: user.id }
        const token = jwt.sign(payLoad, 'secret')
        return res.json({
            status: 'success',
            message: 'signin success',
            token,
            user: {
                id: user.id,
                email: user.email
            }
        })
    } catch (error) {
        console.log(error)
    }
    
})

module.exports = router