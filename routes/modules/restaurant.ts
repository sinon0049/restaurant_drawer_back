import express from 'express'
import restaurantController from '../../controllers/restaurantController.js'
import placesRateLimit from '../../middleware/placesRateLimit.js'
import authenticateToken from '../../middleware/authenticateToken.js'
import verifyCsrfToken from '../../middleware/verifyCsrfToken.js'

const router = express.Router()

router.get('/', authenticateToken, restaurantController.getRecord)
router.delete('/:restaurantId', verifyCsrfToken, authenticateToken, restaurantController.deleteRecord)
router.post('/draw', verifyCsrfToken, authenticateToken, placesRateLimit, restaurantController.drawRandomRestaurant)

export default router
