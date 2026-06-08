# token_meta_gateway.api.TokensApi

## Load the API package
```dart
import 'package:token_meta_gateway/api.dart';
```

All URIs are relative to *https://token-meta.bithub.pro*

Method | HTTP request | Description
------------- | ------------- | -------------
[**apiV1TokensChainContractAddressGet**](TokensApi.md#apiv1tokenschaincontractaddressget) | **GET** /api/v1/tokens/{chain}/{contractAddress} | Get token metadata
[**apiV1TokensChainContractAddressLogoGet**](TokensApi.md#apiv1tokenschaincontractaddresslogoget) | **GET** /api/v1/tokens/{chain}/{contractAddress}/logo | Get token logo


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

