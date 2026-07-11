import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { swaggerUI } from '@hono/swagger-ui';
import { openApiSpec } from './openapi';
import { BUILTIN_TOKENS } from './builtin';
import type { TokenMeta, HealthResponse, Pagination, Env } from './types';
import { keccak256 } from 'js-sha3';

const app = new Hono<{ Bindings: Env }>();

app.use('*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'OPTIONS'],
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
      await kv.put(key, JSON.stringify({
        ...token,
        logo: logoUrl(token.chain, token.contractAddress),
        updatedAt: Date.now(),
      }));
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

// ---- List cache (per-isolate, for token list endpoints) ----

interface ListCacheEntry {
  data: TokenMeta[];
  pagination: Pagination;
  expiresAt: number;
}

const listCache = new Map<string, ListCacheEntry>();

function listCacheGet(key: string): { data: TokenMeta[]; pagination: Pagination } | null {
  const entry = listCache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    listCache.delete(key);
    return null;
  }
  return { data: entry.data, pagination: entry.pagination };
}

function listCacheSet(key: string, data: TokenMeta[], pagination: Pagination, ttlSecs: number): void {
  listCache.set(key, { data, pagination, expiresAt: Date.now() + ttlSecs * 1000 });
}

// Trust Wallet chain name mapping for logo URLs
const TW_CHAINS: Record<string, string> = {
  'eip155:1': 'ethereum',
  'eip155:56': 'smartchain',
  'eip155:137': 'polygon',
  'eip155:10': 'optimism',
  'eip155:42161': 'arbitrum',
  'eip155:43114': 'avalanchec',
  'eip155:250': 'fantom',
  'eip155:100': 'gnosis',
  'eip155:8453': 'base',
  'eip155:324': 'zksync',
  'eip155:42220': 'celo',
  'eip155:1284': 'moonbeam',
  'eip155:1285': 'moonriver',
  'eip155:25': 'cronos',
  'tron:0x2b6653dc': 'tron',
  'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp': 'solana',
};

function logoUrl(chain: string, address: string): string | null {
  const twChain = TW_CHAINS[chain];
  if (!twChain) return null;
  const addr = chain.startsWith('eip155:') && address.startsWith('0x') ? toChecksumAddress(address) : address;
  return `https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/${twChain}/assets/${addr}/logo.png`;
}

// EIP-55 checksum address
function toChecksumAddress(address: string): string {
  const addr = address.toLowerCase().replace('0x', '');
  const hash = keccak256(addr);
  let checksummed = '0x';
  for (let i = 0; i < 40; i++) {
    checksummed += parseInt(hash[i], 16) >= 8 ? addr[i].toUpperCase() : addr[i];
  }
  return checksummed;
}
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

// CoinGecko chain name mapping
const CG_CHAINS: Record<string, string> = {
  'eip155:1': 'ethereum',
  'eip155:56': 'binance-smart-chain',
  'eip155:137': 'polygon-pos',
  'eip155:10': 'optimistic-ethereum',
  'eip155:42161': 'arbitrum-one',
  'eip155:43114': 'avalanche',
  'eip155:250': 'fantom',
  'eip155:100': 'gnosis',
  'eip155:8453': 'base',
  'eip155:324': 'zksync',
  'eip155:42220': 'celo',
  'eip155:1284': 'moonbeam',
  'eip155:1285': 'moonriver',
  'eip155:25': 'cronos',
  'tron:0x2b6653dc': 'tron',
  'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp': 'solana',
};

async function fetchFromCoinGecko(chain: string, address: string, timeoutSecs: number): Promise<TokenMeta | null> {
  const cgChain = CG_CHAINS[chain];
  if (!cgChain) return null;

  const addr = address.toLowerCase();
  const url = `https://api.coingecko.com/api/v3/coins/${cgChain}/contract/${addr}`;

  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'ZeroWallet/1.0' },
      signal: AbortSignal.timeout(timeoutSecs * 1000),
    });
    if (!res.ok) return null;

    const data = await res.json() as Record<string, unknown>;

    const platforms = data.detail_platforms as Record<string, { decimal_place?: number }> | undefined;
    const decimals = platforms?.[cgChain]?.decimal_place ?? null;
    const symbol = data.symbol ? String(data.symbol).toUpperCase() : null;
    if (!symbol || decimals == null) return null;

    const cgImage = data.image as Record<string, string> | undefined;
    return {
      chain,
      contractAddress: addr,
      symbol,
      decimals,
      name: data.name ? String(data.name) : null,
      logo: cgImage?.large || logoUrl(chain, addr),
      updatedAt: Date.now(),
    };
  } catch {
    return null;
  }
}

// Fetch token metadata from ERC20 contract via RPC eth_call (fallback when CoinGecko unavailable)
async function fetchFromRPC(chain: string, address: string, timeoutSecs: number): Promise<TokenMeta | null> {
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
    logo: logoUrl(chain, addr),
    updatedAt: Date.now(),
  };
}

// Fetch token metadata: CoinGecko first, fall back to on-chain RPC
async function fetchFromExternal(chain: string, address: string, timeoutSecs: number): Promise<TokenMeta | null> {
  // Try CoinGecko first
  if (CG_CHAINS[chain]) {
    const cgTimeout = Math.min(timeoutSecs, 5);
    const result = await fetchFromCoinGecko(chain, address, cgTimeout);
    if (result) return result;
  }

  // Fall back to RPC eth_call for EVM chains
  if (EVM_RPCS[chain]) {
    const rpcTimeout = Math.max(1, timeoutSecs - 5);
    return fetchFromRPC(chain, address, rpcTimeout);
  }

  return null;
}

// Replace external logo URL with gateway proxy URL so clients never hit external CDNs
function proxyLogoUrl(data: TokenMeta, host: string): TokenMeta {
  if (!data.logo) return data;
  return { ...data, logo: `${host}/api/v1/tokens/${data.chain}/${data.contractAddress}/logo` };
}

// ---- StellarExpert token list support ----

const LIST_CACHE_TTL = 300; // 5 minutes

// StellarExpert API base URL per network
function stellarExpertUrl(chain: string): string | null {
  if (chain === 'stellar:pubnet') return 'https://api.stellar.expert/explorer/public/asset';
  if (chain === 'stellar:testnet') return 'https://api.stellar.expert/explorer/testnet/asset';
  return null;
}

interface StellarExpertTomlInfo {
  code?: string;
  issuer?: string;
  orgName?: string;
  image?: string;
  anchorAsset?: string;
  anchorAssetType?: string;
}

interface StellarExpertRecord {
  asset: string;
  tomlInfo?: StellarExpertTomlInfo;
}

interface StellarExpertResponse {
  _embedded: {
    records: StellarExpertRecord[];
  };
  total: number;
}

function listCacheKey(chain: string, limit: number, page: number, search?: string): string {
  return `list:${chain}:${limit}:${page}:${search || ''}`;
}

// Parse Stellar asset identifier into code and issuer.
// Custom token asset format: {code}-{56-char-issuer}-{version}
// Native XLM: just "XLM"
function parseStellarAsset(asset: string, tomlInfo?: StellarExpertTomlInfo): { code: string; issuer: string | null } {
  // Prefer tomlInfo when available
  if (tomlInfo?.code) {
    return { code: tomlInfo.code, issuer: tomlInfo.issuer || null };
  }

  // Native XLM — no issuer
  if (asset === 'XLM') {
    return { code: 'XLM', issuer: null };
  }

  // Parse from asset string: {code}-{56-char-issuer}-{version}
  const parts = asset.split('-');
  for (let i = 0; i < parts.length; i++) {
    if (parts[i].length === 56 && parts[i].startsWith('G')) {
      const code = parts.slice(0, i).join('-');
      return { code, issuer: parts[i] };
    }
  }

  // Fallback: treat entire asset as the code
  return { code: asset, issuer: null };
}

async function fetchStellarAssets(chain: string, limit: number, page: number, search?: string): Promise<{ data: TokenMeta[]; total: number } | null> {
  const apiUrl = stellarExpertUrl(chain);
  if (!apiUrl) return null;

  const url = new URL(apiUrl);
  url.searchParams.set('limit', String(limit));
  url.searchParams.set('page', String(page));
  if (search) url.searchParams.set('search', search);

  try {
    const res = await fetch(url.toString(), {
      headers: { 'User-Agent': 'ZeroWallet/1.0' },
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) return null;

    const json = await res.json() as StellarExpertResponse;
    const records = json._embedded?.records || [];
    return {
      data: records.map(r => {
        const { code, issuer } = parseStellarAsset(r.asset, r.tomlInfo);
        return {
          chain,
          contractAddress: issuer ? `${code}-${issuer}` : code,
          symbol: code,
          decimals: 7, // Stellar standard
          name: r.tomlInfo?.orgName || null,
          logo: r.tomlInfo?.image || null,
          updatedAt: Date.now(),
        };
      }),
      total: json.total,
    };
  } catch {
    return null;
  }
}

// Token list by chain — proxies StellarExpert public asset API
app.get('/api/v1/tokens/:chain/list', async (c) => {
  const { chain } = c.req.param();

  // Only Stellar is supported for now
  if (!stellarExpertUrl(chain)) {
    return c.json({
      success: true,
      data: [],
      pagination: { page: 1, limit: 50, total: 0 },
    });
  }

  const limit = Math.min(Math.max(1, parseInt(c.req.query('limit') || '50', 10) || 50), 200);
  const page = Math.max(1, parseInt(c.req.query('page') || '1', 10) || 1);
  const search = c.req.query('search') || undefined;

  // Check in-memory cache
  const cacheKey = listCacheKey(chain, limit, page, search);
  const cached = listCacheGet(cacheKey);
  if (cached) {
    return c.json({ success: true, ...cached });
  }

  // Fetch from StellarExpert
  const result = await fetchStellarAssets(chain, limit, page, search);
  if (!result) {
    return c.json({
      success: true,
      data: [],
      pagination: { page, limit, total: 0 },
    });
  }

  const pagination: Pagination = { page, limit, total: result.total };
  listCacheSet(cacheKey, result.data, pagination, LIST_CACHE_TTL);

  return c.json({ success: true, data: result.data, pagination });
});

app.get('/api/v1/tokens/:chain/:contractAddress', async (c) => {
  if (!seeded) { seeded = true; seedBuiltin(c.env.TOKEN_META, new Set()); }

  const { chain, contractAddress } = c.req.param();
  const key = kvKey(chain, contractAddress);
  const ttl = parseInt(c.env.TOKEN_META_CACHE_TTL || '300', 10);
  const force = c.req.query('force') === 'true';

  const origin = new URL(c.req.url).origin;
  let data: TokenMeta | null = null;
  if (!force) {
    data = cacheGet(key);
    if (data) return c.json({ success: true, data: proxyLogoUrl(data, origin) });

    data = await c.env.TOKEN_META.get(key, 'json') as TokenMeta | null;
    if (data) {
      cacheSet(key, data, ttl);
      return c.json({ success: true, data: proxyLogoUrl(data, origin) });
    }
  }

  const timeout = parseInt(c.env.REQUEST_TIMEOUT_SECS || '10', 10);
  let pending = pendingFetches.get(key);
  if (!pending || force) {
    pending = fetchFromExternal(chain, contractAddress, timeout)
      .then(async (result) => {
        if (result) {
          await c.env.TOKEN_META.put(key, JSON.stringify(result));
          cacheSet(key, result, ttl);
        }
        pendingFetches.delete(key);
        return result;
      });
    if (!force) pendingFetches.set(key, pending);
  }
  data = await pending;

  if (!data) {
    if (force) {
      data = await c.env.TOKEN_META.get(key, 'json') as TokenMeta | null;
      if (data) {
        cacheSet(key, data, ttl);
        return c.json({ success: true, data: proxyLogoUrl(data, origin) });
      }
    }
    return c.json({ success: false, error: 'Token not found' }, 404);
  }
  return c.json({ success: true, data: proxyLogoUrl(data, origin) });
});

// Batch token query — same chain, multiple contract addresses
app.post('/api/v1/tokens/:chain/batch', async (c) => {
  if (!seeded) { seeded = true; seedBuiltin(c.env.TOKEN_META, new Set()); }

  const { chain } = c.req.param();
  const { addresses } = await c.req.json() as { addresses?: string[] };

  if (!addresses || !Array.isArray(addresses) || addresses.length === 0) {
    return c.json({ success: false, error: 'Field "addresses" is required' }, 400);
  }

  const ttl = parseInt(c.env.TOKEN_META_CACHE_TTL || '300', 10);
  const timeout = parseInt(c.env.REQUEST_TIMEOUT_SECS || '10', 10);
  const origin = new URL(c.req.url).origin;

  // First pass: gather from cache and KV in parallel
  const results: (TokenMeta | null)[] = new Array(addresses.length).fill(null);
  const missing: number[] = [];

  await Promise.all(addresses.map(async (addr, i) => {
    const key = kvKey(chain, addr);
    let token = cacheGet(key);
    if (!token) {
      token = await c.env.TOKEN_META.get(key, 'json') as TokenMeta | null;
      if (token) cacheSet(key, token, ttl);
    }
    if (token) {
      results[i] = token;
    } else {
      missing.push(i);
    }
  }));

  // Second pass: fetch missing from external sources in parallel with dedup
  if (missing.length > 0) {
    await Promise.allSettled(missing.map(async (i) => {
      const addr = addresses[i];
      const key = kvKey(chain, addr);

      let pending = pendingFetches.get(key);
      if (!pending) {
        pending = fetchFromExternal(chain, addr, timeout)
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

      const token = await pending;
      if (token) results[i] = token;
    }));
  }

  const data = results.map(r => r ? proxyLogoUrl(r, origin) : null);
  return c.json({ success: true, data });
});

// Logo proxy — prefer CoinGecko image from KV, fall back to Trust Wallet CDN
app.get('/api/v1/tokens/:chain/:contractAddress/logo', async (c) => {
  if (!seeded) { seeded = true; seedBuiltin(c.env.TOKEN_META, new Set()); }

  const { chain, contractAddress } = c.req.param();
  const key = kvKey(chain, contractAddress);

  // Try stored token metadata first (may have CoinGecko image)
  let logo: string | null = null;
  const cached = cacheGet(key);
  if (cached?.logo) {
    logo = cached.logo;
  } else {
    const stored = await c.env.TOKEN_META.get(key, 'json') as TokenMeta | null;
    if (stored?.logo) {
      logo = stored.logo;
      cacheSet(key, stored, parseInt(c.env.TOKEN_META_CACHE_TTL || '300', 10));
    }
  }

  // Fall back to Trust Wallet URL
  if (!logo) logo = logoUrl(chain, contractAddress);
  if (!logo) return c.json({ success: false, error: 'Chain not supported' }, 404);

  const res = await fetch(logo, { signal: AbortSignal.timeout(10000) });
  if (!res.ok) return c.json({ success: false, error: 'Logo not found' }, 404);

  const buf = await res.arrayBuffer();
  return c.body(buf, 200, {
    'Content-Type': res.headers.get('Content-Type') || 'image/png',
    'Cache-Control': 'public, max-age=86400, s-maxage=604800',
  });
});

export default {
  fetch: app.fetch,
};
