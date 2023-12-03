/**
 * Thrown under unknown circumstances.
 */
class UnknownError extends Error {
  public message: string
  public readonly name: string = this.constructor.name

  /**
   * Create an {UnknownError}.
   * @param {string} error
   */
  public constructor({ error }: { error: string }) {
    super(error)
    this.message = error
    Object.setPrototypeOf(this, new.target.prototype)
  }
}

/**
 * Thrown when a property's value is invalid.
 */
class ValueError extends TypeError {
  public message: string
  public readonly name: string = this.constructor.name

  /**
   * Create a {ValueError}.
   * @param {string}  name
   */
  public constructor({ name }: { name: string }) {
    const message: string = `The property ${name} is required.`
    super(message)
    this.message = message
    Object.setPrototypeOf(this, new.target.prototype)
  }
}

export { UnknownError, ValueError }
