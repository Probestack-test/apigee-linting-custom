# Usage

This document summarizes common `apigeelint` usage and CLI options for this repository.

## Installing

Globally via npm:

```
npm install -g apigeelint
```

The package exposes the `apigeelint` command (see `package.json` bin entry). You can also run locally via:

```
node ./cli.js -s path/to/your/apiproxy -f table.js
```

## Common commands

- List available plugins and formatters:

```
apigeelint --list
```

- Run with external plugins directory:

```
apigeelint -x ./externalPlugins -s path/to/apiproxy -f table.js
```

- Exclude built-in plugins:

```
apigeelint -s path/to/apiproxy -e PO007,ST003 -f table.js
```

## Useful options

- `-s, --path`: Path to proxy or sharedflow bundle (directory or zip)
- `-x, --externalPluginsDirectory`: Directory containing external plugins
- `-e, --excluded`: Comma-separated list of tests/rules to exclude
- `-f, --formatter`: Output formatter (e.g., `table.js`, `json.js`)

Refer to the main `README.md` for the full help text and more examples.