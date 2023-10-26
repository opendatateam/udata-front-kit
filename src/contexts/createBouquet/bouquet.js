import { isEmpty } from 'lodash/fp'
import { merge } from 'lodash/fp/object'

import Dataset from '@/contexts/createBouquet/dataset'
import DatasetProperties from '@/contexts/createBouquet/datasetProperties'
import Scope from '@/contexts/createBouquet/scope'

/**
 * @typedef {object} BouquetData
 * @property {string?} id
 * @property {string?} name
 * @property {string?} description
 * @property {array.<string>?} tags
 * @property {array.<Dataset>?} datasets
 * @property {ExtrasData?} extras
 * @property {boolean?} private
 */

/**
 * @typedef {object} ExtrasData
 * @property {string?} scope:theme
 * @property {string?} scope:sub-theme
 * @property {array.<DatasetProperties>?} datasets_properties
 */

/**
 * @typedef {object} BouquetProps
 * @property {string?} id
 * @property {string} title
 * @property {string} description
 * @property {array.<string>} tags
 * @property {Scope?} scope
 * @property {array.<DatasetProperties>?} datasets_properties
 * @property {array.<Dataset>?} datasets
 * @property {boolean?} draft
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
 * Bounded use-context of a data.gouv.fr's {Topic}.
 */
export default class Bouquet {
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
   * @type {array.<string>}
   */
  tags

  /**
   * @type {Scope|null}
   */
  scope = null

  /**
   * @type {array.<DatasetProperties>}
   */
  datasets_properties = []

  /**
   * @type {array.<Dataset>}
   */
  datasets = []

  /**
   * @type {boolean}
   */
  draft = true

  /**
   * Create a {Bouquet}.
   *
   * @param {BouquetProps} props
   */
  constructor({
    id,
    title,
    description,
    tags,
    scope,
    datasets_properties,
    datasets,
    draft
  }) {
    this.id = id
    this.title = title
    this.description = description
    this.tags = tags
    this.scope = scope || this.scope
    this.datasets_properties = datasets_properties || this.datasets_properties
    this.datasets = datasets || this.datasets
    this.draft = draft == null ? this.draft : draft

    if (!this.title) {
      throw new ValueError('title')
    }

    if (!this.description) {
      throw new ValueError('description')
    }

    if (isEmpty(this.tags)) {
      throw new ValueError('tags')
    }
  }

  /**
   * Whether the {Bouquet} is public or not.
   *
   * @returns {boolean}
   */
  get published() {
    return !this.draft
  }

  /**
   * Whether the {Bouquet} exists in data.gouv.fr yet or not.
   *
   * @returns {boolean}
   */
  get persisted() {
    return !!this.id
  }

  /**
   * Serialize the {Bouquet}.
   *
   * @returns {BouquetData}
   */
  serialize() {
    let extras = {}
    let datasets = []

    const { id, title, description, tags, draft } = this

    if (this.scope) {
      extras = merge(extras, this.scope.serialize().extras)
    }

    if (!isEmpty(this.datasets_properties)) {
      extras = merge(extras, {
        datasets_properties: this.datasets_properties.reduce((props, prop) => {
          return [...props, ...prop.serialize().extras.datasets_properties]
        }, [])
      })
    }

    if (!isEmpty(this.datasets)) {
      datasets = this.datasets.reduce((props, prop) => {
        return [...props, ...prop.serialize().datasets]
      }, [])
    }

    return {
      id,
      name: title,
      description,
      tags,
      extras,
      datasets,
      private: draft
    }
  }

  /**
   * Deserialize the {BouquetData} into a {Bouquet}.
   *
   * @param {BouquetData} data
   * @returns {Bouquet}
   */
  static deserialize(data) {
    const { id, name, description, tags, datasets, extras } = data
    const bouquet = new Bouquet({
      id,
      title: name,
      description,
      tags,
      draft: data.private
    })

    if (extras?.['scope:theme'] || extras?.['scope:sub-theme']) {
      bouquet.scope = Scope.deserialize(data)
    }

    if (extras?.datasets_properties) {
      bouquet.datasets_properties = DatasetProperties.deserialize(data)
    }

    if (!isEmpty(datasets)) {
      bouquet.datasets = Dataset.deserialize(data)
    }

    return bouquet
  }
}
