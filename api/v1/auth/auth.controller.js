const mongoose = require('mongoose')
const User = mongoose.model('User')
const uid = require('uid-promise')
const uuid = require('uuid/v4')
const removeExpiredRequests = require('./lib/removeExpired')
const nodemailer = require('nodemailer')
const exphbs = require('express-handlebars')
const hbs = require('nodemailer-express-handlebars')
const appRoot = require('app-root-path')
const ConfirmationError = require(appRoot + '/lib/errors/confirmationFailed')
const GenericError = require(appRoot + '/lib/errors/genericError')

module.exports = (config) => {
  const transporter = nodemailer.createTransport(config.email)
  transporter.use('compile', hbs({
    viewEngine: exphbs,
    extName: '.hbs',
    viewPath: 'views'
  }))
  /**
   * @apiDefine RequireAuth
   * @apiHeader (Authorization) {String} Authorization Bearer + JWT token.
   */

  /**
   * @api {post} /v1/auth Request a login
   * @apiName PostAuth
   * @apiGroup Authentication
   * @apiDescription Request a new login for a user to get a token.
   *
   * @apiParam {String} email         The user email.
   *
   * @apiSuccess {String} token       The token used to verify the user accepted the login request.
   *
   * @apiExample {curl} Example usage:
   *     curl -i -X "POST" https://api.maxup.sh/v1/auth
   * @apiParamExample {json} Request-Example:
   *     {
   *       "email": "jim@example.com"
   *     }
   * @apiSuccessExample {json} Success-Response:
   *     HTTP/1.1 200 OK
   *     {
   *       "token": "T1dmvPu36nmyYisXAs7IRzcR"
   *     }
   */
  const requestLogin = async (req, res, next) => {
    try {
      const {
        email
      } = req.body

      if (!email) {
        return next(new GenericError('bad_request', 400, 'No email address was provided.'))
      }

      let user
      // first, check if we already have a user
      user = await User.findOne({
        email
      }).exec()

      if (!user) {
        user = new User({
          email
        })
        await user.save()
        console.log('User did not exist. Created!')
      }
      // expiration time in minutes
      const expTime = 10
      const now = new Date()

      // the new login request
      // we need to genearte two tokens here.
      // a login request id (lrid)
      // and a magic link id (mlid)
      // both have to be cryptographically secure
      const login = {
        lrid: await uid(20),
        mlid: await uuid(),
        exp: new Date(now.getTime() + expTime * 60000),
        created: now
      }

      user.__private.logins.push(login)

      // remove all expired login requests
      removeExpiredRequests(email)

      await user.save()

      // send the verification link!
      const verificationLink = `${config.baseUrl}/confirm?email=${encodeURIComponent(user.email)}&token=${encodeURIComponent(login.mlid)}`
      const username = user.email.substring(0, user.email.indexOf('@'))
      let mailOpts = {
        from: config.emailFrom,
        to: email,
        subject: 'maxup Login Verification',
        template: 'email',
        context: {
          verificationLink,
          username
        },
        text: `Please folow this link to login to maxup: ${verificationLink}`
      }
      await transporter.sendMail(mailOpts)

      return res.status(200).json({
        token: login.lrid
      })
    } catch (err) {
      return next(err)
    }
  }

  /**
   * @api {get} /v1/auth/confirm?email&token Confirm login request
   * @apiName GetConfirm
   * @apiGroup Authentication
   * @apiDescription Confirm a login request. This link is sent to a user when a login is requested.
   *
   * @apiParam (Query string) {String} email      The user email.
   * @apiParam (Query string) {String} token      Token generated with [uuid/v4](https://www.npmjs.com/package/uuid#version-4).
   *
   * @apiSuccess {String} message                 Response message.
   *
   * @apiExample {curl} Example usage:
   *     curl "https://api.maxup.sh/v1/auth/confirm?email=jim@example.com&token=317e0ffc-d77d-489f-b04c-78035a20e6c2"
   * @apiSuccessExample {json} Success-Response:
   *     HTTP/1.1 200 OK
   *     {
   *       "message": "Login verified!"
   *     }
   */
  const confirmRequest = async (req, res, next) => {
    try {
      const {
        email,
        token
      } = req.query
      await removeExpiredRequests(email)
      if (!email) {
        return next(new GenericError('bad_request', 400, 'No email address was provided.'))
      }
      if (!token) {
        return next(new GenericError('bad_request', 400, 'No confirmation token was provided.'))
      }

      const user = await User.findOne({
        email
      })

      // if the user wasn't found, fail
      if (!user) {
        return next(new ConfirmationError('confirmation_failed', 'Login confirmation failed.'))
      }

      const logins = user.__private.logins
      let login = logins.find(login => {
        return login.mlid === token
      })

      // if the request wasn't found, fail
      if (!login) {
        return next(new ConfirmationError('confirmation_failed', 'Login confirmation failed.'))
      }

      // if this request is already verified, fail
      if (login.verified) {
        return next(new ConfirmationError('confirmation_failed', 'Login confirmation failed.'))
      }
      login.verified = true

      await user.save()

      return res.status(200).json({
        message: 'Login verified!'
      })
    } catch (err) {
      return next(err)
    }
  }

  /**
   * @api {get} /v1/auth/verify?email&token Verify login
   * @apiName GetVerify
   * @apiGroup Authentication
   * @apiDescription Verify the user accepted the login request and get a authentication token. The user email address and the token received after [requesting the login](#api-Authentication-PostAuth) must be added to the URL as a query string with the names `email` and `token`.
   *
   * @apiParam (Query string) {String} email         The user email.
   * @apiParam (Query string) {String} token         The token recieved with [PostAuth](#api-Authentication-PostAuth).
   *
   * @apiSuccess {String} token       The token used to verify the user accepted the login request.
   *
   * @apiExample {curl} Example usage:
   *     curl https://api.maxup.sh/v1/auth/verify?email=jim@example.com&token=T1dmvPu36nmyYisXAs7IRzcR
   * @apiSuccessExample {json} Success-Response:
   *     HTTP/1.1 200 OK
   *     {
   *       "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiYWRtaW4iOnRydWV9.TJVA95OrM7E2cBab30RMHrHDcEfxjoYZgeFONFh7HgQ"
   *     }
   */
  const verifyRequestConfirmation = async (req, res, next) => {
    try {
      const {
        email,
        token
      } = req.query
      await removeExpiredRequests(email)
      if (!email) {
        return next(new GenericError('bad_request', 400, 'No email address was provided.'))
      }
      if (!token) {
        return next(new GenericError('bad_request', 400, 'No confirmation token was provided.'))
      }

      const user = await User.findOne({
        email
      })

      // if the user wasn't found, fail
      if (!user) {
        return next(new ConfirmationError('confirmation_failed', 'Login confirmation failed.'))
      }

      const logins = user.__private.logins
      let login = logins.find(login => {
        return login.lrid === token
      })

      // if the request wasn't found, fail
      if (!login) {
        return next(new ConfirmationError('confirmation_failed', 'Login confirmation failed.'))
      }

      // if this request is already verified, fail
      if (!login.verified) {
        return next(new ConfirmationError('confirmation_failed', 'Login confirmation failed.'))
      }

      // remove the login request from the user to keep things clean
      user.__private.logins = user.__private.logins.filter(login => {
        return login.lrid !== token
      })

      await user.save()

      // generate a jwt
      const jwt = await user.generateJwt()
      return res.status(200).json({
        token: jwt
      })
    } catch (err) {
      return next(err)
    }
  }

  /**
   * @api {get} /v1/auth/whoami Who Am I?
   * @apiName GetWhoami
   * @apiGroup Authentication
   * @apiDescription Check the current logged in user.
   * @apiUse RequireAuth
   *
   * @apiSuccess {String} email       Current users email address.
   *
   * @apiExample {curl} Example usage:
   *     curl https://api.maxup.sh/v1/auth/whoami
   * @apiSuccessExample {json} Success-Response:
   *     HTTP/1.1 200 OK
   *     {
   *       "email": "jim@example.com"
   *     }
   */
  const whoami = async (req, res, next) => {
    try {
      const {
        email
      } = req.payload

      const user = await User.findOne({
        email
      }).select('-__private')

      if (!user) {
        return next(new GenericError('not_found', 404, 'The user was not found.'))
      }

      return res.status(200).json({
        email: user.email
      })
    } catch (err) {
      return next(err)
    }
  }

  return {
    requestLogin,
    confirmRequest,
    verifyRequestConfirmation,
    whoami
  }
}
