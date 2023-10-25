/**
 * @typedef {object} BouquetData
 * @property {array.<DatasetData>} datasets
 */

/**
 * @typedef {object} DatasetData
 * @property {string} id
 * @property {string} title
 * @property {string} description
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
 * Bounded use-context of a data.gouv.fr's Dataset.
 */
export default class Dataset {
  /**
   * @type {string}
   */
  id

  /**
   * @type {string}
   */
  title

  /**
   * @type {string}
   */
  description

  /**
   * Create a {Dataset}.
   *
   * @param {DatasetData} props
   */
  constructor({ id, title, description }) {
    this.id = id
    this.title = title
    this.description = description

    if (!this.id) {
      throw new ValueError('id')
    }

    if (!this.title) {
      throw new ValueError('title')
    }

    if (!this.description) {
      throw new ValueError('description')
    }
  }

  /**
   * Serialize the {Dataset}.
   *
   * @returns {BouquetData}
   */
  serialize() {
    const { id, title, description } = this
    return { datasets: [{ id, title, description }] }
  }

  /**
   * Deserialize the {BouquetData} into a {Dataset}.
   *
   * @param {BouquetData} data
   * @returns {array.<Dataset>}
   */
  static deserialize({ datasets }) {
    return datasets.map((props) => {
      return new Dataset(props)
    })
  }
}
