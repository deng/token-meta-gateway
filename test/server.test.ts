import { describe, it, expect, vi } from 'vitest';

// Mock KV namespace
function mockKV(initial: Record<string, string> = {}): KVNamespace {
  const store = new Map(Object.entries(initial));
  return {
    get: vi.fn(async (key: string, type?: 'text' | 'json' | 'arrayBuffer' | 'stream') => {
      const val = store.get(key);
      if (val == null) return null;
      if (type === 'json') return JSON.parse(val);
      return val;
    }),
    put: vi.fn(async (key: string, value: string) => {
      store.set(key, value);
    }),
    delete: vi.fn(async () => {}),
    list: vi.fn(async () => ({ keys: [] })),
    getWithMetadata: vi.fn(async () => ({ value: null, metadata: null })),
  } as unknown as KVNamespace;
}

function mockEnv(kv?: KVNamespace) {
  return {
    TOKEN_META: kv ?? mockKV(),
    TOKEN_META_CACHE_TTL: '300',
    REQUEST_TIMEOUT_SECS: '10',
  };
}

async function createApp(env?: any) {
  vi.resetModules();
  const mod = await import('../src/index');
  return { app: mod.default, env: env ?? mockEnv() };
}

function mockRequest(method: string, url: string, body?: unknown): Request {
  if (body !== undefined) {
    return new Request(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  }
  return new Request(url, { method });
}

describe('GET /health', () => {
  it('should return healthy status', async () => {
    const { app, env } = await createApp();
    const res = await app.fetch(mockRequest('GET', 'http://localhost/health'), env);
    expect(res.status).toBe(200);
    const body = await res.json() as any;
    expect(body.status).toBe('healthy');
    expect(body.version).toBe('0.1.0');
  });
});

describe('GET /openapi.json', () => {
  it('should serve OpenAPI spec', async () => {
    const { app, env } = await createApp();
    const res = await app.fetch(mockRequest('GET', 'http://localhost/openapi.json'), env);
    expect(res.status).toBe(200);
    const body = await res.json() as any;
    expect(body.openapi).toBe('3.0.3');
    expect(body.info.title).toBe('Token Metadata Gateway');
  });
});

describe('POST /api/v1/tokens', () => {
  it('should upsert a new token', async () => {
    const kv = mockKV();
    const { app, env } = await createApp(mockEnv(kv));

    const res = await app.fetch(mockRequest('POST', 'http://localhost/api/v1/tokens', {
      chain: 'eip155:1',
      contractAddress: '0x123',
      symbol: 'TEST',
      decimals: 18,
      name: 'Test Token',
    }), env);

    expect(res.status).toBe(200);
    const body = await res.json() as any;
    expect(body.success).toBe(true);
    expect(body.data.symbol).toBe('TEST');
    expect(body.data.chain).toBe('eip155:1');
    expect(body.data.contractAddress).toBe('0x123');
    expect(body.data.decimals).toBe(18);
    expect(body.data.name).toBe('Test Token');

    // Verify stored in KV
    const stored = await (kv.get as any)('token:eip155:1:0x123', 'json');
    expect(stored.symbol).toBe('TEST');
  });

  it('should return 400 for missing required fields', async () => {
    const { app, env } = await createApp();
    const res = await app.fetch(mockRequest('POST', 'http://localhost/api/v1/tokens', {
      chain: 'eip155:1',
    }), env);
    expect(res.status).toBe(400);
    const body = await res.json() as any;
    expect(body.success).toBe(false);
  });

  it('should return 400 for invalid JSON', async () => {
    const { app, env } = await createApp();
    const res = await app.fetch(new Request('http://localhost/api/v1/tokens', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: 'not-json',
    }), env);
    expect(res.status).toBe(400);
  });

  it('should merge with existing token', async () => {
    const kv = mockKV({
      'token:eip155:1:0xabc': JSON.stringify({
        chain: 'eip155:1',
        contractAddress: '0xabc',
        symbol: 'OLD',
        decimals: 18,
        name: 'Old Token',
        logo: null,
        updatedAt: 1000,
      }),
    });
    const { app, env } = await createApp(mockEnv(kv));

    const res = await app.fetch(mockRequest('POST', 'http://localhost/api/v1/tokens', {
      chain: 'eip155:1',
      contractAddress: '0xabc',
      symbol: 'NEW',
      decimals: 6,
    }), env);

    expect(res.status).toBe(200);
    const body = await res.json() as any;
    expect(body.data.symbol).toBe('NEW');
    expect(body.data.decimals).toBe(6);
    // name should be preserved from existing
    expect(body.data.name).toBe('Old Token');
  });
});

describe('GET /api/v1/tokens/:chain/:contractAddress', () => {
  it('should return token metadata', async () => {
    const kv = mockKV({
      'token:eip155:1:0x123': JSON.stringify({
        chain: 'eip155:1',
        contractAddress: '0x123',
        symbol: 'TEST',
        decimals: 18,
        name: 'Test Token',
        logo: null,
        updatedAt: 2000,
      }),
    });
    const { app, env } = await createApp(mockEnv(kv));

    const res = await app.fetch(mockRequest('GET', 'http://localhost/api/v1/tokens/eip155:1/0x123'), env);
    expect(res.status).toBe(200);
    const body = await res.json() as any;
    expect(body.success).toBe(true);
    expect(body.data.symbol).toBe('TEST');
  });

  it('should return 404 for unknown token', async () => {
    const { app, env } = await createApp();
    const res = await app.fetch(mockRequest('GET', 'http://localhost/api/v1/tokens/eip155:1/0x999'), env);
    expect(res.status).toBe(404);
    const body = await res.json() as any;
    expect(body.success).toBe(false);
    expect(body.error).toBe('Token not found');
  });

  it('should serve builtin USDT on Ethereum', async () => {
    const kv = mockKV({
      'token:eip155:1:0xdac17f958d2ee523a2206206994597c13d831ec7': JSON.stringify({
        chain: 'eip155:1',
        contractAddress: '0xdac17f958d2ee523a2206206994597c13d831ec7',
        symbol: 'USDT',
        decimals: 6,
        name: 'Tether USD',
        logo: null,
        updatedAt: 0,
      }),
    });
    const { app, env } = await createApp(mockEnv(kv));

    const res = await app.fetch(mockRequest('GET', 'http://localhost/api/v1/tokens/eip155:1/0xdAC17F958D2ee523a2206206994597C13D831ec7'), env);
    expect(res.status).toBe(200);
    const body = await res.json() as any;
    expect(body.data.symbol).toBe('USDT');
    expect(body.data.decimals).toBe(6);
  });
});

describe('CORS', () => {
  it('should include CORS headers', async () => {
    const { app, env } = await createApp();
    const res = await app.fetch(mockRequest('GET', 'http://localhost/health'), env);
    expect(res.headers.get('access-control-allow-origin')).toBe('*');
  });
});
