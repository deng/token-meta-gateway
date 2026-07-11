export interface TokenMeta {
  chain: string;
  contractAddress: string;
  symbol: string;
  decimals: number;
  name: string | null;
  logo: string | null;
  updatedAt: number;
}

export interface HealthResponse {
  status: string;
  timestamp: string;
  version: string;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
}

export interface Env {
  TOKEN_META: KVNamespace;
  TOKEN_META_CACHE_TTL?: string;
  REQUEST_TIMEOUT_SECS?: string;
}
