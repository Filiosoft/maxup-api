require('dotenv').config()
const nodeEnv = process.env.NODE_ENV
const port = process.env.PORT || 4000
let baseUrl
if (nodeEnv === 'development' || nodeEnv === undefined) {
  baseUrl = `http://localhost:${port}`
} else {
  baseUrl = process.env.BASE_URL || 'https://api.maxup.sh'
}

module.exports = {
  port: port,
  dbUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/maxup',
  salt: process.env.SALT || 12,
  jwtSecret: process.env.JWT_SECRET,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  baseUrl: baseUrl,
  emailFrom: process.env.EMAIL_FROM || '"maxup" <maxup@filiosoft.email',
  email: {
    host: process.env.EMAIL_HOST || 'smtp.sendgrid.net',
    port: process.env.EMAIL_PORT || 587,
    secure: process.env.EMAIL_SECURE || false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  }
}
