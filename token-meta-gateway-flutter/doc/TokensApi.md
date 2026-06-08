# token_meta_gateway.api.TokensApi

## Load the API package
```dart
import 'package:token_meta_gateway/api.dart';
```

All URIs are relative to *https://token-meta.bithub.pro*

Method | HTTP request | Description
------------- | ------------- | -------------
[**apiV1TokensChainBatchPost**](TokensApi.md#apiv1tokenschainbatchpost) | **POST** /api/v1/tokens/{chain}/batch | Batch token metadata query
[**apiV1TokensChainContractAddressGet**](TokensApi.md#apiv1tokenschaincontractaddressget) | **GET** /api/v1/tokens/{chain}/{contractAddress} | Get token metadata
[**apiV1TokensChainContractAddressLogoGet**](TokensApi.md#apiv1tokenschaincontractaddresslogoget) | **GET** /api/v1/tokens/{chain}/{contractAddress}/logo | Get token logo


# **apiV1TokensChainBatchPost**
> ApiV1TokensChainBatchPost200Response apiV1TokensChainBatchPost(chain, apiV1TokensChainBatchPostRequest)

Batch token metadata query

Query multiple token metadata entries for the same chain. Checks cache → KV → external sources (CoinGecko → RPC). Returns results in the same order as the input addresses array.

### Example
```dart
import 'package:token_meta_gateway/api.dart';

final api_instance = TokensApi();
final chain = eip155:1; // String | 
final apiV1TokensChainBatchPostRequest = ApiV1TokensChainBatchPostRequest(); // ApiV1TokensChainBatchPostRequest | 

try {
    final result = api_instance.apiV1TokensChainBatchPost(chain, apiV1TokensChainBatchPostRequest);
    print(result);
} catch (e) {
    print('Exception when calling TokensApi->apiV1TokensChainBatchPost: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **chain** | **String**|  | 
 **apiV1TokensChainBatchPostRequest** | [**ApiV1TokensChainBatchPostRequest**](ApiV1TokensChainBatchPostRequest.md)|  | 

### Return type

[**ApiV1TokensChainBatchPost200Response**](ApiV1TokensChainBatchPost200Response.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **apiV1TokensChainContractAddressGet**
> ApiV1TokensChainContractAddressGet200Response apiV1TokensChainContractAddressGet(chain, contractAddress, force)

Get token metadata

Fetch metadata for a specific token by chain and contract address. On first lookup, sources from CoinGecko → on-chain RPC eth_call. Supports ?force=true to skip cache and refresh from external sources.

### Example
```dart
import 'package:token_meta_gateway/api.dart';

final api_instance = TokensApi();
final chain = eip155:1; // String | 
final contractAddress = 0xdAC17F958D2ee523a2206206994597C13D831ec7; // String | 
final force = force_example; // String | Skip cache and force refresh from external sources

try {
    final result = api_instance.apiV1TokensChainContractAddressGet(chain, contractAddress, force);
    print(result);
} catch (e) {
    print('Exception when calling TokensApi->apiV1TokensChainContractAddressGet: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **chain** | **String**|  | 
 **contractAddress** | **String**|  | 
 **force** | **String**| Skip cache and force refresh from external sources | [optional] 

### Return type

[**ApiV1TokensChainContractAddressGet200Response**](ApiV1TokensChainContractAddressGet200Response.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **apiV1TokensChainContractAddressLogoGet**
> MultipartFile apiV1TokensChainContractAddressLogoGet(chain, contractAddress)

Get token logo

Proxy token logo image from external CDN (CoinGecko or Trust Wallet). Returns the image bytes directly with edge caching.

### Example
```dart
import 'package:token_meta_gateway/api.dart';

final api_instance = TokensApi();
final chain = eip155:1; // String | 
final contractAddress = 0xdAC17F958D2ee523a2206206994597C13D831ec7; // String | 

try {
    final result = api_instance.apiV1TokensChainContractAddressLogoGet(chain, contractAddress);
    print(result);
} catch (e) {
    print('Exception when calling TokensApi->apiV1TokensChainContractAddressLogoGet: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **chain** | **String**|  | 
 **contractAddress** | **String**|  | 

### Return type

[**MultipartFile**](MultipartFile.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: image/png

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

