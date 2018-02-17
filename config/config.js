require('dotenv').config()
const path = require('path')

module.exports = {
    port: process.env.PORT || 4000,
    dbUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/s3d',
    salt: process.env.SALT || 12,
    jwtSecret: process.env.JWT_SECRET,
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    baseUrl: process.env.BASE_URL || 'https://api.s3d.sh',
    rootPath: path.normalize(path.join(__dirname, '/../'))
}