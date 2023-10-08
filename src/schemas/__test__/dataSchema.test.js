import { expect, test } from 'vitest';
import Ajv from 'ajv';
import schema from '../datasetSchema';

const ajv = new Ajv();
const validate = ajv.compile(schema);

test('is a valid dataset', () => {
  const validDataset = {
    "name": "test",
    "uri": "https://test.dev/test",
  }

  expect(validate(validDataset)).toBe(true);
})

test('is an valid dataset', () => {
  const invalidDataset = {
    "name": "test",
    "description": "test test test",
  }

  expect(validate(invalidDataset)).toBe(false);
})
