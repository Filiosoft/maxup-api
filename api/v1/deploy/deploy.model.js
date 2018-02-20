const mongoose = require('mongoose')
const Schema = mongoose.Schema

module.exports = () => {
  const deploySchema = new Schema({
    site: {
      type: String,
      required: true,
      unique: true
    },
    owners: {
      type: Array,
      required: true
    },
    created: {
      type: Date,
      required: true,
      default: new Date()
    },
    flyHost: String,
    updated: Date
  })

  return mongoose.model('Deploy', deploySchema)
}
