# Contributing

## Prerequisites

- Access to our Keybase `/keybase/team/epfl_search` directory.
- Access to `wwp-test` and `wwp` namespaces on our OpenShift cluster.

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

# To access Cadi DB test (for Unit tab)
ssh -f kis@test-search01.epfl.ch -L 33306:test-cadidb.epfl.ch:3306 -N

# Production
make up
```

## Release

Bump `package.json`, update [CHANGELOG.md](CHANGELOG.md) and

```bash
git tag -a v<version> -m "Search API - v<version>"
git push origin main --tags
```

## Deploy

Log into `ghcr.io` and `os-docker-registry.epfl.ch`, then

```bash
./ansible/searchapisible [--prod]
```
