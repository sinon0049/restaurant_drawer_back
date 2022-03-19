const express = require('express')
const app = express()
const port = 3000
const routes = require('./routes')
const cors = require('cors')

app.use(cors())
app.use(express.json())
app.use(routes)

app.listen(port, () => {
    console.log(`App is listening on port ${port}`)
})