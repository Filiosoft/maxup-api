const express = require('express')
const apiRouter = express.Router()
const os = require('os')
const mongoose = require('mongoose')
const appRoot = require('app-root-path')
const pkg = require(appRoot + '/package.json')
const RateLimit = require('express-rate-limit')

const limiter = new RateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  delayMs: 0 // disable delaying - full speed until the max limit is reached
})

module.exports = function (app, config) {
  app.use('/v1', limiter)
  /**
   * @api {get} /v1 Get Version
   * @apiName GetVersion
   * @apiDescription Get the API version.
   * @apiGroup Main
   * @apiPermission none
   * @apiVersion 0.0.1
   *
   * @apiSuccess {String} message Name of the API.
   * @apiSuccess {String} version Version of the API.
   * @apiSuccess {String} env Node environment of the API.
   * @apiSuccess {String} host Hostname on which the API is running.
   *
   * @apiSuccessExample {json} Success-Response:
   *    HTTP/1.1 200 OK
   *     {
   *      "message": "maxup API",
   *      "env": "production",
   *      "host": "e233ef5e0373"
   *    }
   * @apiExample {curl} Example usage:
   *      curl -i https://api.maxup.sh/v1
   */
  apiRouter.get('/', function (req, res) {
    return res.json({
      message: `maxup API`,
      version: `${pkg.version}`,
      env: app.get('env'),
      host: os.hostname()
    })
  })

  /**
   * @api {get} /v1/healthcheck Health Check
   * @apiName HealthCheck
   * @apiGroup Main
   * @apiPermission none
   * @apiVersion 0.0.1
   *
   * @apiSuccess {String} nodeCheck   Status of the Node check.
   * @apiSuccess {String} dbCheck     Status of the database connection.
   *
   * @apiError (500) {Object} Disconnected The database is disconnected
   *
   * @apiExample {curl} Example usage:
   *     curl -i https://api.maxup.sh/v1/healthcheck
   * @apiSuccessExample {json} Success-Response:
   *     HTTP/1.1 200 OK
   *     {
   *       "nodeCheck": {
   *          "status": "ok"
   *       },
   *       "dbCheck": {
   *          "status": "connected"
   *       }
   *     }
   */
  apiRouter.get('/healthcheck', (req, res) => {
    let status = 200
    let mongoConnection
    if (mongoose.connection.readyState === 0) {
      mongoConnection = 'disconnected'
      status = 500
    }
    if (mongoose.connection.readyState === 1) {
      mongoConnection = 'connected'
      status = 200
    }
    if (mongoose.connection.readyState === 2) {
      mongoConnection = 'connecting'
      status = 500
    }
    if (mongoose.connection.readyState === 3) {
      mongoConnection = 'disconnecting'
      status = 500
    }

    return res.status(status).json({
      nodeCheck: {
        status: 'ok'
      },
      dbCheck: {
        status: mongoConnection
      }
    })
  })

  apiRouter.use('/auth', require('./auth/auth.router')(app, config))

  // Use it!
  app.use('/v1', apiRouter)
}
