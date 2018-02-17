const mongoose = require('mongoose')
const config = require('./config')

module.exports = async () => {
  try {
    mongoose.Promise = Promise
    await mongoose.connect(config.dbUri)

    const monDb = mongoose.connection
    monDb.on('error', console.error.bind(console, 'Connection Error:'))
    monDb.once('open', () => console.log(`Connected Successfully to DB: ${monDb.db.s.databaseName}`))
  } catch (err) {
    console.log(err)
  }
}
