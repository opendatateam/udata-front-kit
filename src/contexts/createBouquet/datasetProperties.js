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
 * @property {string} name
 * @property {string|null} description
 * @property {DatasetPropertiesLinks} links
 */

/**
 * @typedef {object} DatasetPropertiesLinks
 * @property {string} bouquet - The createBouquet's URI.
 * @property {string|null} dataset - The dataset's URI.
 */

/**
 * Thrown when one or more properties are invalid.
 */
class ValidationError extends Error {
  /**
   * @type {string}
   */
  name = this.constructor.name

  /**
   * @type {string}
   */
  message

  /**
   * Create a {ValidationError}.
   *
   * @param {string} property
   */
  constructor(property) {
    const message = `The property ${property} is required.`
    super(message)
    this.message = message
  }
}

export default class DatasetProperties {
  /**
   * @type {string}
   */
  bouquetURI

  /**
   * @type {string}
   */
  name

  /**
   * @type {string|null}
   */
  description = null

  /**
   * @type {string|null}
   */
  datasetURI = null

  /**
   * Create a {DatasetProperties}
   *
   * @param {string} bouquetURI
   * @param {string} name
   * @param {string|null} description
   * @param {string|null} datasetURI
   */
  constructor(bouquetURI, name, description, datasetURI) {
    // TODO: localise or move to store.
    if (!bouquetURI) throw new ValidationError('bouquetURI')

    // TODO: localise or move to store.
    if (!name) throw new ValidationError('name')

    // FIXME: use a schema for casting/validation?
    this.bouquetURI = bouquetURI
    this.name = name
    this.description = description || this.description
    this.datasetURI = datasetURI || this.datasetURI
  }

  /**
   * Serialize the {DatasetProperties}.
   *
   * @returns {BouquetData}
   */
  serialize() {
    return {
      extras: {
        datasets_properties: [
          {
            name: this.name,
            description: this.description,
            links: {
              bouquet: this.bouquetURI,
              dataset: this.datasetURI
            }
          }
        ]
      }
    }
  }

  /**
   * Deserialize one or many {DatasetProperties}.
   *
   * @param {BouquetData} params
   * @returns {array.<Information>}
   */
  static deserialize({ extras: { datasets_properties } = [] }) {
    return datasets_properties.map((properties) => {
      const { name, description, links } = properties

      return new DatasetProperties(
        links?.bouquet,
        name,
        description,
        links?.dataset
      )
    })
  }
}
