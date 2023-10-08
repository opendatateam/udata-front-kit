import { expect, test } from "vitest";
import Ajv from "ajv";
import schema from "../datasetSchema";

const ajv = new Ajv({ allErrors: true });
const validate = ajv.compile(schema);

const dataset = {
  name: "test",
  uri: "https://test.dev/test",
};

test("is a valid dataset", () => {
  expect(validate(dataset)).toBe(true);
});
