# TokensApi

All URIs are relative to *https://token-meta.bithub.pro*

| Method | HTTP request | Description |
|------------- | ------------- | -------------|
| [**apiV1TokensChainContractAddressGet**](TokensApi.md#apiv1tokenschaincontractaddressget) | **GET** /api/v1/tokens/{chain}/{contractAddress} | Get token metadata |
| [**apiV1TokensChainContractAddressLogoGet**](TokensApi.md#apiv1tokenschaincontractaddresslogoget) | **GET** /api/v1/tokens/{chain}/{contractAddress}/logo | Get token logo |



## apiV1TokensChainContractAddressGet

> ApiV1TokensChainContractAddressGet200Response apiV1TokensChainContractAddressGet(chain, contractAddress, force)

Get token metadata

Fetch metadata for a specific token by chain and contract address. On first lookup, sources from CoinGecko → on-chain RPC eth_call. Supports ?force&#x3D;true to skip cache and refresh from external sources.

### Example

```ts
import {
  Configuration,
  TokensApi,
} from 'token-meta-gateway';
import type { ApiV1TokensChainContractAddressGetRequest } from 'token-meta-gateway';

async function example() {
  console.log("🚀 Testing token-meta-gateway SDK...");
  const api = new TokensApi();

  const body = {
    // string
    chain: eip155:1,
    // string
    contractAddress: 0xdAC17F958D2ee523a2206206994597C13D831ec7,
    // 'true' | Skip cache and force refresh from external sources (optional)
    force: force_example,
  } satisfies ApiV1TokensChainContractAddressGetRequest;

  try {
    const data = await api.apiV1TokensChainContractAddressGet(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **chain** | `string` |  | [Defaults to `undefined`] |
| **contractAddress** | `string` |  | [Defaults to `undefined`] |
| **force** | `true` | Skip cache and force refresh from external sources | [Optional] [Defaults to `undefined`] [Enum: true] |

### Return type

[**ApiV1TokensChainContractAddressGet200Response**](ApiV1TokensChainContractAddressGet200Response.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Token metadata |  -  |
| **404** | Token not found |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## apiV1TokensChainContractAddressLogoGet

> Blob apiV1TokensChainContractAddressLogoGet(chain, contractAddress)

Get token logo

Proxy token logo image from external CDN (CoinGecko or Trust Wallet). Returns the image bytes directly with edge caching.

### Example

```ts
import {
  Configuration,
  TokensApi,
} from 'token-meta-gateway';
import type { ApiV1TokensChainContractAddressLogoGetRequest } from 'token-meta-gateway';

async function example() {
  console.log("🚀 Testing token-meta-gateway SDK...");
  const api = new TokensApi();

  const body = {
    // string
    chain: eip155:1,
    // string
    contractAddress: 0xdAC17F958D2ee523a2206206994597C13D831ec7,
  } satisfies ApiV1TokensChainContractAddressLogoGetRequest;

  try {
    const data = await api.apiV1TokensChainContractAddressLogoGet(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **chain** | `string` |  | [Defaults to `undefined`] |
| **contractAddress** | `string` |  | [Defaults to `undefined`] |

### Return type

**Blob**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `image/png`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Logo image (PNG) |  -  |
| **404** | Logo not found or chain not supported |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)

