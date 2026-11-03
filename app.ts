import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import https from 'https'
import fs from 'fs'
import routes from './routes/index.js'
import usePassport from './config/passport.js'
import errorHandler from './middleware/errorHandler.js'
import 'dotenv/config'
import type { CorsOptions } from 'cors'

const app = express()
const port = process.env.PORT || 3000
const whiteList = ['https://todorest-715325.web.app', 'https://todorest-715325.firebaseapp.com', 'https://localhost:5173']

const corsOption: CorsOptions = {
  origin: function (origin, callback) {
      if (!origin || whiteList.indexOf(origin) !== -1) {
        callback(null, true)
      } else {
        callback(new Error(`Origin ${origin} is not allowed by CORS policy`))
      }
  },
  credentials: true
}

app.use(cookieParser())
app.use(cors(corsOption))
app.use(express.json())
usePassport(app)
app.use(routes)
app.use(errorHandler)

if (process.env.NODE_ENV === 'development') {
  const certOptions = {
    key: fs.readFileSync('./localhost-key.pem'),
    cert: fs.readFileSync('./localhost.pem'),
  }

  https.createServer(certOptions, app).listen(port, () => console.log("Server running at https://localhost:3000"))
} else {
  app.listen(port)
}
