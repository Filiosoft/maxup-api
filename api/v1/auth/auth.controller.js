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
