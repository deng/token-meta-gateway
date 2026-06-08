import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { swaggerUI } from '@hono/swagger-ui';
import { openApiSpec } from './openapi';
import { BUILTIN_TOKENS } from './builtin';
import type { TokenMeta, UpsertTokenRequest, HealthResponse, Env } from './types';

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
      await kv.put(key, JSON.stringify({ ...token, updatedAt: Date.now() }));
    }
  }
}

// Lazily seed on first request rather than at module top level
let seeded = false;

app.post('/api/v1/tokens', async (c) => {
  if (!seeded) { seeded = true; seedBuiltin(c.env.TOKEN_META, new Set()); }

  let body: UpsertTokenRequest;
  try {
    body = await c.req.json();
  } catch {
    return c.json({ success: false, error: 'Invalid JSON body' }, 400);
  }

  if (!body.chain || !body.contractAddress || !body.symbol || body.decimals == null) {
    return c.json({
      success: false,
      error: "Fields 'chain', 'contractAddress', 'symbol', and 'decimals' are required",
    }, 400);
  }

  const key = kvKey(body.chain, body.contractAddress);
  const existing = await c.env.TOKEN_META.get(key, 'json') as TokenMeta | null;

  const meta: TokenMeta = {
    chain: body.chain,
    contractAddress: body.contractAddress.toLowerCase(),
    symbol: body.symbol,
    decimals: body.decimals,
    name: body.name ?? existing?.name ?? null,
    logo: body.logo ?? existing?.logo ?? null,
    updatedAt: Date.now(),
  };

  await c.env.TOKEN_META.put(key, JSON.stringify(meta));
  return c.json({ success: true, data: meta });
});

app.get('/api/v1/tokens/:chain/:contractAddress', async (c) => {
  if (!seeded) { seeded = true; seedBuiltin(c.env.TOKEN_META, new Set()); }

  const { chain, contractAddress } = c.req.param();
  const key = kvKey(chain, contractAddress);
  const data = await c.env.TOKEN_META.get(key, 'json') as TokenMeta | null;

  if (!data) {
    return c.json({ success: false, error: 'Token not found' }, 404);
  }
  return c.json({ success: true, data });
});

export default {
  fetch: app.fetch,
};
