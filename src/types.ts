export interface TokenMeta {
  chain: string;
  contractAddress: string;
  symbol: string;
  decimals: number;
  name: string | null;
  logo: string | null;
  updatedAt: number;
}

export interface UpsertTokenRequest {
  chain: string;
  contractAddress: string;
  symbol: string;
  decimals: number;
  name?: string | null;
  logo?: string | null;
}

export interface TokenMetaResponse {
  success: boolean;
  data?: TokenMeta;
  error?: string;
}

export interface TokenMetaListResponse {
  success: boolean;
  data: TokenMeta[];
}

export interface HealthResponse {
  status: string;
  timestamp: string;
  version: string;
}

export interface Env {
  TOKEN_META: KVNamespace;
  TOKEN_META_CACHE_TTL?: string;
  REQUEST_TIMEOUT_SECS?: string;
}
