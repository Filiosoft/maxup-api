const express = require('express')
const authRouter = express.Router()

module.exports = (app, config) => {
  const requireAuth = require(config.rootPath + '/middleware/requireAuth')
  const authCtrl = require('./auth.controller')(config)

  authRouter.post('/', authCtrl.requestLogin)

  authRouter.get('/whoami', requireAuth)

  return authRouter
}
