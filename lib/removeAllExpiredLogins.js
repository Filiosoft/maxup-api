const mongoose = require('mongoose')
const User = mongoose.model('User')
const removeExpiredLogin = require('../api/v1/auth/lib/removeExpired')

module.exports = async () => {
  try {
    const users = await User.find({})

    if (!users) {
      return
    }
    const userMaps = users.map(async user => {
      try {
        await removeExpiredLogin(user.email)
      } catch (err) {
        throw err
      }
    })
    return Promise.all(userMaps)
  } catch (err) {
    throw err
  }
}
