const errorHandler = require('../middleware/errorHandler')

module.exports = (app) => {
  // 404 handler
  app.use((req, res, next) => {
    if (req._parsedUrl.pathname.includes('/v1')) {
      res.status(404).json({
        error: {
          code: 'not_found',
          message: 'The resource that you requested could not be found.'
        }
      })
    } else {
      res.status(404).render('error', {
        error: 'The page that you requested could not be found!'
      })
    }
  })

  // error handlers
  app.use(errorHandler)
}
