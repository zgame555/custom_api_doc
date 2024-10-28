import * as yaml from 'yaml'
import fs from 'fs'

import { z } from 'zod'

import { extendZodWithOpenApi, type ZodOpenApiOperationObject, createDocument } from 'zod-openapi'

extendZodWithOpenApi(z)

const BurgerIdSchema = z
  .number()
  .min(1)
  .openapi({
    ref: 'BurgerId',
    description: 'The unique identifier of the burger.',
    example: 1,
    param: {
      in: 'path',
      name: 'id',
    },
  })

const burgerSchema = z.object({
  id: BurgerIdSchema,
  name: z.string().min(1).max(50).openapi({
    description: 'The name of the burger.',
    example: 'Veggie Burger',
  }),
  description: z.string().max(255).optional().openapi({
    description: 'The description of the burger.',
    example: 'A delicious bean burger with avocado.',
  }),
})

burgerSchema.openapi({
  ref: 'Burger',
  description: 'A burger served at the restaurant.',
})

const burgerCreateSchema = burgerSchema.omit({ id: true }).openapi({
  ref: 'BurgerCreate',
  description: 'A burger to create.',
})

const createBurger: ZodOpenApiOperationObject = {
  operationId: 'createBurger',
  summary: 'Create a new burger',
  description: 'Creates a new burger in the database.',
  requestBody: {
    description: 'The burger to create.',
    content: {
      'application/json': {
        schema: burgerCreateSchema,
      },
    },
  },
  responses: {
    '201': {
      description: 'The burger was created successfully.',
      content: {
        'application/json': {
          schema: burgerSchema,
        },
      },
    },
  },
}

const getBurger: ZodOpenApiOperationObject = {
  operationId: 'getBurger',
  summary: 'Get a burger',
  description: 'Gets a burger from the database.',
  requestParams: {
    path: z.object({ id: BurgerIdSchema }),
  },
  responses: {
    '200': {
      description: 'The burger was retrieved successfully.',
      content: {
        'application/json': {
          schema: burgerSchema,
        },
      },
    },
  },
}

const createBurgerWebhook: ZodOpenApiOperationObject = {
  operationId: 'createBurgerWebhook',
  summary: 'New burger webhook',
  description: 'A webhook that is called when a new burger is created.',
  requestBody: {
    description: 'The burger that was created.',
    content: {
      'application/json': {
        schema: burgerSchema,
      },
    },
  },
  responses: {
    '200': {
      description: 'The webhook was processed successfully.',
    },
  },
}

const document = createDocument({
  openapi: '3.1.0',
  info: {
    title: 'Burger Restaurant API',
    description: 'An API for managing burgers at a restaurant.',
    version: '1.0.0',
  },
  servers: [
    {
      url: 'https://example.com',
      description: 'The production server.',
    },
  ],
  components: {
    schemas: {
      burgerSchema,
    },
  },
  paths: {
    '/burgers': {
      post: createBurger,
    },
    '/burgers/{id}': {
      get: getBurger,
    },
    '/webhooks/burgers': {
      post: createBurgerWebhook,
    },
  },
})

// create file openapi.yaml
fs.writeFileSync('openapi.yaml', yaml.stringify(document))
