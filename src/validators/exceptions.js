
class ValidationError extends Error {
  constructor (...args) {
    // Calling parent constructor of base Error class.
    super(...args)

    // Saving class name in the property of our custom error as a shortcut.
    this.name = this.constructor.name

    // Capturing stack trace, excluding constructor call from it.
    Error.captureStackTrace(this, ValidationError)
  }
}

module.exports = ValidationError
