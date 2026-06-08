export const openApiSpec = {
  openapi: '3.0.3',
  info: {
    title: 'Token Metadata Gateway',
    description: 'Token metadata lookup by chain (CAIP-2) and contract address. Stores symbol, decimals, name, and logo URL. Unknown EVM tokens are fetched from 1inch API on first request.',
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
    '/api/v1/tokens/{chain}/{contractAddress}': {
      get: {
        summary: 'Get token metadata',
        description: 'Fetch metadata for a specific token by chain and contract address. If not found in KV, attempts to fetch from external API (1inch for EVM chains) and caches the result.',
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
