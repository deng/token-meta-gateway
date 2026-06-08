export const openApiSpec = {
  openapi: '3.0.3',
  info: {
    title: 'Token Metadata Gateway',
    description: 'KV-backed token metadata lookup by chain (CAIP-2) and contract address. Stores symbol, decimals, name, and logo URL.',
    version: '0.1.0',
  },
  servers: [
    { url: 'https://token-meta.bithub.pro', description: 'Production' },
    { url: 'http://localhost:8787', description: 'Local dev' },
  ],
  paths: {
    '/health': {
      get: {
        summary: 'Health check',
        tags: ['System'],
        responses: {
          '200': {
            description: 'Service healthy',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', example: 'healthy' },
                    timestamp: { type: 'string', format: 'date-time' },
                    version: { type: 'string', example: '0.1.0' },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/api/v1/tokens': {
      post: {
        summary: 'Upsert token metadata',
        description: 'Create or update token metadata. If the token already exists, provided fields are merged.',
        tags: ['Tokens'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['chain', 'contractAddress', 'symbol', 'decimals'],
                properties: {
                  chain: { type: 'string', description: 'CAIP-2 chain identifier', example: 'eip155:1' },
                  contractAddress: { type: 'string', description: 'Token contract address', example: '0xdAC17F958D2ee523a2206206994597C13D831ec7' },
                  symbol: { type: 'string', example: 'USDT' },
                  decimals: { type: 'integer', example: 6 },
                  name: { type: 'string', nullable: true, example: 'Tether USD' },
                  logo: { type: 'string', nullable: true, example: 'https://example.com/usdt.png' },
                },
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Token metadata upserted',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    data: { $ref: '#/components/schemas/TokenMeta' },
                  },
                },
              },
            },
          },
          '400': { description: 'Invalid request' },
        },
      },
    },
    '/api/v1/tokens/{chain}/{contractAddress}': {
      get: {
        summary: 'Get token metadata',
        description: 'Fetch metadata for a specific token by chain and contract address.',
        tags: ['Tokens'],
        parameters: [
          { name: 'chain', in: 'path', required: true, schema: { type: 'string' }, example: 'eip155:1' },
          { name: 'contractAddress', in: 'path', required: true, schema: { type: 'string' }, example: '0xdAC17F958D2ee523a2206206994597C13D831ec7' },
        ],
        responses: {
          '200': {
            description: 'Token metadata',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    data: { $ref: '#/components/schemas/TokenMeta' },
                  },
                },
              },
            },
          },
          '404': { description: 'Token not found' },
        },
      },
    },
  },
  components: {
    schemas: {
      TokenMeta: {
        type: 'object',
        properties: {
          chain: { type: 'string' },
          contractAddress: { type: 'string' },
          symbol: { type: 'string' },
          decimals: { type: 'integer' },
          name: { type: 'string', nullable: true },
          logo: { type: 'string', nullable: true },
          updatedAt: { type: 'integer' },
        },
      },
    },
  },
} as const;
