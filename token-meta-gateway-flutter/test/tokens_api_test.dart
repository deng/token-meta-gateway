//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//
// @dart=2.18

// ignore_for_file: unused_element, unused_import
// ignore_for_file: always_put_required_named_parameters_first
// ignore_for_file: constant_identifier_names
// ignore_for_file: lines_longer_than_80_chars

import 'package:token_meta_gateway/api.dart';
import 'package:test/test.dart';


/// tests for TokensApi
void main() {
  // final instance = TokensApi();

  group('tests for TokensApi', () {
    // Get token metadata
    //
    // Fetch metadata for a specific token by chain and contract address. On first lookup, sources from CoinGecko → on-chain RPC eth_call. Supports ?force=true to skip cache and refresh from external sources.
    //
    //Future<ApiV1TokensChainContractAddressGet200Response> apiV1TokensChainContractAddressGet(String chain, String contractAddress, { String force }) async
    test('test apiV1TokensChainContractAddressGet', () async {
      // TODO
    });

    // Get token logo
    //
    // Proxy token logo image from external CDN (CoinGecko or Trust Wallet). Returns the image bytes directly with edge caching.
    //
    //Future<MultipartFile> apiV1TokensChainContractAddressLogoGet(String chain, String contractAddress) async
    test('test apiV1TokensChainContractAddressLogoGet', () async {
      // TODO
    });

  });
}
