const express = require('express')

module.exports = function (app, config) {
  const router = express.Router()

  // GET /v1
  require('../api/v1/v1')(app, config)

  app.use('/', router)
}
