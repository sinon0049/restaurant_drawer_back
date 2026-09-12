const db = require('../models')
const crypto = require('crypto')
const Restaurant = db.Restaurant

const { searchNearbyRestaurants, getPhoto } = require('../utils/places')
import type { Request, Response } from "express"

module.exports = {
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
            res.status(500).json({
                status: 'error',
                message: 'Internal server error.'
            })
        }
    },
    deleteRecord: async (req: Request, res: Response) => {
        try {
            const { restaurantId } = req.params
            const restaurant = await Restaurant.findByPk(restaurantId)

            if(!restaurant) return res.status(404).json({ status: 'error', message: 'Restaurant doens\'t exist.' })
            if(restaurant.dataValues.userId !== req.user!.id) return res.status(403).json({ status: 'error', message: 'Forbidden' })

            await restaurant.destroy()
            return res.json({ status: 'success', message: 'Restaurant deleted successfully.' })
        } catch (error) {
            console.log(error)
            res.status(500).json({
                status: 'error',
                message: 'Internal server error.'
            })
        }
    },
    drawRandomRestaurant: async (req: Request, res: Response) => {
        try {
            let photo = ''
            const { places } = await searchNearbyRestaurants(req.body)
            const currentOpeningRestaurants = places.filter(p => p.currentOpeningHours && p.currentOpeningHours.openNow)

            if(!currentOpeningRestaurants.length) {
                return res.status(200).json({
                    status: 'success',
                    restaurant: null
                })
            }
            const restaurant = currentOpeningRestaurants[crypto.randomInt(0, currentOpeningRestaurants.length)]

            if(restaurant.photos && restaurant.photos.length) {
                const photoResponse = await getPhoto(restaurant.photos[0].name)
                photo = photoResponse.photoUri
            }

            // get attributes from restautant(place) object
            const {
                location: { latitude: lat, longitude: lng },
                displayName: { text: name },
                nationalPhoneNumber: phone,
                formattedAddress: addr,
                rating
            } = restaurant

            const responseObject = {
                lat,
                lng,
                name,
                phone,
                addr,
                rating,
                photo
            }

            // create restaurant record
            await Restaurant.create({
                name, phone, address: addr, userId: req.user!.id
            })

            return res.status(200).json({
                status: 'success',
                restaurant: responseObject
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