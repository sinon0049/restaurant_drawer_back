const express = require('express')
const app = express()
const port = process.env.PORT || 3000
const routes = require('./routes')
const cors = require('cors')
const usePassport = require('./config/passport')
const cookieParser = require('cookie-parser')
const https = require('https')
const fs = require('fs')
require('dotenv').config()
const whiteList = ['https://todorest-715325.web.app', 'https://todorest-715325.firebaseapp.com', 'https://localhost:5173']

import type { CorsOptions } from "cors"

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

const certOtions = {
  key: fs.readFileSync("./localhost-key.pem"),
  cert: fs.readFileSync("./localhost.pem"),
};

app.use(cookieParser())
app.use(cors(corsOption))
app.use(express.json())
usePassport(app)
app.use(routes)

// app.listen(port, () => {
//     console.log(`App is listening on port ${port}`)
// })

app.get('/', (req, res) => res.send('hello'))



https.createServer(certOtions, app).listen(port, () => {
  console.log("Server running at https://localhost:3000");
});