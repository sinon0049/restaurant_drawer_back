import { rateLimit } from 'express-rate-limit'

const placesRateLimit = rateLimit({
  windowMs: 60 * 1000,
  limit: 5,
  keyGenerator: (req) => String(req.user!.id),
  message: {
    status: 'error',
    message: '操作太頻繁，請稍後再試。',
  },
})

export default placesRateLimit