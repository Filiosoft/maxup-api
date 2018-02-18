const bodyParser = require('body-parser')
const morgan = require('morgan')
const cors = require('cors')
const helmet = require('helmet')
const pkg = require('../package.json')
const exphbs = require('express-handlebars')

module.exports = app => {
  // set the biew engine
  app.engine('.hbs', exphbs({
    extname: '.hbs',
    defaultLayout: 'simple'
  }))
  app.set('view engine', '.hbs')

  app.enable('trust proxy')

  // put on our helmet
  app.use(helmet())

  // Use body parser so we can get info from POST and/or URL parameters
  app.use(bodyParser.urlencoded({
    extended: true
  }))
  app.use(bodyParser.json())

  // Use morgan to log requests to the console
  app.use(morgan('dev'))

  // Allow CORS
  app.use(cors())
  app.use((req, res, next) => {
    res.header('Server', `maxup-api (${pkg.version})`)
    next()
  })
}
