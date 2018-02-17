const mongoose = require('mongoose')
const User = mongoose.model('User')
const uid = require('uid-promise')
const uuid = require('uuid/v4')
const removeExpiredRequests = require('./lib/removeExpired')
const nodemailer = require('nodemailer')

module.exports = (config) => {
  const transporter = nodemailer.createTransport(config.email)

  const requestLogin = async (req, res, next) => {
    try {
      const {
        email
      } = req.body

      if (!email) {
        return next('NoEmail')
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
      const verificationLink = `${config.baseUrl}/v1/auth/confirm?email=${encodeURIComponent(user.email)}&token=${encodeURIComponent(login.mlid)}`
      let mailOpts = {
        from: config.emailFrom,
        to: email,
        subject: 's3d Login Verification',
        text: `Please folow this link to login to s3d: ${verificationLink}`,
        html: `<p>Please folow this link to login to s3d: <a href="${verificationLink}">${verificationLink}</a></p>`
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
        return next('NoEmail')
      }
      if (!token) {
        return next('NoToken')
      }

      const user = await User.findOne({
        email
      })

      // if the user wasn't found, fail
      if (!user) {
        return next('ConfirmationFailed')
      }

      const logins = user.__private.logins
      let login = logins.find(login => {
        return login.mlid === token
      })

      // if the request wasn't found, fail
      if (!login) {
        return next('ConfirmationFailed')
      }

      // if this request is already verified, fail
      if (login.verified) {
        return next('ConfirmationFailed')
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
        return next('NoEmail')
      }
      if (!token) {
        return next('NoToken')
      }

      const user = await User.findOne({
        email
      })

      // if the user wasn't found, fail
      if (!user) {
        return next('ConfirmationFailed')
      }

      const logins = user.__private.logins
      let login = logins.find(login => {
        return login.lrid === token
      })

      // if the request wasn't found, fail
      if (!login) {
        return next('ConfirmationFailed')
      }

      // if this request is already verified, fail
      if (!login.verified) {
        return next('ConfirmationFailed')
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
        return next('NotFound')
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
