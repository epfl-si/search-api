# Search API

[![Test Status][github-actions-image-test]][github-actions-url]
[![Build Status][github-actions-image-build]][github-actions-url]
[![Coverage Status][codecov-image]][codecov-url]
[![Node.js](https://img.shields.io/badge/Node.js-22.x-3c873a.svg)][node22-url]

## Google Custom Search

### Endpoint

`GET /api/cse`

### Parameters

| Name         | Type     | Comments                                                                               |
| ------------ | -------- | -------------------------------------------------------------------------------------- |
| `hl`         | `String` | Sets the user interface language.                                                      |
| `q`          | `String` | Query                                                                                  |
| `siteSearch` | `String` | Specifies a given site which should be included.                                       |
| `searchType` | `String` | Specifies the search type: `image`. If unspecified, results are limited to webpages.   |
| `start`      | `Number` | The index of the first result to return. The default number of results per page is 10. |
| `sort`       | `String` | The sort expression to apply to the results.                                           |

### Examples

- [/api/cse?q=math][cse-1]
- [/api/cse?q=math&hl=fr&searchSite=actu.epfl.ch][cse-2]
- [/api/cse?q=math&hl=en&sort=date&searchType=image][cse-3]

## People

### Endpoint

`GET /api/ldap`

### Parameters

| Name | Type     | Comments                          |
| ---- | -------- | --------------------------------- |
| `q`  | `String` | Query                             |
| `hl` | `String` | Sets the user interface language. |

### Examples

- [/api/ldap?q=278890][ldap-1]
- [/api/ldap?q=nicolas.borboen@epfl.ch&hl=en][ldap-2]

## People (CSV Export)

### Endpoint

`GET /api/ldap/csv`

### Parameters

| Name | Type     | Comments |
| ---- | -------- | -------- |
| `q`  | `String` | Query    |

### Examples

- [/api/ldap/csv?q=jango][ldap-csv]

## People suggestions

### Endpoint

`GET /api/ldap/suggestions`

### Parameters

| Name    | Type     | Comments                                               |
| ------- | -------- | ------------------------------------------------------ |
| `q`     | `String` | Query                                                  |
| `limit` | `Number` | Sets the number of suggestions. Default and max is 10. |

### Examples

- [/api/ldap/suggestions?q=math][ldap-suggestions-1]
- [/api/ldap/suggestions?q=william&limit=3][ldap-suggestions-2]

## Address

### Endpoint

`GET /api/address`

### Parameters

| Name | Type     | Comments       |
| ---- | -------- | -------------- |
| `q`  | `String` | Query (sciper) |

### Examples

- [/api/address?q=278890][address-1]

## Unit

### Endpoint

`GET /api/unit`

### Parameters

| Name   | Type     | Comments                                                       |
| ------ | -------- | -------------------------------------------------------------- |
| `q`    | `String` | Query (acronym, name or ID)                                    |
| `acro` | `String` | Specifies an exact unit acronym. If specified, `q` is ignored. |
| `hl`   | `String` | Sets the user interface language.                              |

### Examples

- [/api/unit?q=fsd][unit-1]
- [/api/unit?q=vpo&hl=en][unit-2]
- [/api/unit?q=13030][unit-3]
- [/api/unit?acro=vpo][unit-4]

## Unit (CSV Export)

Only allowed via EPFL intranet or VPN.

### Endpoint

`GET /api/unit/csv`

### Parameters

| Name | Type     | Comments                           |
| ---- | -------- | ---------------------------------- |
| `q`  | `String` | acronym (should be the exact name) |
| `hl` | `String` | Sets the user interface language.  |

### Example

- [/api/unit/csv?q=isas-fsd&hl=en][unit-csv-1]

## Unit suggestions

### Endpoint

`GET /api/unit/suggestions`

### Parameters

| Name    | Type     | Comments                                               |
| ------- | -------- | ------------------------------------------------------ |
| `q`     | `String` | Query                                                  |
| `limit` | `Number` | Sets the number of suggestions. Default and max is 10. |

### Example

- [/api/unit/suggestions?q=isas&hl=en][unit-suggestions-1]

## Graph Search

### Endpoint

`GET /api/graphsearch/v2`

### Parameters

| Name      | Type     | Comments                                                                                                |
| --------- | -------- | ------------------------------------------------------------------------------------------------------- |
| `q`       | `String` | Query                                                                                                   |
| `doctype` | `String` | Values : `category`, `concept`, `course`, `lecture`, `mooc`, `person`, `publication`, `startup`, `unit` |
| `limit`   | `Number` | Sets the number of entries on a page. Default is 10. Max is 100.                                        |

### Examples

- [/api/graphsearch/v2?q=math&limit=20][graphsearch-4]
- [/api/graphsearch/v2?q=vetterli&doctype=person][graphsearch-5]
- [/api/graphsearch/v2?q=lts&doctype=unit][graphsearch-6]

## Documentation

See [Confluence][confluence-url].

## Contributing

See [Contributing](CONTRIBUTING.md).

[github-actions-image-test]: https://github.com/epfl-si/search-api/actions/workflows/test.yml/badge.svg?branch=main
[github-actions-image-build]: https://github.com/epfl-si/search-api/actions/workflows/build.yml/badge.svg?branch=main
[github-actions-url]: https://github.com/epfl-si/search-api/actions
[codecov-image]: https://codecov.io/gh/epfl-si/search-api/branch/main/graph/badge.svg
[codecov-url]: https://codecov.io/gh/epfl-si/search-api
[confluence-url]: https://confluence.epfl.ch:8443/pages/viewpage.action?pageId=221185381
[node22-url]: https://nodejs.org/en/blog/announcements/v22-release-announce
[cse-1]: http://127.0.0.1:5555/api/cse?q=math
[cse-2]: http://127.0.0.1:5555/api/cse?q=math&hl=fr&searchSite=actu.epfl.ch
[cse-3]: http://127.0.0.1:5555/api/cse?q=math&hl=en&sort=date&searchType=image
[ldap-1]: http://127.0.0.1:5555/api/ldap?q=278890
[ldap-2]: http://127.0.0.1:5555/api/ldap?q=nicolas.borboen@epfl.ch&hl=en
[ldap-csv]: http://127.0.0.1:5555/api/ldap?q=jango
[ldap-suggestions-1]: http://127.0.0.1:5555/api/ldap/suggestions?q=math
[ldap-suggestions-2]: http://127.0.0.1:5555/api/ldap/suggestions?q=william&limit=3
[unit-1]: http://127.0.0.1:5555/api/unit?q=fsd
[unit-2]: http://127.0.0.1:5555/api/unit?q=vpo&hl=en
[unit-3]: http://127.0.0.1:5555/api/unit?q=13030
[unit-4]: http://127.0.0.1:5555/api/unit?acro=vpo
[unit-csv-1]: http://127.0.0.1:5555/api/unit/csv?q=isas-fsd&hl=en
[unit-suggestions-1]: http://127.0.0.1:5555/api/unit/suggestions?q=isas&hl=en
[graphsearch-4]: http://127.0.0.1:5555/api/graphsearch/v2?q=math&limit=20
[graphsearch-5]: http://127.0.0.1:5555/api/graphsearch/v2?q=vetterli&doctype=person
[graphsearch-6]: http://127.0.0.1:5555/api/graphsearch/v2?q=lts&doctype=unit
[address-1]: http://127.0.0.1:5555/api/address?q=278890
