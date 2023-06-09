# Search API

[![Test Status][github-actions-image-test]][github-actions-url]
[![Build Status][github-actions-image-build]][github-actions-url]
[![Coverage Status][codecov-image]][codecov-url]
[![Node.js](https://img.shields.io/badge/Node.js-18.x-3c873a.svg)][node18-url]

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

## Unit

### Endpoint

`GET /api/unit`

### Parameters

| Name   | Type     | Comments                                                       |
| ------ | -------- | -------------------------------------------------------------- |
| `q`    | `String` | Query                                                          |
| `acro` | `String` | Specifies an exact unit acronym. If specified, `q` is ignored. |
| `hl`   | `String` | Sets the user interface language.                              |

### Examples

- [/api/unit?q=fsd][unit-1]
- [/api/unit?q=vpo&hl=en][unit-2]
- [/api/unit?acro=vpo][unit-3]

## EPFL Graph

### Endpoint

`GET /api/graphsearch`

### Parameters

| Name | Type     | Comments |
| ---- | -------- | -------- |
| `q`  | `String` | Query    |

### Examples

- [/api/graphsearch?q=math][graphsearch-1]
- [/api/graphsearch?q=vetterli][graphsearch-2]

## Documentation

See [Confluence][confluence-url].

## Contributing

See [Contributing](CONTRIBUTING.md).

[github-actions-image-test]: https://github.com/epfl-si/search-api/workflows/Test/badge.svg?branch=main
[github-actions-image-build]: https://github.com/epfl-si/search-api/workflows/Build/badge.svg?branch=main
[github-actions-url]: https://github.com/epfl-si/search-api/actions
[codecov-image]: https://codecov.io/gh/epfl-si/search-api/branch/main/graph/badge.svg
[codecov-url]: https://codecov.io/gh/epfl-si/search-api
[confluence-url]: https://confluence.epfl.ch:8443/pages/viewpage.action?pageId=221185381
[node18-url]: https://nodejs.org/en/blog/announcements/v18-release-announce
[cse-1]: http://127.0.0.1:5555/api/cse?q=math
[cse-2]: http://127.0.0.1:5555/api/cse?q=math&hl=fr&searchSite=actu.epfl.ch
[cse-3]: http://127.0.0.1:5555/api/cse?q=math&hl=en&sort=date&searchType=image
[ldap-1]: http://127.0.0.1:5555/api/ldap?q=278890
[ldap-2]: http://127.0.0.1:5555/api/ldap?q=nicolas.borboen@epfl.ch&hl=en
[unit-1]: http://127.0.0.1:5555/api/unit?q=fsd
[unit-2]: http://127.0.0.1:5555/api/unit?q=vpo&hl=en
[unit-3]: http://127.0.0.1:5555/api/unit?acro=vpo
[graphsearch-1]: http://127.0.0.1:5555/api/graphsearch?q=math
[graphsearch-2]: http://127.0.0.1:5555/api/graphsearch?q=vetterli
