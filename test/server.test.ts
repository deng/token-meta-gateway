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

describe('GET /api/v1/tokens/:chain/:contractAddress — external API fallback', () => {
  it('should fetch from CoinGecko when available', async () => {
    const kv = mockKV();
    const { app, env } = await createApp(mockEnv(kv));

    let rpcCalled = false;
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockImplementation(async (url) => {
      const u = typeof url === 'string' ? url : '';
      if (u.startsWith('https://api.coingecko.com')) {
        return new Response(JSON.stringify({
          name: 'Uniswap',
          symbol: 'uni',
          image: { large: 'https://coin-images.coingecko.com/uni.png' },
          detail_platforms: { ethereum: { decimal_place: 18 } },
        }), { status: 200 });
      }
      if (u.startsWith('https://ethereum-rpc.publicnode.com')) {
        rpcCalled = true;
        return new Response(JSON.stringify({ jsonrpc: '2.0', id: 1, result: '0x' }));
      }
      return new Response('not found', { status: 404 });
    });

    const res = await app.fetch(mockRequest('GET', 'http://localhost/api/v1/tokens/eip155:1/0x1f9840a85d5af5bf1d1762f925bdaddc4201f984'), env);

    expect(res.status).toBe(200);
    const body = await res.json() as any;
    expect(body.data.symbol).toBe('UNI');
    expect(body.data.decimals).toBe(18);
    expect(body.data.name).toBe('Uniswap');
    expect(body.data.logo).toBe('https://coin-images.coingecko.com/uni.png');
    expect(rpcCalled).toBe(false);

    fetchSpy.mockRestore();
  });

  it('should fall back to RPC when CoinGecko fails', async () => {
    const kv = mockKV();
    const { app, env } = await createApp(mockEnv(kv));

    // ABI-encoded responses for eth_call
    const nameResult = '0x0000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000000a536f6d6520546f6b656e00000000000000000000000000000000000000000000';
    const symbolResult = '0x00000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000004534f4d4500000000000000000000000000000000000000000000000000000000';
    const decimalsResult = '0x0000000000000000000000000000000000000000000000000000000000000012';

    let rpcCallCount = 0;
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockImplementation(async (url, opts) => {
      const u = typeof url === 'string' ? url : '';
      if (u.startsWith('https://api.coingecko.com')) {
        return new Response('rate limited', { status: 429 });
      }
      if (u === 'https://ethereum-rpc.publicnode.com') {
        rpcCallCount++;
        const body = JSON.parse((opts as RequestInit).body as string);
        const data = body.params[0].data as string;
        let result: string;
        if (data.startsWith('0x06fdde03')) result = nameResult;
        else if (data.startsWith('0x95d89b41')) result = symbolResult;
        else if (data.startsWith('0x313ce567')) result = decimalsResult;
        else result = '0x';
        return new Response(JSON.stringify({ jsonrpc: '2.0', id: 1, result }));
      }
      return new Response('not found', { status: 404 });
    });

    const res = await app.fetch(mockRequest('GET', 'http://localhost/api/v1/tokens/eip155:1/0x1234567890123456789012345678901234567890'), env);

    expect(res.status).toBe(200);
    const body = await res.json() as any;
    expect(body.data.symbol).toBe('SOME');
    expect(body.data.decimals).toBe(18);
    expect(body.data.name).toBe('Some Token');
    expect(body.data.chain).toBe('eip155:1');
    expect(body.data.logo).toBe('https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x1234567890123456789012345678901234567890/logo.png');
    expect(rpcCallCount).toBe(3);

    const stored = await (kv.get as any)('token:eip155:1:0x1234567890123456789012345678901234567890', 'json');
    expect(stored.symbol).toBe('SOME');

    fetchSpy.mockRestore();
  });

  it('should return 404 when both CoinGecko and RPC fail', async () => {
    const { app, env } = await createApp();
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockImplementation(async (url) => {
      const u = typeof url === 'string' ? url : '';
      if (u.startsWith('https://api.coingecko.com')) {
        return new Response('rate limited', { status: 429 });
      }
      if (u === 'https://ethereum-rpc.publicnode.com') {
        return new Response(JSON.stringify({ jsonrpc: '2.0', id: 1, result: '0x' }));
      }
      return new Response('not found', { status: 404 });
    });
    const res = await app.fetch(mockRequest('GET', 'http://localhost/api/v1/tokens/eip155:1/0x999'), env);
    expect(res.status).toBe(404);
    const body = await res.json() as any;
    expect(body.success).toBe(false);
    expect(body.error).toBe('Token not found');

    fetchSpy.mockRestore();
  });

  it('should return 404 for non-EVM chains not in KV', async () => {
    const { app, env } = await createApp();
    const res = await app.fetch(mockRequest('GET', 'http://localhost/api/v1/tokens/sui:mainnet/0xunknown::coin::COIN'), env);
    expect(res.status).toBe(404);
  });

  it('should force refresh from external API when force=true', async () => {
    const kv = mockKV({
      'token:eip155:1:0xabc': JSON.stringify({
        chain: 'eip155:1',
        contractAddress: '0xabc',
        symbol: 'OLD',
        decimals: 18,
        name: 'Old Name',
        logo: 'https://old.logo/old.png',
        updatedAt: 0,
      }),
    });
    const { app, env } = await createApp(mockEnv(kv));

    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockImplementation(async (url) => {
      const u = typeof url === 'string' ? url : '';
      if (u.startsWith('https://api.coingecko.com')) {
        return new Response(JSON.stringify({
          name: 'New Token',
          symbol: 'NEW',
          image: { large: 'https://new.logo/new.png' },
          detail_platforms: { ethereum: { decimal_place: 6 } },
        }), { status: 200 });
      }
      return new Response('not found', { status: 404 });
    });

    const res = await app.fetch(mockRequest('GET', 'http://localhost/api/v1/tokens/eip155:1/0xabc?force=true'), env);

    expect(res.status).toBe(200);
    const body = await res.json() as any;
    expect(body.data.symbol).toBe('NEW');
    expect(body.data.decimals).toBe(6);
    expect(body.data.name).toBe('New Token');
    expect(body.data.logo).toBe('https://new.logo/new.png');

    // Verify KV was updated
    const stored = await (kv.get as any)('token:eip155:1:0xabc', 'json');
    expect(stored.symbol).toBe('NEW');

    fetchSpy.mockRestore();
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
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockImplementation(async (url) => {
      const u = typeof url === 'string' ? url : '';
      if (u.startsWith('https://api.coingecko.com')) {
        return new Response('rate limited', { status: 429 });
      }
      if (u.startsWith('https://ethereum-rpc.publicnode.com')) {
        return new Response(JSON.stringify({ jsonrpc: '2.0', id: 1, result: '0x' }));
      }
      return new Response('not found', { status: 404 });
    });

    const res = await app.fetch(mockRequest('GET', 'http://localhost/api/v1/tokens/eip155:1/0x999'), env);
    expect(res.status).toBe(404);
    const body = await res.json() as any;
    expect(body.success).toBe(false);
    expect(body.error).toBe('Token not found');

    fetchSpy.mockRestore();
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
