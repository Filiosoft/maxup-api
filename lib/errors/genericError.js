class GenericError extends Error {
  constructor (code, status, ...params) {
    // Pass remaining arguments (including vendor specific ones) to parent constructor
    super(...params)

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, GenericError)
    }

    // Custom debugging information
    this.name = 'GenericError'
    this.code = code
    this.status = status
  }
}

module.exports = GenericError
