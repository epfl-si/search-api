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

# Set up access Cadi DB staging (for Unit tab)
ssh -f kis@test-search01.epfl.ch -L 33306:db-cadi-staging.epfl.ch:3306 -N

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

Log into `ghcr.io`, `os-docker-registry.epfl.ch` and OpenShift, then

```text
Usage: ./ansible/searchapisible [options]

Options:
  -h, --help         Show help message and exit
      --list-tags    List all available tags
      --prod         Deploy in production
  -t, --tags         Run tasks tagged with these values             [string]
  -v, --verbose      Causes Ansible to print more debug messages
      --version      Show version number

Examples:
  ./ansible/searchapisible
  ./ansible/searchapisible --prod
  ./ansible/searchapisible --prod -t app.restart
```
