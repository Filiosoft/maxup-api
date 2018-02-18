const express = require('express')
const authRouter = express.Router()
const appRoot = require('app-root-path')
const requireAuth = require(appRoot + '/middleware/requireAuth')

module.exports = (app, config) => {
  const authCtrl = require('./auth.controller')(config)

  authRouter.post('/', authCtrl.requestLogin)

  authRouter.get('/confirm', authCtrl.confirmRequest)

  authRouter.get('/verify', authCtrl.verifyRequestConfirmation)

  authRouter.get('/whoami', requireAuth, authCtrl.whoami)

  return authRouter
}
