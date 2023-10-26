/**
 * @typedef {object} BouquetData
 * @property {ExtrasData} extras
 */

/**
 * @typedef {object} ExtrasData
 * @property {array<DatasetPropertiesData>} datasets_properties
 */

/**
 * @typedef {object} DatasetPropertiesData
 * @property {string?} title
 * @property {string?} description
 * @property {boolean?} available
 * @property {string?} id
 * @property {string?} uri
 */

/**
 * Thrown when one or more properties are invalid.
 */
class ValueError extends Error {
  /**
   * @type {string}
   */
  message

  /**
   * @type {string}
   */
  name = this.constructor.name

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
 * Metadata between a {Bouquet} and a {Dataset}.
 */
export default class DatasetProperties {
  /**
   * @type {string}
   */
  title

  /**
   * @type {string}
   */
  description

  /**
   * @type {boolean}
   */
  available

  /**
   * @type {string|null}
   */
  id = null

  /**
   * @type {string|null}
   */
  uri = null

  /**
   * Create a {DatasetProperties}
   *
   * @param {DatasetPropertiesData} props
   */
  constructor({ title, available, description, id, uri }) {
    this.title = title
    this.description = description
    this.available = available
    this.id = id || this.id
    this.uri = uri || this.uri

    if (!this.title) {
      throw new ValueError('title')
    }

    if (!this.description) {
      throw new ValueError('description')
    }

    if (this.available == null) {
      throw new ValueError('available')
    }

    if (this.id) {
      this.uri = null
    }

    if (this.uri) {
      this.id = null
    }
  }

  /**
   * Whether the dataset is missing or not.
   *
   * @returns {boolean}
   */
  get missing() {
    return this.available && !this.id && !this.uri
  }

  /**
   * Serialize the {DatasetProperties}.
   *
   * @returns {BouquetData}
   */
  serialize() {
    return { extras: { datasets_properties: [this.toDict()] } }
  }

  /**
   * Deserialize one or many {DatasetPropertiesData} into {DatasetProperties}.
   *
   * @param {BouquetData} data
   * @returns {array.<Scope>}
   */
  static deserialize({ extras: { datasets_properties } = [] }) {
    return datasets_properties.map((props) => {
      return new DatasetProperties(props)
    })
  }

  /**
   * @private
   * @returns {DatasetPropertiesData}
   */
  toDict() {
    const { title, description, available, id, uri } = this
    return { title, description, available, id, uri }
  }
}
