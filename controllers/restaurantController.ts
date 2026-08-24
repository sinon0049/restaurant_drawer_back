const db = require('../models')
const Restaurant = db.Restaurant

module.exports = {
    createRecord: async (req, res) => {
        try {
            const payLoad = {
                userId: req.user.id,
                ...req.body
            }
            await Restaurant.create(payLoad)
            return res.json({ status: 'success', message: 'record created successfully'})
        } catch (error) {
            console.log(error)
        }
    },
    getRecord: async (req, res) => {
        try {
            const userId = req.user.id
            const restaurants = await Restaurant.findAll({
                where: {
                    userId
                },
                raw: true,
                order: [['createdAt', 'DESC']]
            })
            return res.json({ status: 'success', message: 'record get successfully', restaurants })
        } catch (error) {
            console.log(error)
        }
    },
    deleteRecord: async (req, res) => {
        try {
            const { restaurantId } = req.params
            const restaurant = await Restaurant.findByPk(restaurantId)
            if(!restaurant) return res.json({ status: 'error', message: 'restaurant doens\'t exist' })
            await restaurant.destroy()
            return res.json({ status: 'success', message: 'Restaurant deleted successfully.' })
        } catch (error) {
            console.log(error)
        }
    }
}