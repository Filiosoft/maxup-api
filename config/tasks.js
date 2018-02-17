const removeAllExpiredLogins = require('../lib/removeAllExpiredLogins')
module.exports = () => {
  // remove expired logins on startup
  removeAllExpiredLogins().catch(err => {
    console.log(err)
  })

  // remove expired logins every 10 minutes
  const minutes = 10
  setInterval(() => {
    removeAllExpiredLogins().catch(err => {
      console.log(err)
    })
  }, minutes * 60 * 1000)
}
