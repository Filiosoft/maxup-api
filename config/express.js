const bodyParser = require('body-parser')
const morgan = require('morgan')
const cors = require('cors')
const helmet = require('helmet')
const pkg = require('../package.json')

module.exports = app => {
  app.use(helmet())

  // Use body parser so we can get info from POST and/or URL parameters
  app.use(bodyParser.urlencoded({
    extended: true
  }))
  app.use(bodyParser.json())

  // Allow CORS
  app.use(cors())
  app.use((req, res, next) => {
    // res.header('Access-Control-Allow-Origin', '*')
    // res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization')
    res.header('Server', `s3d-api (${pkg.version})`)
    next()
  })

  // Use morgan to log requests to the console
  app.use(morgan('dev'))
}
