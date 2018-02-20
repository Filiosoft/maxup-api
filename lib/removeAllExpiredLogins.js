const mongoose = require('mongoose')
const User = mongoose.model('User')
const removeExpiredLogin = require('../api/v1/auth/lib/removeExpired')

const promiseLimit = require('promise-limit')
const limit = promiseLimit(1)

module.exports = async () => {
  try {
    const users = await User.find({})

    if (!users) {
      return
    }
    const userMaps = users.map(user => {
      return limit(async () => {
        try {
          await removeExpiredLogin(user.email)
        } catch (err) {
          throw err
        }
      })
    })
    return Promise.all(userMaps)
  } catch (err) {
    throw err
  }
}
