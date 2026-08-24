const express = require('express')
const app = express()
const port = process.env.PORT || 3000
const routes = require('./routes')
const cors = require('cors')
const usePassport = require('./config/passport')
require('dotenv').config()
const whiteList = ['https://todorest-715325.web.app', 'https://todorest-715325.firebaseapp.com', 'https://localhost:5173']
const corsOption = {
    origin: function (origin, callback) {
        if (whiteList.indexOf(origin) !== -1) {
          callback(null, true)
        } else {
          callback(new Error(`Origin ${origin} is not allowed by CORS policy`))
        }
    }
}

app.use(cors(corsOption))
app.use(express.json())
usePassport(app)
app.use(routes)

app.listen(port, () => {
    console.log(`App is listening on port ${port}`)
})