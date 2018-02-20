const express = require('express')
const deployRouter = express.Router()
const appRoot = require('app-root-path')
const requireAuth = require(appRoot + '/middleware/requireAuth')

module.exports = (app, config) => {
  const deployCtrl = require('./deploy.controller')(config)

  deployRouter.post('/', requireAuth, deployCtrl.deploy)

  // deployRouter.delete('/:site', requireAuth, deployCtrl.destroy)

  return deployRouter
}
