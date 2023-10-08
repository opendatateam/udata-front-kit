import { expect, test } from "vitest";
import Ajv from "ajv";
import datasetSchema from "../datasetSchema";
import libelleSchema from "../libelleSchema";

const ajv = new Ajv({
  allErrors: true,
  schemas: [datasetSchema, libelleSchema],
});

const dataset = {
  name: "test",
  uri: "https://test.dev/test",
};

const libelle = {
  name: "test",
  description: "test test test",
  dataset: dataset,
};

test("is a valid libellé", () => {
  const validate = ajv.getSchema(libelleSchema.$id);
  expect(validate(libelle)).toBe(true);
});
