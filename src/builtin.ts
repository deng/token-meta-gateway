import type { TokenMeta } from './types';

export const BUILTIN_TOKENS: TokenMeta[] = [
  // ---- Ethereum ----
  {
    chain: 'eip155:1', contractAddress: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
    symbol: 'USDT', decimals: 6, name: 'Tether USD', logo: null, updatedAt: 0,
  },
  {
    chain: 'eip155:1', contractAddress: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
    symbol: 'USDC', decimals: 6, name: 'USD Coin', logo: null, updatedAt: 0,
  },
  {
    chain: 'eip155:1', contractAddress: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
    symbol: 'DAI', decimals: 18, name: 'Dai Stablecoin', logo: null, updatedAt: 0,
  },
  {
    chain: 'eip155:1', contractAddress: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599',
    symbol: 'WBTC', decimals: 8, name: 'Wrapped BTC', logo: null, updatedAt: 0,
  },

  // ---- BSC ----
  {
    chain: 'eip155:56', contractAddress: '0x55d398326f99059fF775485246999027B3197955',
    symbol: 'USDT', decimals: 18, name: 'Tether USD (BSC)', logo: null, updatedAt: 0,
  },
  {
    chain: 'eip155:56', contractAddress: '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d',
    symbol: 'USDC', decimals: 18, name: 'USD Coin (BSC)', logo: null, updatedAt: 0,
  },
  {
    chain: 'eip155:56', contractAddress: '0x2170Ed0880ac9A755fd29B2688956BD959F933F8',
    symbol: 'ETH', decimals: 18, name: 'Ethereum (BSC)', logo: null, updatedAt: 0,
  },

  // ---- Polygon ----
  {
    chain: 'eip155:137', contractAddress: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F',
    symbol: 'USDT', decimals: 6, name: 'Tether USD (Polygon)', logo: null, updatedAt: 0,
  },
  {
    chain: 'eip155:137', contractAddress: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
    symbol: 'USDC', decimals: 6, name: 'USD Coin (Polygon)', logo: null, updatedAt: 0,
  },

  // ---- TRON ----
  {
    chain: 'tron:0x2b6653dc', contractAddress: 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t',
    symbol: 'USDT', decimals: 6, name: 'Tether USD (TRC20)', logo: null, updatedAt: 0,
  },
  {
    chain: 'tron:0x2b6653dc', contractAddress: 'TEkxiTehnzSmL2nKQ3nLxCEG6gd2QqLEQB',
    symbol: 'USDC', decimals: 6, name: 'USD Coin (TRC20)', logo: null, updatedAt: 0,
  },

  // ---- Solana ----
  {
    chain: 'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp', contractAddress: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB',
    symbol: 'USDT', decimals: 6, name: 'USDT (Solana)', logo: null, updatedAt: 0,
  },
  {
    chain: 'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp', contractAddress: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
    symbol: 'USDC', decimals: 6, name: 'USD Coin (Solana)', logo: null, updatedAt: 0,
  },

  // ---- Sui ----
  {
    chain: 'sui:mainnet', contractAddress: '0x5d4b302506645c37ff133b98c4b50a5ae14841659738d6d733d59d0d217a93bf::coin::COIN',
    symbol: 'USDC', decimals: 6, name: 'USD Coin (Sui)', logo: null, updatedAt: 0,
  },

  // ---- Aptos ----
  {
    chain: 'aptos:1', contractAddress: '0x498d8926f16eb9ca90cab1b3a26aa6f97a080b3fcbe6e83ae150d62488a3c26a',
    symbol: 'USDC', decimals: 6, name: 'USD Coin (Aptos)', logo: null, updatedAt: 0,
  },
];
