
# ApiV1TokensChainBatchPostRequest


## Properties

Name | Type
------------ | -------------
`addresses` | Array&lt;string&gt;

## Example

```typescript
import type { ApiV1TokensChainBatchPostRequest } from 'token-meta-gateway'

// TODO: Update the object below with actual values
const example = {
  "addresses": ["0xdAC17F958D2ee523a2206206994597C13D831ec7","0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48"],
} satisfies ApiV1TokensChainBatchPostRequest

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as ApiV1TokensChainBatchPostRequest
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


