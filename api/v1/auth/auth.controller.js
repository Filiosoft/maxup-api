const mongoose = require('mongoose')
const User = mongoose.model('User')
const uid = require('uid-promise')
const uuid = require('uuid/v4')
const removeExpiredRequests = require('./lib/removeExpired')

module.exports = (config) => {
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
      console.log(`Folow this link to login: ${config.baseUrl}/v1/atuh/confirm?email=${encodeURIComponent(user.email)}&token=${login.mlid}`)

      return res.status(200).json({
        token: login.lrid
      })
    } catch (err) {
      return next(err)
    }
  }

  return {
    requestLogin
  }
}
