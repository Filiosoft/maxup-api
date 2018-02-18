module.exports = (err, req, res, next) => {
  if (res.headersSent) {
    return next(err)
  }

  if (err.status) {
    res.status(err.status)
  } else {
    res.status(500)
  }

  if (req._parsedUrl.pathname.includes('/v1')) {
    if (err.code && err.message) {
      res.json({
        error: {
          code: err.code,
          message: err.message
        }
      })
    } else if (err.message) {
      res.json({
        error: {
          code: 'internal_server_error',
          message: err.message
        }
      })
    } else {
      res.json({
        error: {
          code: 'internal_server_error',
          message: 'An unknown error has occurred.'
        }
      })
    }
  } else {
    res.render('error', {
      error: err
    })
  }
}
