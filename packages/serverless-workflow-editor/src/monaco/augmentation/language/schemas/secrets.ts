export const SW_SPEC_SECRETS_SCHEMA = {
  $id: "https://serverlessworkflow.io/schemas/0.8/secrets.json",
  $schema: "http://json-schema.org/draft-07/schema#",
  description: "Serverless Workflow specification - secrets schema",
  type: "object",
  secrets: {
    oneOf: [
      {
        type: "string",
        format: "uri",
        description: "URI to a resource containing secrets definitions (json or yaml)",
      },
      {
        type: "array",
        description: "Workflow Secrets definitions",
        items: {
          type: "string",
        },
        minItems: 1,
      },
    ],
  },
  required: ["secrets"],
};
