const mongoose = require('mongoose')
const config = require('./config')

module.exports = async () => {
  try {
    mongoose.Promise = Promise
    mongoose.connect(config.dbUri)

    const db = mongoose.connection
    db.on('error', console.error.bind(console, 'Connection Error:'))
    db.once('open', () => {
      console.log(`Connected Successfully to DB: ${db.db.s.databaseName}`)
    })

    // load all the models
    require('../api/v1/auth/auth.model')(config)
  } catch (err) {
    console.log(err)
  }
}
