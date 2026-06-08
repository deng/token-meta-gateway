//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//
// @dart=2.18

// ignore_for_file: unused_element, unused_import
// ignore_for_file: always_put_required_named_parameters_first
// ignore_for_file: constant_identifier_names
// ignore_for_file: lines_longer_than_80_chars

part of openapi.api;

class ApiV1TokensChainBatchPostRequest {
  /// Returns a new [ApiV1TokensChainBatchPostRequest] instance.
  ApiV1TokensChainBatchPostRequest({
    this.addresses = const [],
  });

  List<String> addresses;

  @override
  bool operator ==(Object other) => identical(this, other) || other is ApiV1TokensChainBatchPostRequest &&
    _deepEquality.equals(other.addresses, addresses);

  @override
  int get hashCode =>
    // ignore: unnecessary_parenthesis
    (addresses.hashCode);

  @override
  String toString() => 'ApiV1TokensChainBatchPostRequest[addresses=$addresses]';

  Map<String, dynamic> toJson() {
    final json = <String, dynamic>{};
      json[r'addresses'] = this.addresses;
    return json;
  }

  /// Returns a new [ApiV1TokensChainBatchPostRequest] instance and imports its values from
  /// [value] if it's a [Map], null otherwise.
  // ignore: prefer_constructors_over_static_methods
  static ApiV1TokensChainBatchPostRequest? fromJson(dynamic value) {
    if (value is Map) {
      final json = value.cast<String, dynamic>();

      // Ensure that the map contains the required keys.
      // Note 1: the values aren't checked for validity beyond being non-null.
      // Note 2: this code is stripped in release mode!
      assert(() {
        requiredKeys.forEach((key) {
          assert(json.containsKey(key), 'Required key "ApiV1TokensChainBatchPostRequest[$key]" is missing from JSON.');
          assert(json[key] != null, 'Required key "ApiV1TokensChainBatchPostRequest[$key]" has a null value in JSON.');
        });
        return true;
      }());

      return ApiV1TokensChainBatchPostRequest(
        addresses: json[r'addresses'] is Iterable
            ? (json[r'addresses'] as Iterable).cast<String>().toList(growable: false)
            : const [],
      );
    }
    return null;
  }

  static List<ApiV1TokensChainBatchPostRequest> listFromJson(dynamic json, {bool growable = false,}) {
    final result = <ApiV1TokensChainBatchPostRequest>[];
    if (json is List && json.isNotEmpty) {
      for (final row in json) {
        final value = ApiV1TokensChainBatchPostRequest.fromJson(row);
        if (value != null) {
          result.add(value);
        }
      }
    }
    return result.toList(growable: growable);
  }

  static Map<String, ApiV1TokensChainBatchPostRequest> mapFromJson(dynamic json) {
    final map = <String, ApiV1TokensChainBatchPostRequest>{};
    if (json is Map && json.isNotEmpty) {
      json = json.cast<String, dynamic>(); // ignore: parameter_assignments
      for (final entry in json.entries) {
        final value = ApiV1TokensChainBatchPostRequest.fromJson(entry.value);
        if (value != null) {
          map[entry.key] = value;
        }
      }
    }
    return map;
  }

  // maps a json object with a list of ApiV1TokensChainBatchPostRequest-objects as value to a dart map
  static Map<String, List<ApiV1TokensChainBatchPostRequest>> mapListFromJson(dynamic json, {bool growable = false,}) {
    final map = <String, List<ApiV1TokensChainBatchPostRequest>>{};
    if (json is Map && json.isNotEmpty) {
      // ignore: parameter_assignments
      json = json.cast<String, dynamic>();
      for (final entry in json.entries) {
        map[entry.key] = ApiV1TokensChainBatchPostRequest.listFromJson(entry.value, growable: growable,);
      }
    }
    return map;
  }

  /// The list of required keys that must be present in a JSON.
  static const requiredKeys = <String>{
  };
}

