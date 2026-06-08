import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { swaggerUI } from '@hono/swagger-ui';
import { openApiSpec } from './openapi';
import { BUILTIN_TOKENS } from './builtin';
import type { TokenMeta, HealthResponse, Env } from './types';

const app = new Hono<{ Bindings: Env }>();

app.use('*', cors({
  origin: '*',
  allowMethods: ['GET', 'OPTIONS'],
  allowHeaders: ['Content-Type'],
  maxAge: 86400,
}));

app.get('/openapi.json', (c) => c.json(openApiSpec));
app.get('/docs', swaggerUI({ url: '/openapi.json' }));

app.get('/health', (c) => {
  return c.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '0.1.0',
  } satisfies HealthResponse);
});

function kvKey(chain: string, address: string): string {
  return `token:${chain}:${address.toLowerCase()}`;
}

// Seed built-in tokens at startup (runs once per Worker warm start)
async function seedBuiltin(kv: KVNamespace, seen: Set<string>): Promise<void> {
  for (const token of BUILTIN_TOKENS) {
    const key = kvKey(token.chain, token.contractAddress);
    if (seen.has(key)) continue;
    seen.add(key);
    const existing = await kv.get(key, 'json');
    if (!existing) {
      await kv.put(key, JSON.stringify({ ...token, updatedAt: Date.now() }));
    }
  }
}

// Lazily seed on first request rather than at module top level
let seeded = false;

// ---- In-memory cache (per-isolate) to avoid redundant KV reads & concurrent external fetches ----

interface CacheEntry {
  data: TokenMeta;
  expiresAt: number;
}

const memoryCache = new Map<string, CacheEntry>();
const pendingFetches = new Map<string, Promise<TokenMeta | null>>();

function cacheGet(key: string): TokenMeta | null {
  const entry = memoryCache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    memoryCache.delete(key);
    return null;
  }
  return entry.data;
}

function cacheSet(key: string, data: TokenMeta, ttlSecs: number): void {
  memoryCache.set(key, { data, expiresAt: Date.now() + ttlSecs * 1000 });
}

// EVM chain RPC endpoints for on-chain ERC20 metadata lookup
const EVM_RPCS: Record<string, string> = {
  'eip155:1': 'https://ethereum-rpc.publicnode.com',
  'eip155:56': 'https://bsc-dataseed.binance.org/',
  'eip155:137': 'https://polygon-rpc.com/',
  'eip155:10': 'https://mainnet.optimism.io',
  'eip155:42161': 'https://arb1.arbitrum.io/rpc',
  'eip155:43114': 'https://api.avax.network/ext/bc/C/rpc',
  'eip155:250': 'https://rpc.ftm.tools',
  'eip155:100': 'https://rpc.gnosischain.com',
  'eip155:8453': 'https://base-rpc.publicnode.com',
  'eip155:324': 'https://mainnet.era.zksync.io',
  'eip155:42220': 'https://forno.celo.org',
  'eip155:1284': 'https://rpc.api.moonbeam.network',
  'eip155:1285': 'https://rpc.api.moonriver.moonbeam.network',
  'eip155:25': 'https://evm.cronos.org',
};

// ERC20 function selectors
const SEL_NAME = '0x06fdde03';
const SEL_SYMBOL = '0x95d89b41';
const SEL_DECIMALS = '0x313ce567';

// Make an eth_call and return hex result
async function ethCall(rpc: string, to: string, data: string, timeoutSecs: number): Promise<string | null> {
  const body = JSON.stringify({
    jsonrpc: '2.0',
    id: 1,
    method: 'eth_call',
    params: [{ to, data }, 'latest'],
  });
  try {
    const res = await fetch(rpc, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
      signal: AbortSignal.timeout(timeoutSecs * 1000),
    });
    if (!res.ok) return null;
    const json = await res.json() as Record<string, unknown>;
    const result = json.result as string | undefined;
    if (!result || result === '0x') return null;
    return result;
  } catch {
    return null;
  }
}

// Decode ABI-encoded string from eth_call response (removes leading offset 32 bytes)
function decodeABIString(hex: string): string | null {
  // Strip 0x prefix
  let s = hex.startsWith('0x') ? hex.slice(2) : hex;
  // First 32 bytes (64 hex chars) = offset to data (usually 0x20 = 32)
  if (s.length < 64) return null;
  // Next 32 bytes = string length
  const lenHex = s.slice(64, 128);
  const len = parseInt(lenHex, 16);
  // Remaining = actual string data (padded to 32 bytes)
  const dataHex = s.slice(128, 128 + len * 2);
  if (!dataHex) return null;
  try {
    const bytes = new Uint8Array(dataHex.match(/.{1,2}/g)!.map(b => parseInt(b, 16)));
    return new TextDecoder().decode(bytes);
  } catch {
    return null;
  }
}

// Decode ABI-encoded uint256 (last 32 bytes = value)
function decodeABIUint(hex: string): number | null {
  let s = hex.startsWith('0x') ? hex.slice(2) : hex;
  // Pad to at least 64 hex chars
  s = s.padStart(64, '0');
  const val = parseInt(s.slice(-64), 16);
  return isNaN(val) ? null : val;
}

// Fetch token metadata by reading ERC20 contract directly via RPC eth_call
async function fetchFromExternal(chain: string, address: string, timeoutSecs: number): Promise<TokenMeta | null> {
  const rpc = EVM_RPCS[chain];
  if (!rpc) return null;

  const addr = address.toLowerCase().startsWith('0x') ? address.toLowerCase() : `0x${address.toLowerCase()}`;
  const perCallTimeout = Math.max(1, Math.floor(timeoutSecs / 3));

  const [nameHex, symbolHex, decimalsHex] = await Promise.all([
    ethCall(rpc, addr, SEL_NAME, perCallTimeout),
    ethCall(rpc, addr, SEL_SYMBOL, perCallTimeout),
    ethCall(rpc, addr, SEL_DECIMALS, perCallTimeout),
  ]);

  const symbol = symbolHex ? decodeABIString(symbolHex) : null;
  const decimals = decimalsHex ? decodeABIUint(decimalsHex) : null;
  if (!symbol || decimals == null) return null;

  return {
    chain,
    contractAddress: addr,
    symbol: symbol.toUpperCase(),
    decimals,
    name: nameHex ? decodeABIString(nameHex) ?? null : null,
    logo: null,
    updatedAt: Date.now(),
  };
}

app.get('/api/v1/tokens/:chain/:contractAddress', async (c) => {
  if (!seeded) { seeded = true; seedBuiltin(c.env.TOKEN_META, new Set()); }

  const { chain, contractAddress } = c.req.param();
  const key = kvKey(chain, contractAddress);
  const ttl = parseInt(c.env.TOKEN_META_CACHE_TTL || '300', 10);

  // 1. Check in-memory cache (fastest, avoids KV read)
  let data = cacheGet(key);
  if (data) return c.json({ success: true, data });

  // 2. Check KV
  data = await c.env.TOKEN_META.get(key, 'json') as TokenMeta | null;
  if (data) {
    cacheSet(key, data, ttl);
    return c.json({ success: true, data });
  }

  // 3. Fetch from external API with deduplication
  const timeout = parseInt(c.env.REQUEST_TIMEOUT_SECS || '10', 10);
  let pending = pendingFetches.get(key);
  if (!pending) {
    pending = fetchFromExternal(chain, contractAddress, timeout)
      .then(async (result) => {
        if (result) {
          await c.env.TOKEN_META.put(key, JSON.stringify(result));
          cacheSet(key, result, ttl);
        }
        pendingFetches.delete(key);
        return result;
      });
    pendingFetches.set(key, pending);
  }
  data = await pending;

  if (!data) {
    return c.json({ success: false, error: 'Token not found' }, 404);
  }
  return c.json({ success: true, data });
});

export default {
  fetch: app.fetch,
};
