const db = require('../models')
const Restaurant = db.Restaurant

const { searchNearbyRestaurants } = require('../utils/places')
import type { Request, Response } from "express"

module.exports = {
    createRecord: async (req: Request, res: Response) => {
        try {
            const payLoad = {
                userId: req.user!.id,
                ...req.body
            }
            await Restaurant.create(payLoad)
            return res.json({ status: 'success', message: 'record created successfully'})
        } catch (error) {
            console.log(error)
        }
    },
    getRecord: async (req: Request, res: Response) => {
        try {
            const userId = req.user!.id
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
    deleteRecord: async (req: Request, res: Response) => {
        try {
            const { restaurantId } = req.params
            const restaurant = await Restaurant.findByPk(restaurantId)
            if(!restaurant) return res.json({ status: 'error', message: 'restaurant doens\'t exist' })
            await restaurant.destroy()
            return res.json({ status: 'success', message: 'Restaurant deleted successfully.' })
        } catch (error) {
            console.log(error)
        }
    },
    drawRandomRestaurant: async (req: Request, res: Response) => {
        try {
            console.log(req.body)

            const { places } = await searchNearbyRestaurants(req.body)

            console.log(places[0].displayName, places[0].location)

            res.status(200).json({
                status: 'success',
                restaurant: places[0]
            })

        } catch (error) {
            console.log(error)
            res.status(500).json({
                status: 'error',
                message: 'Internal server error.'
            })
        }
    }
}