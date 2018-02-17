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

app.listen(config.port, () => {
  console.log('s3d Listening on ' + config.port)
  if (app.get('env') === 'development') {
    console.log(`API Address: http://localhost:${config.port}/api`)
  } else {
    console.log(`API Address: ${config.baseUrl}/api`)
  }
  console.log(`Host: ${os.hostname()}\n`)
})
