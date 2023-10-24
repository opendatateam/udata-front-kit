/**
 * @typedef {object} BouquetParams
 * @property {InformationParams} extras
 */

/**
 * @typedef {object} InformationParams
 * @property {string|null} information:theme
 * @property {string|null} information:sub-theme
 */

export default class Information {
  /**
   * @type {string|null}
   */
  theme = null

  /**
   * @type {string|null}
   */
  subTheme = null

  constructor(theme, subTheme) {
    this.theme = theme || null
    this.subTheme = subTheme || null
  }

  /**
   * Serialize the information.
   *
   * @returns {BouquetParams}
   */
  serialize() {
    return {
      extras: {
        'information:theme': this.theme,
        'information:sub-theme': this.subTheme
      }
    }
  }

  /**
   * Deserialize the information.
   *
   * @param {BouquetParams} params
   * @returns {Information}
   */
  static deserialize({ extras }) {
    return new Information(
      extras['information:theme'],
      extras['information:sub-theme']
    )
  }
}
