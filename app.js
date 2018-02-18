const express = require('express')
const app = express()
const config = require('./config/config')
const os = require('os')

// Mongoose config
require('./config/mongoose')()

// Express config
require('./config/express')(app)

// Routes config
require('./config/routes')(app, config)

// Recuring tasks
require('./config/tasks')()

app.listen(config.port, () => {
  console.log('maxup Listening on ' + config.port)
  console.log(`API Address: ${config.baseUrl}/v1`)
  console.log(`Host: ${os.hostname()}\n`)
})
