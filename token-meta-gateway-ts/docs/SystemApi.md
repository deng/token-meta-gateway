# SystemApi

All URIs are relative to *https://token-meta.bithub.pro*

| Method | HTTP request | Description |
|------------- | ------------- | -------------|
| [**healthGet**](SystemApi.md#healthget) | **GET** /health | Health check |



## healthGet

> HealthGet200Response healthGet()

Health check

### Example

```ts
import {
  Configuration,
  SystemApi,
} from 'token-meta-gateway';
import type { HealthGetRequest } from 'token-meta-gateway';

async function example() {
  console.log("🚀 Testing token-meta-gateway SDK...");
  const api = new SystemApi();

  try {
    const data = await api.healthGet();
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters

This endpoint does not need any parameter.

### Return type

[**HealthGet200Response**](HealthGet200Response.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Service healthy |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)

