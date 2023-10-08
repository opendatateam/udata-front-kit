import { expect, test } from "vitest";
import Ajv from "ajv";
import addFormats from "ajv-formats";
import schema from "../datasetSchema";

const ajv = new Ajv({ allErrors: true });

const dataset = {
  name: "test",
  uri: "https://test.dev/test",
};

test("is a valid dataset", () => {
  addFormats(ajv, ["uri"]);
  const validate = ajv.compile(schema);
  expect(validate(dataset)).toBe(true);
});
