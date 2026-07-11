export const openApiSpec = {
  openapi: '3.0.3',
  info: {
    title: 'Token Metadata Gateway',
    description: 'Token metadata lookup by chain (CAIP-2) and contract address. Caches in KV on first lookup. Sources: CoinGecko API → on-chain ERC20 eth_call → Trust Wallet assets for logo. Logo images served via gateway proxy (no external CDN access needed).',
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
        description: 'Fetch metadata for a specific token by chain and contract address. On first lookup, sources from CoinGecko → on-chain RPC eth_call. Supports ?force=true to skip cache and refresh from external sources.',
        tags: ['Tokens'],
        parameters: [
          { name: 'chain', in: 'path', required: true, schema: { type: 'string' }, example: 'eip155:1' },
          { name: 'contractAddress', in: 'path', required: true, schema: { type: 'string' }, example: '0xdAC17F958D2ee523a2206206994597C13D831ec7' },
          { name: 'force', in: 'query', required: false, schema: { type: 'string', enum: ['true'] }, description: 'Skip cache and force refresh from external sources' },
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
    '/api/v1/tokens/{chain}/{contractAddress}/logo': {
      get: {
        summary: 'Get token logo',
        description: 'Proxy token logo image from external CDN (CoinGecko or Trust Wallet). Returns the image bytes directly with edge caching.',
        tags: ['Tokens'],
        parameters: [
          { name: 'chain', in: 'path', required: true, schema: { type: 'string' }, example: 'eip155:1' },
          { name: 'contractAddress', in: 'path', required: true, schema: { type: 'string' }, example: '0xdAC17F958D2ee523a2206206994597C13D831ec7' },
        ],
        responses: {
          '200': {
            description: 'Logo image (PNG)',
            content: { 'image/png': { schema: { type: 'string', format: 'binary' } } },
          },
          '404': { description: 'Logo not found or chain not supported' },
        },
      },
    },
    '/api/v1/tokens/{chain}/batch': {
      post: {
        summary: 'Batch token metadata query',
        description: 'Query multiple token metadata entries for the same chain. Checks cache → KV → external sources (CoinGecko → RPC). Returns results in the same order as the input addresses array.',
        tags: ['Tokens'],
        parameters: [
          { name: 'chain', in: 'path', required: true, schema: { type: 'string' }, example: 'eip155:1' },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  addresses: {
                    type: 'array',
                    items: { type: 'string' },
                    example: ['0xdAC17F958D2ee523a2206206994597C13D831ec7', '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'],
                  },
                },
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Batch token metadata',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    data: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/TokenMeta' },
                      nullable: true,
                    },
                  },
                },
              },
            },
          },
          '400': { description: 'Invalid request — addresses field missing or empty' },
        },
      },
    },
    '/api/v1/tokens/{chain}/list': {
      get: {
        summary: 'List tokens by chain',
        description: 'List available tokens for a given chain. Currently supports Stellar (stellar:pubnet) via StellarExpert API proxy with pagination and search.',
        tags: ['Tokens'],
        parameters: [
          { name: 'chain', in: 'path', required: true, schema: { type: 'string' }, example: 'stellar:pubnet' },
          { name: 'limit', in: 'query', required: false, schema: { type: 'integer', default: 50, maximum: 200 }, description: 'Results per page (max 200)' },
          { name: 'page', in: 'query', required: false, schema: { type: 'integer', default: 1 }, description: 'Page number' },
          { name: 'search', in: 'query', required: false, schema: { type: 'string' }, description: 'Search by token code or name' },
        ],
        responses: {
          '200': {
            description: 'Paginated token list',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    data: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/TokenMeta' },
                    },
                    pagination: { $ref: '#/components/schemas/Pagination' },
                  },
                },
              },
            },
          },
        },
      },
    },
  },
  components: {
    schemas: {
      Pagination: {
        type: 'object',
        properties: {
          page: { type: 'integer', example: 1 },
          limit: { type: 'integer', example: 50 },
          total: { type: 'integer', example: 100 },
        },
      },
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
