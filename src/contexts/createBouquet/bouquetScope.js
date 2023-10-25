/**
 * @typedef {object} BouquetData
 * @property {BouquetScopeData} extras
 */

/**
 * @typedef {object} BouquetScopeData
 * @property {string|null} scope:theme
 * @property {string|null} scope:sub-theme
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
 * @note a {Bouquet} is a {Topic} with a {BouquetScope}.
 */
export default class BouquetScope {
  /**
   * @type {string}
   */
  theme

  /**
   * @type {string}
   */
  subTheme

  /**
   * Create a {BouquetScope}.
   *
   * @param {string} theme
   * @param {string} subTheme
   */
  constructor(theme, subTheme) {
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
   * Serialize the {BouquetScope}.
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
   * Deserialize the {BouquetData} into a {BouquetScope}.
   *
   * @param {BouquetData} data
   * @returns {BouquetScope}
   */
  static deserialize({ extras }) {
    return new BouquetScope(extras['scope:theme'], extras['scope:sub-theme'])
  }
}
