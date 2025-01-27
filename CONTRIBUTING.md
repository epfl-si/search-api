# Contributing

## Prerequisites

- Groups `vra_p_svc0012`.
- Keybase `epfl_search`.
- Access to ghcr.io via a personal access tokens (PATs).

## Setup

```bash
git clone git@github.com:epfl-si/search-api.git
cd search-api
npm i
```

## Lint

```bash
# Prettier and ESlint
npm run prettier
npm run lint

# Options
npm run prettier:fix
npm run lint:fix
```

## Test

```bash
npm test
npm run test:coverage
npm run test:watch
```

## Start

```bash
# Development
make start

# Set up access to Cadi DB (for People/Unit tabs)
oc port-forward deployments/search-api-haproxy 33306:3306

# Production
make up
```

## Debug

### VS Code

Debugging configuration is stored in the `launch.json` file. Select the Run and
Debug icon in the Activity Bar and press F5.

### Chrome

Start the server with the debugger daemon:

```bash
make inspect
```

Open Chrome Developer Tools and click the green Node.js icon.

## Release

Bump `package.json`, update [CHANGELOG.md](CHANGELOG.md) and

```bash
git tag -a v<version> -m "Search API - v<version>"
git push origin main --tags
```

## Deploy

```bash
# Help
./ansible/searchapisible --help

# Production
./ansible/searchapisible --prod
```
