/*
 * Copyright 2022 Red Hat, Inc. and/or its affiliates.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

export const SW_SPEC_WORKFLOW_SCHEMA = {
  $id: "https://serverlessworkflow.io/schemas/0.8/workflow.json",
  $schema: "http://json-schema.org/draft-07/schema#",
  description: "Serverless Workflow specification - workflow schema",
  type: "object",
  properties: {
    id: {
      type: "string",
      description: "Workflow unique identifier",
      minLength: 1,
    },
    key: {
      type: "string",
      description: "Domain-specific workflow identifier",
      minLength: 1,
    },
    name: {
      type: "string",
      description: "Workflow name",
      minLength: 1,
    },
    description: {
      type: "string",
      description: "Workflow description",
    },
    version: {
      type: "string",
      description: "Workflow version",
      minLength: 1,
    },
    annotations: {
      type: "array",
      description:
        "List of helpful terms describing the workflows intended purpose, subject areas, or other important qualities",
      minItems: 1,
      items: {
        type: "string",
      },
      additionalItems: false,
    },
    dataInputSchema: {
      oneOf: [
        {
          type: "string",
          description: "URI of the JSON Schema used to validate the workflow data input",
          minLength: 1,
        },
        {
          type: "object",
          description: "Workflow data input schema definition",
          properties: {
            schema: {
              type: "string",
              description: "URI of the JSON Schema used to validate the workflow data input",
              minLength: 1,
            },
            failOnValidationErrors: {
              type: "boolean",
              default: true,
              description: "Determines if workflow execution should continue if there are validation errors",
            },
          },
          additionalProperties: false,
          required: ["schema", "failOnValidationErrors"],
        },
      ],
    },
    secrets: {
      $ref: "secrets.json#/secrets",
    },
    constants: {
      oneOf: [
        {
          type: "string",
          format: "uri",
          description: "URI to a resource containing constants data (json or yaml)",
        },
        {
          type: "object",
          description: "Workflow constants data (object type)",
        },
      ],
    },
    start: {
      $ref: "#/definitions/startdef",
    },
    specVersion: {
      type: "string",
      description: "Serverless Workflow schema version",
      minLength: 1,
    },
    expressionLang: {
      type: "string",
      description: "Identifies the expression language used for workflow expressions. Default is 'jq'",
      default: "jq",
      minLength: 1,
    },
    timeouts: {
      $ref: "timeouts.json#/timeouts",
    },
    errors: {
      $ref: "errors.json#/errors",
    },
    keepActive: {
      type: "boolean",
      default: false,
      description:
        "If 'true', workflow instances is not terminated when there are no active execution paths. Instance can be terminated via 'terminate end definition' or reaching defined 'workflowExecTimeout'",
    },
    metadata: {
      $ref: "common.json#/definitions/metadata",
    },
    events: {
      $ref: "events.json#/events",
    },
    functions: {
      $ref: "functions.json#/functions",
    },
    autoRetries: {
      type: "boolean",
      default: false,
      description: "If set to true, actions should automatically be retried on unchecked errors. Default is false",
    },
    retries: {
      $ref: "retries.json#/retries",
    },
    auth: {
      $ref: "auth.json#/auth",
    },
    states: {
      type: "array",
      description: "State definitions",
      items: {
        anyOf: [
          {
            title: "Sleep State",
            $ref: "#/definitions/sleepstate",
          },
          {
            title: "Event State",
            $ref: "#/definitions/eventstate",
          },
          {
            title: "Operation State",
            $ref: "#/definitions/operationstate",
          },
          {
            title: "Parallel State",
            $ref: "#/definitions/parallelstate",
          },
          {
            title: "Switch State",
            $ref: "#/definitions/switchstate",
          },
          {
            title: "Inject State",
            $ref: "#/definitions/injectstate",
          },
          {
            title: "ForEach State",
            $ref: "#/definitions/foreachstate",
          },
          {
            title: "Callback State",
            $ref: "#/definitions/callbackstate",
          },
        ],
      },
      additionalItems: false,
      minItems: 1,
    },
  },
  oneOf: [
    {
      required: ["id", "specVersion", "states"],
    },
    {
      required: ["key", "specVersion", "states"],
    },
  ],
  definitions: {
    sleep: {
      type: "object",
      properties: {
        before: {
          type: "string",
          description:
            "Amount of time (ISO 8601 duration format) to sleep before function/subflow invocation. Does not apply if 'eventRef' is defined.",
        },
        after: {
          type: "string",
          description:
            "Amount of time (ISO 8601 duration format) to sleep after function/subflow invocation. Does not apply if 'eventRef' is defined.",
        },
      },
      oneOf: [
        {
          required: ["before"],
        },
        {
          required: ["after"],
        },
        {
          required: ["before", "after"],
        },
      ],
    },
    crondef: {
      oneOf: [
        {
          type: "string",
          description: "Cron expression defining when workflow instances should be created (automatically)",
          minLength: 1,
        },
        {
          type: "object",
          properties: {
            expression: {
              type: "string",
              description:
                "Repeating interval (cron expression) describing when the workflow instance should be created",
              minLength: 1,
            },
            validUntil: {
              type: "string",
              description:
                "Specific date and time (ISO 8601 format) when the cron expression invocation is no longer valid",
            },
          },
          additionalProperties: false,
          required: ["expression"],
        },
      ],
    },
    continueasdef: {
      oneOf: [
        {
          type: "string",
          description:
            "Unique id of the workflow to be continue execution as. Entire state data is passed as data input to next execution",
          minLength: 1,
        },
        {
          type: "object",
          properties: {
            workflowId: {
              type: "string",
              description: "Unique id of the workflow to continue execution as",
            },
            version: {
              type: "string",
              description: "Version of the workflow to continue execution as",
              minLength: 1,
            },
            data: {
              type: ["string", "object"],
              description:
                "If string type, an expression which selects parts of the states data output to become the workflow data input of continued execution. If object type, a custom object to become the workflow data input of the continued execution",
            },
            workflowExecTimeout: {
              $ref: "timeouts.json#/definitions/workflowExecTimeout",
              description:
                "Workflow execution timeout to be used by the workflow continuing execution. Overwrites any specific settings set by that workflow",
            },
          },
          required: ["workflowId"],
        },
      ],
    },
    transition: {
      oneOf: [
        {
          type: "string",
          description: "Name of state to transition to",
          minLength: 1,
        },
        {
          type: "object",
          description: "Function Reference",
          properties: {
            nextState: {
              type: "string",
              description: "Name of state to transition to",
              minLength: 1,
            },
            produceEvents: {
              type: "array",
              description: "Array of events to be produced before the transition happens",
              items: {
                type: "object",
                $ref: "#/definitions/produceeventdef",
              },
              additionalItems: false,
            },
            compensate: {
              type: "boolean",
              default: false,
              description:
                "If set to true, triggers workflow compensation when before this transition is taken. Default is false",
            },
          },
          additionalProperties: false,
          required: ["nextState"],
        },
      ],
    },
    error: {
      type: "object",
      properties: {
        errorRef: {
          type: "string",
          description: "Reference to a unique workflow error definition. Used of errorRefs is not used",
          minLength: 1,
        },
        errorRefs: {
          type: "array",
          description: "References one or more workflow error definitions. Used if errorRef is not used",
          minItems: 1,
          items: {
            type: "string",
          },
          additionalItems: false,
        },
        transition: {
          description: "Transition to next state to handle the error.",
          $ref: "#/definitions/transition",
        },
        end: {
          description: "End workflow execution in case of this error.",
          $ref: "#/definitions/end",
        },
      },
      additionalProperties: false,
      oneOf: [
        {
          required: ["errorRef", "transition"],
        },
        {
          required: ["errorRef", "end"],
        },
        {
          required: ["errorRefs", "transition"],
        },
        {
          required: ["errorRefs", "end"],
        },
      ],
    },
    onevents: {
      type: "object",
      properties: {
        eventRefs: {
          type: "array",
          description: "References one or more unique event names in the defined workflow events",
          minItems: 1,
          items: {
            type: "string",
          },
          uniqueItems: true,
          additionalItems: false,
        },
        actionMode: {
          type: "string",
          enum: ["sequential", "parallel"],
          description: "Specifies how actions are to be performed (in sequence or in parallel)",
          default: "sequential",
        },
        actions: {
          type: "array",
          description: "Actions to be performed if expression matches",
          items: {
            type: "object",
            $ref: "#/definitions/action",
          },
          additionalItems: false,
        },
        eventDataFilter: {
          description: "Event data filter",
          $ref: "#/definitions/eventdatafilter",
        },
      },
      additionalProperties: false,
      required: ["eventRefs"],
    },
    action: {
      type: "object",
      properties: {
        id: {
          type: "string",
          description: "Unique action identifier",
        },
        name: {
          type: "string",
          description: "Unique action definition name",
        },
        functionRef: {
          description: "References a function to be invoked",
          $ref: "#/definitions/functionref",
        },
        eventRef: {
          description: "References a 'trigger' and 'result' reusable event definitions",
          $ref: "#/definitions/eventref",
        },
        subFlowRef: {
          description: "References a sub-workflow to invoke",
          $ref: "#/definitions/subflowref",
        },
        sleep: {
          description: "Defines time periods workflow execution should sleep before / after function execution",
          $ref: "#/definitions/sleep",
        },
        retryRef: {
          type: "string",
          description:
            "References a defined workflow retry definition. If not defined the default retry policy is assumed",
        },
        nonRetryableErrors: {
          type: "array",
          description:
            "List of unique references to defined workflow errors for which the action should not be retried. Used only when `autoRetries` is set to `true`",
          minItems: 1,
          items: {
            type: "string",
          },
          additionalItems: false,
        },
        retryableErrors: {
          type: "array",
          description:
            "List of unique references to defined workflow errors for which the action should be retried. Used only when `autoRetries` is set to `false`",
          minItems: 1,
          items: {
            type: "string",
          },
          additionalItems: false,
        },
        actionDataFilter: {
          description: "Action data filter",
          $ref: "#/definitions/actiondatafilter",
        },
        condition: {
          description:
            "Expression, if defined, must evaluate to true for this action to be performed. If false, action is disregarded",
          type: "string",
          minLength: 1,
        },
      },
      additionalProperties: false,
      oneOf: [
        {
          required: ["functionRef"],
        },
        {
          required: ["eventRef"],
        },
        {
          required: ["subFlowRef"],
        },
      ],
    },
    functionref: {
      oneOf: [
        {
          type: "string",
          description: "Name of the referenced function",
          minLength: 1,
        },
        {
          type: "object",
          description: "Function Reference",
          properties: {
            refName: {
              type: "string",
              description: "Name of the referenced function",
            },
            arguments: {
              type: "object",
              description: "Function arguments/inputs",
            },
            selectionSet: {
              type: "string",
              description: "Only used if function type is 'graphql'. A string containing a valid GraphQL selection set",
            },
            invoke: {
              type: "string",
              enum: ["sync", "async"],
              description: "Specifies if the function should be invoked sync or async",
              default: "sync",
            },
          },
          additionalProperties: false,
          required: ["refName"],
        },
      ],
    },
    eventref: {
      type: "object",
      description: "Event References",
      properties: {
        triggerEventRef: {
          type: "string",
          description: "Reference to the unique name of a 'produced' event definition",
        },
        resultEventRef: {
          type: "string",
          description: "Reference to the unique name of a 'consumed' event definition",
        },
        resultEventTimeout: {
          type: "string",
          description:
            "Maximum amount of time (ISO 8601 format) to wait for the result event. If not defined it should default to the actionExecutionTimeout",
        },
        data: {
          type: ["string", "object"],
          description:
            "If string type, an expression which selects parts of the states data output to become the data (payload) of the event referenced by 'triggerEventRef'. If object type, a custom object to become the data (payload) of the event referenced by 'triggerEventRef'.",
        },
        contextAttributes: {
          type: "object",
          description: "Add additional extension context attributes to the produced event",
          additionalProperties: {
            type: "string",
          },
        },
        invoke: {
          type: "string",
          enum: ["sync", "async"],
          description: "Specifies if the function should be invoked sync or async. Default is sync.",
          default: "sync",
        },
      },
      additionalProperties: false,
      required: ["triggerEventRef", "resultEventRef"],
    },
    subflowref: {
      oneOf: [
        {
          type: "string",
          description: "Unique id of the sub-workflow to be invoked",
          minLength: 1,
        },
        {
          type: "object",
          description: "Specifies a sub-workflow to be invoked",
          properties: {
            workflowId: {
              type: "string",
              description: "Unique id of the sub-workflow to be invoked",
            },
            version: {
              type: "string",
              description: "Version of the sub-workflow to be invoked",
              minLength: 1,
            },
            onParentComplete: {
              type: "string",
              enum: ["continue", "terminate"],
              description:
                "If invoke is 'async', specifies how subflow execution should behave when parent workflow completes. Default is 'terminate'",
              default: "terminate",
            },
            invoke: {
              type: "string",
              enum: ["sync", "async"],
              description: "Specifies if the subflow should be invoked sync or async",
              default: "sync",
            },
          },
          required: ["workflowId"],
        },
      ],
    },
    branch: {
      type: "object",
      description: "Branch Definition",
      properties: {
        name: {
          type: "string",
          description: "Branch name",
        },
        timeouts: {
          type: "object",
          description: "State specific timeouts",
          properties: {
            actionExecTimeout: {
              $ref: "timeouts.json#/definitions/actionExecTimeout",
            },
            branchExecTimeout: {
              $ref: "timeouts.json#/definitions/branchExecTimeout",
            },
          },
          required: [],
        },
        actions: {
          type: "array",
          description: "Actions to be executed in this branch",
          items: {
            type: "object",
            $ref: "#/definitions/action",
          },
          additionalItems: false,
        },
      },
      additionalProperties: false,
      required: ["name", "actions"],
    },
    sleepstate: {
      type: "object",
      description: "Causes the workflow execution to sleep for a specified duration",
      properties: {
        id: {
          type: "string",
          description: "Unique State id",
          minLength: 1,
        },
        name: {
          type: "string",
          description: "State name",
        },
        type: {
          type: "string",
          const: "sleep",
          description: "State type",
        },
        end: {
          $ref: "#/definitions/end",
          description: "State end definition",
        },
        stateDataFilter: {
          description: "State data filter",
          $ref: "#/definitions/statedatafilter",
        },
        duration: {
          type: "string",
          description: "Duration (ISO 8601 duration format) to sleep",
        },
        timeouts: {
          type: "object",
          description: "State specific timeouts",
          properties: {
            stateExecTimeout: {
              $ref: "timeouts.json#/definitions/stateExecTimeout",
            },
          },
          required: [],
        },
        onErrors: {
          type: "array",
          description: "States error handling definitions",
          items: {
            type: "object",
            $ref: "#/definitions/error",
          },
          additionalItems: false,
        },
        transition: {
          description: "Next transition of the workflow after the workflow sleep",
          $ref: "#/definitions/transition",
        },
        compensatedBy: {
          type: "string",
          minLength: 1,
          description: "Unique Name of a workflow state which is responsible for compensation of this state",
        },
        usedForCompensation: {
          type: "boolean",
          default: false,
          description: "If true, this state is used to compensate another state. Default is false",
        },
        metadata: {
          $ref: "common.json#/definitions/metadata",
        },
      },
      additionalProperties: false,
      if: {
        properties: {
          usedForCompensation: {
            const: true,
          },
        },
        required: ["usedForCompensation"],
      },
      then: {
        required: ["name", "type", "duration"],
      },
      else: {
        oneOf: [
          {
            required: ["name", "type", "duration", "end"],
          },
          {
            required: ["name", "type", "duration", "transition"],
          },
        ],
      },
    },
    eventstate: {
      type: "object",
      description:
        "This state is used to wait for events from event sources, then consumes them and invoke one or more actions to run in sequence or parallel",
      properties: {
        id: {
          type: "string",
          description: "Unique State id",
          minLength: 1,
        },
        name: {
          type: "string",
          description: "State name",
        },
        type: {
          type: "string",
          const: "event",
          description: "State type",
        },
        exclusive: {
          type: "boolean",
          default: true,
          description:
            "If true consuming one of the defined events causes its associated actions to be performed. If false all of the defined events must be consumed in order for actions to be performed",
        },
        onEvents: {
          type: "array",
          description: "Define the events to be consumed and optional actions to be performed",
          items: {
            type: "object",
            $ref: "#/definitions/onevents",
          },
          additionalItems: false,
        },
        timeouts: {
          type: "object",
          description: "State specific timeouts",
          properties: {
            stateExecTimeout: {
              $ref: "timeouts.json#/definitions/stateExecTimeout",
            },
            actionExecTimeout: {
              $ref: "timeouts.json#/definitions/actionExecTimeout",
            },
            eventTimeout: {
              $ref: "timeouts.json#/definitions/eventTimeout",
            },
          },
          required: [],
        },
        stateDataFilter: {
          description: "State data filter",
          $ref: "#/definitions/statedatafilter",
        },
        onErrors: {
          type: "array",
          description: "States error handling definitions",
          items: {
            type: "object",
            $ref: "#/definitions/error",
          },
          additionalItems: false,
        },
        transition: {
          description: "Next transition of the workflow after all the actions have been performed",
          $ref: "#/definitions/transition",
        },
        end: {
          $ref: "#/definitions/end",
          description: "State end definition",
        },
        compensatedBy: {
          type: "string",
          minLength: 1,
          description: "Unique Name of a workflow state which is responsible for compensation of this state",
        },
        metadata: {
          $ref: "common.json#/definitions/metadata",
        },
      },
      additionalProperties: false,
      oneOf: [
        {
          required: ["name", "type", "onEvents", "end"],
        },
        {
          required: ["name", "type", "onEvents", "transition"],
        },
      ],
    },
    operationstate: {
      type: "object",
      description: "Defines actions be performed. Does not wait for incoming events",
      properties: {
        id: {
          type: "string",
          description: "Unique State id",
          minLength: 1,
        },
        name: {
          type: "string",
          description: "State name",
        },
        type: {
          type: "string",
          const: "operation",
          description: "State type",
        },
        end: {
          $ref: "#/definitions/end",
          description: "State end definition",
        },
        stateDataFilter: {
          description: "State data filter",
          $ref: "#/definitions/statedatafilter",
        },
        actionMode: {
          type: "string",
          enum: ["sequential", "parallel"],
          description: "Specifies whether actions are performed in sequence or in parallel",
          default: "sequential",
        },
        actions: {
          type: "array",
          description: "Actions to be performed",
          items: {
            type: "object",
            $ref: "#/definitions/action",
          },
        },
        timeouts: {
          type: "object",
          description: "State specific timeouts",
          properties: {
            stateExecTimeout: {
              $ref: "timeouts.json#/definitions/stateExecTimeout",
            },
            actionExecTimeout: {
              $ref: "timeouts.json#/definitions/actionExecTimeout",
            },
          },
          required: [],
        },
        onErrors: {
          type: "array",
          description: "States error handling definitions",
          items: {
            type: "object",
            $ref: "#/definitions/error",
          },
          additionalItems: false,
        },
        transition: {
          description: "Next transition of the workflow after all the actions have been performed",
          $ref: "#/definitions/transition",
        },
        compensatedBy: {
          type: "string",
          minLength: 1,
          description: "Unique Name of a workflow state which is responsible for compensation of this state",
        },
        usedForCompensation: {
          type: "boolean",
          default: false,
          description: "If true, this state is used to compensate another state. Default is false",
        },
        metadata: {
          $ref: "common.json#/definitions/metadata",
        },
      },
      additionalProperties: false,
      if: {
        properties: {
          usedForCompensation: {
            const: true,
          },
        },
        required: ["usedForCompensation"],
      },
      then: {
        required: ["name", "type", "actions"],
      },
      else: {
        oneOf: [
          {
            required: ["name", "type", "actions", "end"],
          },
          {
            required: ["name", "type", "actions", "transition"],
          },
        ],
      },
    },
    parallelstate: {
      type: "object",
      description: "Consists of a number of states that are executed in parallel",
      properties: {
        id: {
          type: "string",
          description: "Unique State id",
          minLength: 1,
        },
        name: {
          type: "string",
          description: "State name",
        },
        type: {
          type: "string",
          const: "parallel",
          description: "State type",
        },
        end: {
          $ref: "#/definitions/end",
          description: "State end definition",
        },
        stateDataFilter: {
          description: "State data filter",
          $ref: "#/definitions/statedatafilter",
        },
        timeouts: {
          type: "object",
          description: "State specific timeouts",
          properties: {
            stateExecTimeout: {
              $ref: "timeouts.json#/definitions/stateExecTimeout",
            },
            branchExecTimeout: {
              $ref: "timeouts.json#/definitions/branchExecTimeout",
            },
          },
          required: [],
        },
        branches: {
          type: "array",
          description: "Branch Definitions",
          items: {
            type: "object",
            $ref: "#/definitions/branch",
          },
          additionalItems: false,
        },
        completionType: {
          type: "string",
          enum: ["allOf", "atLeast"],
          description: "Option types on how to complete branch execution.",
          default: "allOf",
        },
        numCompleted: {
          type: ["number", "string"],
          minimum: 0,
          minLength: 0,
          description:
            "Used when completionType is set to 'atLeast' to specify the minimum number of branches that must complete before the state will transition.",
        },
        onErrors: {
          type: "array",
          description: "States error handling definitions",
          items: {
            type: "object",
            $ref: "#/definitions/error",
          },
          additionalItems: false,
        },
        transition: {
          description: "Next transition of the workflow after all branches have completed execution",
          $ref: "#/definitions/transition",
        },
        compensatedBy: {
          type: "string",
          minLength: 1,
          description: "Unique Name of a workflow state which is responsible for compensation of this state",
        },
        usedForCompensation: {
          type: "boolean",
          default: false,
          description: "If true, this state is used to compensate another state. Default is false",
        },
        metadata: {
          $ref: "common.json#/definitions/metadata",
        },
      },
      additionalProperties: false,
      if: {
        properties: {
          usedForCompensation: {
            const: true,
          },
        },
        required: ["usedForCompensation"],
      },
      then: {
        required: ["name", "type", "branches"],
      },
      else: {
        oneOf: [
          {
            required: ["name", "type", "branches", "end"],
          },
          {
            required: ["name", "type", "branches", "transition"],
          },
        ],
      },
    },
    switchstate: {
      oneOf: [
        {
          $ref: "#/definitions/databasedswitchstate",
        },
        {
          $ref: "#/definitions/eventbasedswitchstate",
        },
      ],
    },
    eventbasedswitchstate: {
      type: "object",
      description: "Permits transitions to other states based on events",
      properties: {
        id: {
          type: "string",
          description: "Unique State id",
          minLength: 1,
        },
        name: {
          type: "string",
          description: "State name",
        },
        type: {
          type: "string",
          const: "switch",
          description: "State type",
        },
        stateDataFilter: {
          description: "State data filter",
          $ref: "#/definitions/statedatafilter",
        },
        timeouts: {
          type: "object",
          description: "State specific timeouts",
          properties: {
            stateExecTimeout: {
              $ref: "timeouts.json#/definitions/stateExecTimeout",
            },
            eventTimeout: {
              $ref: "timeouts.json#/definitions/eventTimeout",
            },
          },
          required: [],
        },
        eventConditions: {
          type: "array",
          description: "Defines conditions evaluated against events",
          items: {
            type: "object",
            $ref: "#/definitions/eventcondition",
          },
          additionalItems: false,
        },
        onErrors: {
          type: "array",
          description: "States error handling definitions",
          items: {
            type: "object",
            $ref: "#/definitions/error",
          },
          additionalItems: false,
        },
        defaultCondition: {
          description:
            "Default transition of the workflow if there is no matching data conditions. Can include a transition or end definition",
          $ref: "#/definitions/defaultconditiondef",
        },
        compensatedBy: {
          type: "string",
          minLength: 1,
          description: "Unique Name of a workflow state which is responsible for compensation of this state",
        },
        usedForCompensation: {
          type: "boolean",
          default: false,
          description: "If true, this state is used to compensate another state. Default is false",
        },
        metadata: {
          $ref: "common.json#/definitions/metadata",
        },
      },
      additionalProperties: false,
      required: ["name", "type", "eventConditions", "defaultCondition"],
    },
    databasedswitchstate: {
      type: "object",
      description: "Permits transitions to other states based on data conditions",
      properties: {
        id: {
          type: "string",
          description: "Unique State id",
          minLength: 1,
        },
        name: {
          type: "string",
          description: "State name",
        },
        type: {
          type: "string",
          const: "switch",
          description: "State type",
        },
        stateDataFilter: {
          description: "State data filter",
          $ref: "#/definitions/statedatafilter",
        },
        timeouts: {
          type: "object",
          description: "State specific timeouts",
          properties: {
            stateExecTimeout: {
              $ref: "timeouts.json#/definitions/stateExecTimeout",
            },
          },
          required: [],
        },
        dataConditions: {
          type: "array",
          description: "Defines conditions evaluated against state data",
          items: {
            type: "object",
            $ref: "#/definitions/datacondition",
          },
          additionalItems: false,
        },
        onErrors: {
          type: "array",
          description: "States error handling definitions",
          items: {
            type: "object",
            $ref: "#/definitions/error",
          },
          additionalItems: false,
        },
        defaultCondition: {
          description:
            "Default transition of the workflow if there is no matching data conditions. Can include a transition or end definition",
          $ref: "#/definitions/defaultconditiondef",
        },
        compensatedBy: {
          type: "string",
          minLength: 1,
          description: "Unique Name of a workflow state which is responsible for compensation of this state",
        },
        usedForCompensation: {
          type: "boolean",
          default: false,
          description: "If true, this state is used to compensate another state. Default is false",
        },
        metadata: {
          $ref: "common.json#/definitions/metadata",
        },
      },
      additionalProperties: false,
      required: ["name", "type", "dataConditions", "defaultCondition"],
    },
    defaultconditiondef: {
      type: "object",
      description: "DefaultCondition definition. Can be either a transition or end definition",
      properties: {
        transition: {
          $ref: "#/definitions/transition",
        },
        end: {
          $ref: "#/definitions/end",
        },
      },
      additionalProperties: false,
      oneOf: [
        {
          required: ["transition"],
        },
        {
          required: ["end"],
        },
      ],
    },
    eventcondition: {
      oneOf: [
        {
          $ref: "#/definitions/transitioneventcondition",
        },
        {
          $ref: "#/definitions/enddeventcondition",
        },
      ],
    },
    transitioneventcondition: {
      type: "object",
      description: "Switch state data event condition",
      properties: {
        name: {
          type: "string",
          description: "Event condition name",
        },
        eventRef: {
          type: "string",
          description: "References an unique event name in the defined workflow events",
        },
        transition: {
          description: "Next transition of the workflow if there is valid matches",
          $ref: "#/definitions/transition",
        },
        eventDataFilter: {
          description: "Event data filter definition",
          $ref: "#/definitions/eventdatafilter",
        },
        metadata: {
          $ref: "common.json#/definitions/metadata",
        },
      },
      additionalProperties: false,
      required: ["eventRef", "transition"],
    },
    enddeventcondition: {
      type: "object",
      description: "Switch state data event condition",
      properties: {
        name: {
          type: "string",
          description: "Event condition name",
        },
        eventRef: {
          type: "string",
          description: "References an unique event name in the defined workflow events",
        },
        end: {
          $ref: "#/definitions/end",
          description: "Explicit transition to end",
        },
        eventDataFilter: {
          description: "Event data filter definition",
          $ref: "#/definitions/eventdatafilter",
        },
        metadata: {
          $ref: "common.json#/definitions/metadata",
        },
      },
      additionalProperties: false,
      required: ["eventRef", "end"],
    },
    datacondition: {
      oneOf: [
        {
          $ref: "#/definitions/transitiondatacondition",
        },
        {
          $ref: "#/definitions/enddatacondition",
        },
      ],
    },
    transitiondatacondition: {
      type: "object",
      description: "Switch state data based condition",
      properties: {
        name: {
          type: "string",
          description: "Data condition name",
        },
        condition: {
          type: "string",
          description: "Workflow expression evaluated against state data. Must evaluate to true or false",
        },
        transition: {
          description: "Workflow transition if condition is evaluated to true",
          $ref: "#/definitions/transition",
        },
        metadata: {
          $ref: "common.json#/definitions/metadata",
        },
      },
      additionalProperties: false,
      required: ["condition", "transition"],
    },
    enddatacondition: {
      type: "object",
      description: "Switch state data based condition",
      properties: {
        name: {
          type: "string",
          description: "Data condition name",
        },
        condition: {
          type: "string",
          description: "Workflow expression evaluated against state data. Must evaluate to true or false",
        },
        end: {
          $ref: "#/definitions/end",
          description: "Workflow end definition",
        },
        metadata: {
          $ref: "common.json#/definitions/metadata",
        },
      },
      additionalProperties: false,
      required: ["condition", "end"],
    },
    injectstate: {
      type: "object",
      description: "Inject static data into state data. Does not perform any actions",
      properties: {
        id: {
          type: "string",
          description: "Unique state id",
          minLength: 1,
        },
        name: {
          type: "string",
          description: "State name",
        },
        type: {
          type: "string",
          const: "inject",
          description: "State type",
        },
        end: {
          $ref: "#/definitions/end",
          description: "State end definition",
        },
        data: {
          type: "object",
          description: "JSON object which can be set as states data input and can be manipulated via filters",
        },
        timeouts: {
          type: "object",
          description: "State specific timeouts",
          properties: {
            stateExecTimeout: {
              $ref: "timeouts.json#/definitions/stateExecTimeout",
            },
          },
          required: [],
        },
        stateDataFilter: {
          description: "State data filter",
          $ref: "#/definitions/statedatafilter",
        },
        transition: {
          description: "Next transition of the workflow after injection has completed",
          $ref: "#/definitions/transition",
        },
        compensatedBy: {
          type: "string",
          minLength: 1,
          description: "Unique Name of a workflow state which is responsible for compensation of this state",
        },
        usedForCompensation: {
          type: "boolean",
          default: false,
          description: "If true, this state is used to compensate another state. Default is false",
        },
        metadata: {
          $ref: "common.json#/definitions/metadata",
        },
      },
      additionalProperties: false,
      if: {
        properties: {
          usedForCompensation: {
            const: true,
          },
        },
        required: ["usedForCompensation"],
      },
      then: {
        required: ["name", "type", "data"],
      },
      else: {
        oneOf: [
          {
            required: ["name", "type", "data", "end"],
          },
          {
            required: ["name", "type", "data", "transition"],
          },
        ],
      },
    },
    foreachstate: {
      type: "object",
      description: "Execute a set of defined actions or workflows for each element of a data array",
      properties: {
        id: {
          type: "string",
          description: "Unique State id",
          minLength: 1,
        },
        name: {
          type: "string",
          description: "State name",
        },
        type: {
          type: "string",
          const: "foreach",
          description: "State type",
        },
        end: {
          $ref: "#/definitions/end",
          description: "State end definition",
        },
        inputCollection: {
          type: "string",
          description: "Workflow expression selecting an array element of the states data",
        },
        outputCollection: {
          type: "string",
          description:
            "Workflow expression specifying an array element of the states data to add the results of each iteration",
        },
        iterationParam: {
          type: "string",
          description:
            "Name of the iteration parameter that can be referenced in actions/workflow. For each parallel iteration, this param should contain an unique element of the inputCollection array",
        },
        batchSize: {
          type: ["number", "string"],
          minimum: 0,
          minLength: 0,
          description:
            "Specifies how many iterations may run in parallel at the same time. Used if 'mode' property is set to 'parallel' (default)",
        },
        actions: {
          type: "array",
          description: "Actions to be executed for each of the elements of inputCollection",
          items: {
            type: "object",
            $ref: "#/definitions/action",
          },
          additionalItems: false,
        },
        timeouts: {
          type: "object",
          description: "State specific timeouts",
          properties: {
            stateExecTimeout: {
              $ref: "timeouts.json#/definitions/stateExecTimeout",
            },
            actionExecTimeout: {
              $ref: "timeouts.json#/definitions/actionExecTimeout",
            },
          },
          required: [],
        },
        stateDataFilter: {
          description: "State data filter",
          $ref: "#/definitions/statedatafilter",
        },
        onErrors: {
          type: "array",
          description: "States error handling definitions",
          items: {
            type: "object",
            $ref: "#/definitions/error",
          },
          additionalItems: false,
        },
        transition: {
          description: "Next transition of the workflow after state has completed",
          $ref: "#/definitions/transition",
        },
        compensatedBy: {
          type: "string",
          minLength: 1,
          description: "Unique Name of a workflow state which is responsible for compensation of this state",
        },
        usedForCompensation: {
          type: "boolean",
          default: false,
          description: "If true, this state is used to compensate another state. Default is false",
        },
        mode: {
          type: "string",
          enum: ["sequential", "parallel"],
          description: "Specifies how iterations are to be performed (sequentially or in parallel)",
          default: "parallel",
        },
        metadata: {
          $ref: "common.json#/definitions/metadata",
        },
      },
      additionalProperties: false,
      if: {
        properties: {
          usedForCompensation: {
            const: true,
          },
        },
        required: ["usedForCompensation"],
      },
      then: {
        required: ["name", "type", "inputCollection", "actions"],
      },
      else: {
        oneOf: [
          {
            required: ["name", "type", "inputCollection", "actions", "end"],
          },
          {
            required: ["name", "type", "inputCollection", "actions", "transition"],
          },
        ],
      },
    },
    callbackstate: {
      type: "object",
      description:
        "This state performs an action, then waits for the callback event that denotes completion of the action",
      properties: {
        id: {
          type: "string",
          description: "Unique state id",
          minLength: 1,
        },
        name: {
          type: "string",
          description: "State name",
        },
        type: {
          type: "string",
          const: "callback",
          description: "State type",
        },
        action: {
          description: "Defines the action to be executed",
          $ref: "#/definitions/action",
        },
        eventRef: {
          type: "string",
          description: "References an unique callback event name in the defined workflow events",
        },
        timeouts: {
          type: "object",
          description: "State specific timeouts",
          properties: {
            stateExecTimeout: {
              $ref: "timeouts.json#/definitions/stateExecTimeout",
            },
            actionExecTimeout: {
              $ref: "timeouts.json#/definitions/actionExecTimeout",
            },
            eventTimeout: {
              $ref: "timeouts.json#/definitions/eventTimeout",
            },
          },
          required: [],
        },
        eventDataFilter: {
          description: "Event data filter",
          $ref: "#/definitions/eventdatafilter",
        },
        stateDataFilter: {
          description: "State data filter",
          $ref: "#/definitions/statedatafilter",
        },
        onErrors: {
          type: "array",
          description: "States error handling definitions",
          items: {
            type: "object",
            $ref: "#/definitions/error",
          },
          additionalItems: false,
        },
        transition: {
          description: "Next transition of the workflow after all the actions have been performed",
          $ref: "#/definitions/transition",
        },
        end: {
          $ref: "#/definitions/end",
          description: "State end definition",
        },
        compensatedBy: {
          type: "string",
          minLength: 1,
          description: "Unique Name of a workflow state which is responsible for compensation of this state",
        },
        usedForCompensation: {
          type: "boolean",
          default: false,
          description: "If true, this state is used to compensate another state. Default is false",
        },
        metadata: {
          $ref: "common.json#/definitions/metadata",
        },
      },
      additionalProperties: false,
      if: {
        properties: {
          usedForCompensation: {
            const: true,
          },
        },
        required: ["usedForCompensation"],
      },
      then: {
        required: ["name", "type", "action", "eventRef"],
      },
      else: {
        oneOf: [
          {
            required: ["name", "type", "action", "eventRef", "end"],
          },
          {
            required: ["name", "type", "action", "eventRef", "transition"],
          },
        ],
      },
    },
    startdef: {
      oneOf: [
        {
          type: "string",
          description: "Name of the starting workflow state",
          minLength: 1,
        },
        {
          type: "object",
          description: "Workflow start definition",
          properties: {
            stateName: {
              type: "string",
              description: "Name of the starting workflow state",
              minLength: 1,
            },
            schedule: {
              description:
                "Define the time/repeating intervals or cron at which workflow instances should be automatically started.",
              $ref: "#/definitions/schedule",
            },
          },
          additionalProperties: false,
          required: ["stateName", "schedule"],
        },
      ],
    },
    schedule: {
      oneOf: [
        {
          type: "string",
          description:
            "Time interval (must be repeating interval) described with ISO 8601 format. Declares when workflow instances will be automatically created.  (UTC timezone is assumed)",
          minLength: 1,
        },
        {
          type: "object",
          description: "Start state schedule definition",
          properties: {
            interval: {
              type: "string",
              description:
                "Time interval (must be repeating interval) described with ISO 8601 format. Declares when workflow instances will be automatically created.",
              minLength: 1,
            },
            cron: {
              $ref: "#/definitions/crondef",
            },
            timezone: {
              type: "string",
              description: "Timezone name used to evaluate the interval & cron-expression. (default: UTC)",
            },
          },
          additionalProperties: false,
          oneOf: [
            {
              required: ["interval"],
            },
            {
              required: ["cron"],
            },
          ],
        },
      ],
    },
    end: {
      oneOf: [
        {
          type: "boolean",
          description: "State end definition",
          default: true,
        },
        {
          type: "object",
          description: "State end definition",
          properties: {
            terminate: {
              type: "boolean",
              default: false,
              description: "If true, completes all execution flows in the given workflow instance",
            },
            produceEvents: {
              type: "array",
              description: "Defines events that should be produced",
              items: {
                type: "object",
                $ref: "#/definitions/produceeventdef",
              },
              additionalItems: false,
            },
            compensate: {
              type: "boolean",
              default: false,
              description: "If set to true, triggers workflow compensation. Default is false",
            },
            continueAs: {
              $ref: "#/definitions/continueasdef",
            },
          },
          additionalProperties: false,
          required: [],
        },
      ],
    },
    produceeventdef: {
      type: "object",
      description: "Produce an event and set its data",
      properties: {
        eventRef: {
          type: "string",
          description: "References a name of a defined event",
        },
        data: {
          type: ["string", "object"],
          description:
            "If String, expression which selects parts of the states data output to become the data of the produced event. If object a custom object to become the data of produced event.",
        },
        contextAttributes: {
          type: "object",
          description: "Add additional event extension context attributes",
          additionalProperties: {
            type: "string",
          },
        },
      },
      additionalProperties: false,
      required: ["eventRef"],
    },
    statedatafilter: {
      type: "object",
      properties: {
        input: {
          type: "string",
          description: "Workflow expression to filter the state data input",
        },
        output: {
          type: "string",
          description: "Workflow expression that filters the state data output",
        },
      },
      additionalProperties: false,
      required: [],
    },
    eventdatafilter: {
      type: "object",
      properties: {
        useData: {
          type: "boolean",
          description:
            "If set to false, event payload is not added/merged to state data. In this case 'data' and 'toStateData' should be ignored. Default is true.",
          default: true,
        },
        data: {
          type: "string",
          description: "Workflow expression that filters the received event payload (default: '${ . }')",
        },
        toStateData: {
          type: "string",
          description:
            " Workflow expression that selects a state data element to which the filtered event should be added/merged into. If not specified, denotes, the top-level state data element.",
        },
      },
      additionalProperties: false,
      required: [],
    },
    actiondatafilter: {
      type: "object",
      properties: {
        fromStateData: {
          type: "string",
          description: "Workflow expression that selects state data that the state action can use",
        },
        useResults: {
          type: "boolean",
          description:
            "If set to false, action data results are not added/merged to state data. In this case 'results' and 'toStateData' should be ignored. Default is true.",
          default: true,
        },
        results: {
          type: "string",
          description: "Workflow expression that filters the actions data results",
        },
        toStateData: {
          type: "string",
          description:
            "Workflow expression that selects a state data element to which the action results should be added/merged into. If not specified, denote, the top-level state data element",
        },
      },
      additionalProperties: false,
      required: [],
    },
  },
};
