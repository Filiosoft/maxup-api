require('dotenv').config()
const path = require('path')

const port = process.env.PORT || 4000
let baseUrl
if (process.env.NODE_ENV === 'production') {
  baseUrl = process.env.BASE_URL || 'https://api.s3d.sh'
} else {
  baseUrl = `http://localhost:${port}`
}
module.exports = {
  port: port,
  dbUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/s3d',
  salt: process.env.SALT || 12,
  jwtSecret: process.env.JWT_SECRET,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  baseUrl: baseUrl,
  rootPath: path.normalize(path.join(__dirname, '/../'))
}
