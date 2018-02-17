const mongoose = require('mongoose')
const Schema = mongoose.Schema
const jwt = require('jsonwebtoken')

module.exports = (config) => {
  const loginSchema = new Schema({
    lrid: {
      type: String,
      required: true,
      unique: true
    },
    mlid: {
      type: String,
      required: true,
      unique: true
    },
    exp: {
      type: Date,
      required: true
    },
    created: {
      type: Date,
      required: true
    }
  })
  const userSchema = new Schema({
    email: {
      type: String,
      unique: true,
      required: true
    },
    __private: {
      logins: [loginSchema]
    }
  })

  userSchema.methods.generateJwt = function () {
    const expiry = new Date()
    expiry.setDate(expiry.getDate() + 7)

    return jwt.sign({
      _id: this._id,
      email: this.email,
      username: this.username,
      exp: parseInt(expiry.getTime() / 1000)
    }, config.jwtSecret)
  }

  return mongoose.model('User', userSchema)
}
