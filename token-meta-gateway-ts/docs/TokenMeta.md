
# TokenMeta


## Properties

Name | Type
------------ | -------------
`chain` | string
`contractAddress` | string
`symbol` | string
`decimals` | number
`name` | string
`logo` | string
`updatedAt` | number

## Example

```typescript
import type { TokenMeta } from 'token-meta-gateway'

// TODO: Update the object below with actual values
const example = {
  "chain": null,
  "contractAddress": null,
  "symbol": null,
  "decimals": null,
  "name": null,
  "logo": null,
  "updatedAt": null,
} satisfies TokenMeta

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as TokenMeta
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


