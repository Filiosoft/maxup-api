const mongoose = require('mongoose')
const User = mongoose.model('User')
module.exports = async (email) => {
  try {
    const user = await User.findOne({
      email
    })

    user.__private.logins = user.__private.logins.filter(login => {
      const now = new Date()
      // we are past the expiration date, remove the login request
      if (login.exp < now) {
        return false
      } else {
        return true
      }
    })

    return user.save()
  } catch (err) {
    throw err
  }
}
