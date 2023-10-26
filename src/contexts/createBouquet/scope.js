/**
 * @typedef {object} BouquetData
 * @property {ScopeData} extras
 */

/**
 * @typedef {object} ScopeData
 * @property {string?} scope:theme
 * @property {string?} scope:sub-theme
 */

/**
 * @typedef {object} ScopeProps
 * @property {string} theme
 * @property {string} subTheme
 */

/**
 * Thrown when one or more properties are invalid.
 */
class ValueError extends Error {
  /**
   * @type {string}
   */
  name = this.constructor.name

  /**
   * @type {string}
   */
  message

  /**
   * Create a {ValueError}.
   *
   * @param {string} property
   */
  constructor(property) {
    const message = `The property ${property} is required.`
    super(message)
    this.message = message
  }
}

/**
 * Bounded use-context of a {Bouquet}.
 *
 * @note May well be pushed as a {Tag} in the future.
 * @note a {Bouquet} is a {Topic} with a {Scope}.
 */
export default class Scope {
  /**
   * @type {string}
   */
  theme

  /**
   * @type {string}
   */
  subTheme

  /**
   * Create a {Scope}.
   *
   * @param {ScopeProps} props
   */
  constructor({ theme, subTheme }) {
    this.theme = theme
    this.subTheme = subTheme

    if (!this.theme) {
      throw new ValueError('theme')
    }

    if (!this.subTheme) {
      throw new ValueError('subTheme')
    }
  }

  /**
   * Serialize the {Scope}.
   *
   * @returns {BouquetData}
   */
  serialize() {
    return {
      extras: {
        'scope:theme': this.theme,
        'scope:sub-theme': this.subTheme
      }
    }
  }

  /**
   * Deserialize the {BouquetData} into a {Scope}.
   *
   * @param {BouquetData} data
   * @returns {Scope}
   */
  static deserialize({ extras }) {
    return new Scope({
      theme: extras['scope:theme'],
      subTheme: extras['scope:sub-theme']
    })
  }
}
