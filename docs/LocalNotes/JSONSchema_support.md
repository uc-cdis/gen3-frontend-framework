# The typescript configuration interfaces can be used to generate JSON Schema using something like:
```
 ts-json-schema-generator --path src/features/Discovery/types.ts --type DiscoveryConfig --tsconfig tsconfig.json --out DiscoveryConfig_schema.json
```

Something like this: https://github.com/json-editor/json-editor can be used to develop editors/validators for configuration files
