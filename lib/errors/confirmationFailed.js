class ConfirmationError extends Error {
  constructor (code, ...params) {
    // Pass remaining arguments (including vendor specific ones) to parent constructor
    super(...params)

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ConfirmationError)
    }

    // Custom debugging information
    this.name = 'ConfirmationFailed'
    this.code = code
    this.status = 401
  }
}

module.exports = ConfirmationError
