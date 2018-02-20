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
    user: {
      type: String,
      required: true
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
    },
    verified: {
      type: Boolean,
      required: true,
      default: false
    }
  })
  const userSchema = new Schema({
    email: {
      type: String,
      unique: true,
      required: true
    }
  })

  userSchema.methods.generateJwt = function () {
    return jwt.sign({
      _id: this._id,
      email: this.email
    }, config.jwtSecret, {
      expiresIn: '365d'
    })
  }

  const loginsModel = mongoose.model('Login', loginSchema)
  const usersModel = mongoose.model('User', userSchema)

  return {
    usersModel,
    loginsModel
  }
}
