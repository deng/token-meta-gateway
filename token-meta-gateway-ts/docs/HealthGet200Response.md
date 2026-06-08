
# HealthGet200Response


## Properties

Name | Type
------------ | -------------
`status` | string
`timestamp` | Date
`version` | string

## Example

```typescript
import type { HealthGet200Response } from 'token-meta-gateway'

// TODO: Update the object below with actual values
const example = {
  "status": healthy,
  "timestamp": null,
  "version": 0.1.0,
} satisfies HealthGet200Response

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as HealthGet200Response
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


