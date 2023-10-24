/**
 * @typedef {object} BouquetParams
 * @property {Extras} extras
 */

/**
 * @typedef {object} Extras
 * @property {array<DatauseParams>} datauses
 */

/**
 * @typedef {object} DatauseParams
 * @property {string|null} name
 * @property {string|null} description
 */

export default class Datause {
  /**
   * @type {string|null}
   */
  name = null

  /**
   * @type {string|null}
   */
  description = null

  constructor(name, description) {
    this.name = name || null
    this.description = description || null
  }

  /**
   * Serialize the datause.
   *
   * @returns {BouquetParams}
   */
  serialize() {
    const { name, description } = this
    return { extras: { datauses: [{ name, description }] } }
  }

  /**
   * Deserialize the datause/s.
   *
   * @param params
   * @returns {array.<Information>}
   */
  static deserialize({ extras: { datauses } = [] }) {
    return datauses.map((datause) => {
      const { name, description } = datause
      return new Datause(name, description)
    })
  }
}
