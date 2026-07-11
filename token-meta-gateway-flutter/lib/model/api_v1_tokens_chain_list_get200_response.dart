//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//
// @dart=2.18

// ignore_for_file: unused_element, unused_import
// ignore_for_file: always_put_required_named_parameters_first
// ignore_for_file: constant_identifier_names
// ignore_for_file: lines_longer_than_80_chars

part of openapi.api;

class ApiV1TokensChainListGet200Response {
  /// Returns a new [ApiV1TokensChainListGet200Response] instance.
  ApiV1TokensChainListGet200Response({
    this.success,
    this.data = const [],
    this.pagination,
  });

  ///
  /// Please note: This property should have been non-nullable! Since the specification file
  /// does not include a default value (using the "default:" property), however, the generated
  /// source code must fall back to having a nullable type.
  /// Consider adding a "default:" property in the specification file to hide this note.
  ///
  bool? success;

  List<TokenMeta> data;

  ///
  /// Please note: This property should have been non-nullable! Since the specification file
  /// does not include a default value (using the "default:" property), however, the generated
  /// source code must fall back to having a nullable type.
  /// Consider adding a "default:" property in the specification file to hide this note.
  ///
  Pagination? pagination;

  @override
  bool operator ==(Object other) => identical(this, other) || other is ApiV1TokensChainListGet200Response &&
    other.success == success &&
    _deepEquality.equals(other.data, data) &&
    other.pagination == pagination;

  @override
  int get hashCode =>
    // ignore: unnecessary_parenthesis
    (success == null ? 0 : success!.hashCode) +
    (data.hashCode) +
    (pagination == null ? 0 : pagination!.hashCode);

  @override
  String toString() => 'ApiV1TokensChainListGet200Response[success=$success, data=$data, pagination=$pagination]';

  Map<String, dynamic> toJson() {
    final json = <String, dynamic>{};
    if (this.success != null) {
      json[r'success'] = this.success;
    } else {
      json[r'success'] = null;
    }
      json[r'data'] = this.data;
    if (this.pagination != null) {
      json[r'pagination'] = this.pagination;
    } else {
      json[r'pagination'] = null;
    }
    return json;
  }

  /// Returns a new [ApiV1TokensChainListGet200Response] instance and imports its values from
  /// [value] if it's a [Map], null otherwise.
  // ignore: prefer_constructors_over_static_methods
  static ApiV1TokensChainListGet200Response? fromJson(dynamic value) {
    if (value is Map) {
      final json = value.cast<String, dynamic>();

      // Ensure that the map contains the required keys.
      // Note 1: the values aren't checked for validity beyond being non-null.
      // Note 2: this code is stripped in release mode!
      assert(() {
        requiredKeys.forEach((key) {
          assert(json.containsKey(key), 'Required key "ApiV1TokensChainListGet200Response[$key]" is missing from JSON.');
          assert(json[key] != null, 'Required key "ApiV1TokensChainListGet200Response[$key]" has a null value in JSON.');
        });
        return true;
      }());

      return ApiV1TokensChainListGet200Response(
        success: mapValueOfType<bool>(json, r'success'),
        data: TokenMeta.listFromJson(json[r'data']),
        pagination: Pagination.fromJson(json[r'pagination']),
      );
    }
    return null;
  }

  static List<ApiV1TokensChainListGet200Response> listFromJson(dynamic json, {bool growable = false,}) {
    final result = <ApiV1TokensChainListGet200Response>[];
    if (json is List && json.isNotEmpty) {
      for (final row in json) {
        final value = ApiV1TokensChainListGet200Response.fromJson(row);
        if (value != null) {
          result.add(value);
        }
      }
    }
    return result.toList(growable: growable);
  }

  static Map<String, ApiV1TokensChainListGet200Response> mapFromJson(dynamic json) {
    final map = <String, ApiV1TokensChainListGet200Response>{};
    if (json is Map && json.isNotEmpty) {
      json = json.cast<String, dynamic>(); // ignore: parameter_assignments
      for (final entry in json.entries) {
        final value = ApiV1TokensChainListGet200Response.fromJson(entry.value);
        if (value != null) {
          map[entry.key] = value;
        }
      }
    }
    return map;
  }

  // maps a json object with a list of ApiV1TokensChainListGet200Response-objects as value to a dart map
  static Map<String, List<ApiV1TokensChainListGet200Response>> mapListFromJson(dynamic json, {bool growable = false,}) {
    final map = <String, List<ApiV1TokensChainListGet200Response>>{};
    if (json is Map && json.isNotEmpty) {
      // ignore: parameter_assignments
      json = json.cast<String, dynamic>();
      for (final entry in json.entries) {
        map[entry.key] = ApiV1TokensChainListGet200Response.listFromJson(entry.value, growable: growable,);
      }
    }
    return map;
  }

  /// The list of required keys that must be present in a JSON.
  static const requiredKeys = <String>{
  };
}

