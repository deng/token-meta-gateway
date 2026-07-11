//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//
// @dart=2.18

// ignore_for_file: unused_element, unused_import
// ignore_for_file: always_put_required_named_parameters_first
// ignore_for_file: constant_identifier_names
// ignore_for_file: lines_longer_than_80_chars

part of openapi.api;


class TokensApi {
  TokensApi([ApiClient? apiClient]) : apiClient = apiClient ?? defaultApiClient;

  final ApiClient apiClient;

  /// Batch token metadata query
  ///
  /// Query multiple token metadata entries for the same chain. Checks cache → KV → external sources (CoinGecko → RPC). Returns results in the same order as the input addresses array.
  ///
  /// Note: This method returns the HTTP [Response].
  ///
  /// Parameters:
  ///
  /// * [String] chain (required):
  ///
  /// * [ApiV1TokensChainBatchPostRequest] apiV1TokensChainBatchPostRequest (required):
  Future<Response> apiV1TokensChainBatchPostWithHttpInfo(String chain, ApiV1TokensChainBatchPostRequest apiV1TokensChainBatchPostRequest,) async {
    // ignore: prefer_const_declarations
    final path = r'/api/v1/tokens/{chain}/batch'
      .replaceAll('{chain}', chain);

    // ignore: prefer_final_locals
    Object? postBody = apiV1TokensChainBatchPostRequest;

    final queryParams = <QueryParam>[];
    final headerParams = <String, String>{};
    final formParams = <String, String>{};

    const contentTypes = <String>['application/json'];


    return apiClient.invokeAPI(
      path,
      'POST',
      queryParams,
      postBody,
      headerParams,
      formParams,
      contentTypes.isEmpty ? null : contentTypes.first,
    );
  }

  /// Batch token metadata query
  ///
  /// Query multiple token metadata entries for the same chain. Checks cache → KV → external sources (CoinGecko → RPC). Returns results in the same order as the input addresses array.
  ///
  /// Parameters:
  ///
  /// * [String] chain (required):
  ///
  /// * [ApiV1TokensChainBatchPostRequest] apiV1TokensChainBatchPostRequest (required):
  Future<ApiV1TokensChainBatchPost200Response?> apiV1TokensChainBatchPost(String chain, ApiV1TokensChainBatchPostRequest apiV1TokensChainBatchPostRequest,) async {
    final response = await apiV1TokensChainBatchPostWithHttpInfo(chain, apiV1TokensChainBatchPostRequest,);
    if (response.statusCode >= HttpStatus.badRequest) {
      throw ApiException(response.statusCode, await _decodeBodyBytes(response));
    }
    // When a remote server returns no body with a status of 204, we shall not decode it.
    // At the time of writing this, `dart:convert` will throw an "Unexpected end of input"
    // FormatException when trying to decode an empty string.
    if (response.body.isNotEmpty && response.statusCode != HttpStatus.noContent) {
      return await apiClient.deserializeAsync(await _decodeBodyBytes(response), 'ApiV1TokensChainBatchPost200Response',) as ApiV1TokensChainBatchPost200Response;
    
    }
    return null;
  }

  /// Get token metadata
  ///
  /// Fetch metadata for a specific token by chain and contract address. On first lookup, sources from CoinGecko → on-chain RPC eth_call. Supports ?force=true to skip cache and refresh from external sources.
  ///
  /// Note: This method returns the HTTP [Response].
  ///
  /// Parameters:
  ///
  /// * [String] chain (required):
  ///
  /// * [String] contractAddress (required):
  ///
  /// * [String] force:
  ///   Skip cache and force refresh from external sources
  Future<Response> apiV1TokensChainContractAddressGetWithHttpInfo(String chain, String contractAddress, { String? force, }) async {
    // ignore: prefer_const_declarations
    final path = r'/api/v1/tokens/{chain}/{contractAddress}'
      .replaceAll('{chain}', chain)
      .replaceAll('{contractAddress}', contractAddress);

    // ignore: prefer_final_locals
    Object? postBody;

    final queryParams = <QueryParam>[];
    final headerParams = <String, String>{};
    final formParams = <String, String>{};

    if (force != null) {
      queryParams.addAll(_queryParams('', 'force', force));
    }

    const contentTypes = <String>[];


    return apiClient.invokeAPI(
      path,
      'GET',
      queryParams,
      postBody,
      headerParams,
      formParams,
      contentTypes.isEmpty ? null : contentTypes.first,
    );
  }

  /// Get token metadata
  ///
  /// Fetch metadata for a specific token by chain and contract address. On first lookup, sources from CoinGecko → on-chain RPC eth_call. Supports ?force=true to skip cache and refresh from external sources.
  ///
  /// Parameters:
  ///
  /// * [String] chain (required):
  ///
  /// * [String] contractAddress (required):
  ///
  /// * [String] force:
  ///   Skip cache and force refresh from external sources
  Future<ApiV1TokensChainContractAddressGet200Response?> apiV1TokensChainContractAddressGet(String chain, String contractAddress, { String? force, }) async {
    final response = await apiV1TokensChainContractAddressGetWithHttpInfo(chain, contractAddress,  force: force, );
    if (response.statusCode >= HttpStatus.badRequest) {
      throw ApiException(response.statusCode, await _decodeBodyBytes(response));
    }
    // When a remote server returns no body with a status of 204, we shall not decode it.
    // At the time of writing this, `dart:convert` will throw an "Unexpected end of input"
    // FormatException when trying to decode an empty string.
    if (response.body.isNotEmpty && response.statusCode != HttpStatus.noContent) {
      return await apiClient.deserializeAsync(await _decodeBodyBytes(response), 'ApiV1TokensChainContractAddressGet200Response',) as ApiV1TokensChainContractAddressGet200Response;
    
    }
    return null;
  }

  /// Get token logo
  ///
  /// Proxy token logo image from external CDN (CoinGecko or Trust Wallet). Returns the image bytes directly with edge caching.
  ///
  /// Note: This method returns the HTTP [Response].
  ///
  /// Parameters:
  ///
  /// * [String] chain (required):
  ///
  /// * [String] contractAddress (required):
  Future<Response> apiV1TokensChainContractAddressLogoGetWithHttpInfo(String chain, String contractAddress,) async {
    // ignore: prefer_const_declarations
    final path = r'/api/v1/tokens/{chain}/{contractAddress}/logo'
      .replaceAll('{chain}', chain)
      .replaceAll('{contractAddress}', contractAddress);

    // ignore: prefer_final_locals
    Object? postBody;

    final queryParams = <QueryParam>[];
    final headerParams = <String, String>{};
    final formParams = <String, String>{};

    const contentTypes = <String>[];


    return apiClient.invokeAPI(
      path,
      'GET',
      queryParams,
      postBody,
      headerParams,
      formParams,
      contentTypes.isEmpty ? null : contentTypes.first,
    );
  }

  /// Get token logo
  ///
  /// Proxy token logo image from external CDN (CoinGecko or Trust Wallet). Returns the image bytes directly with edge caching.
  ///
  /// Parameters:
  ///
  /// * [String] chain (required):
  ///
  /// * [String] contractAddress (required):
  Future<MultipartFile?> apiV1TokensChainContractAddressLogoGet(String chain, String contractAddress,) async {
    final response = await apiV1TokensChainContractAddressLogoGetWithHttpInfo(chain, contractAddress,);
    if (response.statusCode >= HttpStatus.badRequest) {
      throw ApiException(response.statusCode, await _decodeBodyBytes(response));
    }
    // When a remote server returns no body with a status of 204, we shall not decode it.
    // At the time of writing this, `dart:convert` will throw an "Unexpected end of input"
    // FormatException when trying to decode an empty string.
    if (response.body.isNotEmpty && response.statusCode != HttpStatus.noContent) {
      return await apiClient.deserializeAsync(await _decodeBodyBytes(response), 'MultipartFile',) as MultipartFile;
    
    }
    return null;
  }

  /// List tokens by chain
  ///
  /// List available tokens for a given chain. Currently supports Stellar (stellar:pubnet) via StellarExpert API proxy with pagination and search.
  ///
  /// Note: This method returns the HTTP [Response].
  ///
  /// Parameters:
  ///
  /// * [String] chain (required):
  ///
  /// * [int] limit:
  ///   Results per page (max 200)
  ///
  /// * [int] page:
  ///   Page number
  ///
  /// * [String] search:
  ///   Search by token code or name
  Future<Response> apiV1TokensChainListGetWithHttpInfo(String chain, { int? limit, int? page, String? search, }) async {
    // ignore: prefer_const_declarations
    final path = r'/api/v1/tokens/{chain}/list'
      .replaceAll('{chain}', chain);

    // ignore: prefer_final_locals
    Object? postBody;

    final queryParams = <QueryParam>[];
    final headerParams = <String, String>{};
    final formParams = <String, String>{};

    if (limit != null) {
      queryParams.addAll(_queryParams('', 'limit', limit));
    }
    if (page != null) {
      queryParams.addAll(_queryParams('', 'page', page));
    }
    if (search != null) {
      queryParams.addAll(_queryParams('', 'search', search));
    }

    const contentTypes = <String>[];


    return apiClient.invokeAPI(
      path,
      'GET',
      queryParams,
      postBody,
      headerParams,
      formParams,
      contentTypes.isEmpty ? null : contentTypes.first,
    );
  }

  /// List tokens by chain
  ///
  /// List available tokens for a given chain. Currently supports Stellar (stellar:pubnet) via StellarExpert API proxy with pagination and search.
  ///
  /// Parameters:
  ///
  /// * [String] chain (required):
  ///
  /// * [int] limit:
  ///   Results per page (max 200)
  ///
  /// * [int] page:
  ///   Page number
  ///
  /// * [String] search:
  ///   Search by token code or name
  Future<ApiV1TokensChainListGet200Response?> apiV1TokensChainListGet(String chain, { int? limit, int? page, String? search, }) async {
    final response = await apiV1TokensChainListGetWithHttpInfo(chain,  limit: limit, page: page, search: search, );
    if (response.statusCode >= HttpStatus.badRequest) {
      throw ApiException(response.statusCode, await _decodeBodyBytes(response));
    }
    // When a remote server returns no body with a status of 204, we shall not decode it.
    // At the time of writing this, `dart:convert` will throw an "Unexpected end of input"
    // FormatException when trying to decode an empty string.
    if (response.body.isNotEmpty && response.statusCode != HttpStatus.noContent) {
      return await apiClient.deserializeAsync(await _decodeBodyBytes(response), 'ApiV1TokensChainListGet200Response',) as ApiV1TokensChainListGet200Response;
    
    }
    return null;
  }
}
