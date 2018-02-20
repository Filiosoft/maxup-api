const mongoose = require('mongoose')
const Login = mongoose.model('Login')

module.exports = async (email) => {
  try {
    const logins = await Login.find({
      user: email
    })
    if (!logins) {
      return
    }

    const loginMaps = logins.map(login => {
      const now = new Date()
      // we are past the expiration date, remove the login request
      if (login.exp < now) {
        return login.remove()
      }
      return true
    })

    return Promise.all(loginMaps)
  } catch (err) {
    throw err
  }
}
