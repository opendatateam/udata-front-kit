import { expect, test } from 'vitest'
import Ajv from 'ajv'
import addFormats from 'ajv-formats'
import datasetSchema from '../datasetSchema'
import libelleSchema from '../libelleSchema'
import bouquetSchema from '../bouquetSchema'

const ajv = new Ajv({
  allErrors: true,
  schemas: [datasetSchema, libelleSchema, bouquetSchema]
})

const dataset = {
  name: 'test',
  uri: 'https://test.dev/test'
}

const libelle = {
  name: 'test',
  description: 'test test test',
  dataset
}

const bouquet = {
  name: 'test',
  description: 'test test test',
  tags: ['test', 'test'],
  libelles: [libelle]
}

test('is a valid bouquet', () => {
  addFormats(ajv, ['uri'])
  const validate = ajv.getSchema(bouquetSchema.$id)
  expect(validate(bouquet)).toBe(true)
})
