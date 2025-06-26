## [2.5.5](https://github.com/metrics-js/client/compare/v2.5.4...v2.5.5) (2025-06-26)


### Bug Fixes

* **deps:** update dependency @types/readable-stream to v4.0.21 ([#125](https://github.com/metrics-js/client/issues/125)) ([f13a8d5](https://github.com/metrics-js/client/commit/f13a8d5bb4e03bb302e4251879a8de0d3a9cbc01))

## [2.5.4](https://github.com/metrics-js/client/compare/v2.5.3...v2.5.4) (2024-11-13)


### Bug Fixes

* include types/readable-stream as a dependency ([#111](https://github.com/metrics-js/client/issues/111)) ([7a4f9d4](https://github.com/metrics-js/client/commit/7a4f9d46701819d204a6d310d82aa5d084eff1d5))

## [2.5.3](https://github.com/metrics-js/client/compare/v2.5.2...v2.5.3) (2024-07-29)


### Bug Fixes

* correct the BaseMetricsOptions value for inc ([#102](https://github.com/metrics-js/client/issues/102)) ([89cb0a8](https://github.com/metrics-js/client/commit/89cb0a88d1e6c468406d9d452b4598036c4d7094))

# Changelog

Notable changes to this project.

The latest version of this document is always available in
[releases][releases-url].


## [2.5.2] - 2023-09-19

- Fixed type information - [#78](https://github.com/metrics-js/client/pull/78)

## [2.4.1] - 2019-03-08

-   Updated time-span dependency - [#25](https://github.com/metrics-js/client/pull/25)

## [2.4.0] - 2019-03-07

-   Remove redundant (and wrongly) set of source property - [#24](https://github.com/metrics-js/client/pull/24)
-   Guard against MaxListenersExceededWarning when large amount of streams is piped - [#23](https://github.com/metrics-js/client/pull/23)
-   Updated dependencies - [#22](https://github.com/metrics-js/client/pull/22)
-   Fix code example in documentation - [#21](https://github.com/metrics-js/client/pull/21)

## [2.3.1] - 2019-02-07

-   Updated @metrics/metric to version 2.3.1

## [2.3.0] - 2019-01-21

-   Added Counter, Gauge, Summary and Histogram classes
-   Updated @metrics/metric to version 2.3.0

## [2.2.0] - 2018-12-27

-   Fixed an issue where value was the number `0` would yeld `null` [#14](https://github.com/metrics-js/client/pull/14)
-   Updated readable-stream to version 3.11.0 [#15](https://github.com/metrics-js/client/pull/15)

## [2.1.1] - 2018-12-17

-   Updated readable-stream to version 3.10.0 [#11](https://github.com/metrics-js/client/pull/11)

## [2.1.0] - 2018-12-12

-   Removed redudant documentation [#8](https://github.com/metrics-js/client/pull/8)
-   Use airbnb eslint [#9](https://github.com/metrics-js/client/pull/9)

## [2.0.0] - 2018-12-11

-   Updated readable-stream to version [3.x.x](https://github.com/nodejs/readable-stream/tree/v3.0.0#version-3xx).
-   Added [drop event](https://github.com/metrics-js/client/pull/6).
-   Added safequard against circular piping.
-   Removed `buffer` argument from the constructor. Uses default steam backpreassure mechanisme instead.
-   Made it possible to name a instance of the client through a `id` argument on the constructor.
-   Moved tests off Jest to Tap.

## [1.0.0] - 2018-xx-xx

-   Initial release.

[2.5.2]: https://github.com/metrics-js/client/compare/v2.4.1...v2.5.2
[2.4.1]: https://github.com/metrics-js/client/compare/v2.4.0...v2.4.1
[2.4.0]: https://github.com/metrics-js/client/compare/v2.3.1...v2.4.0
[2.3.1]: https://github.com/metrics-js/client/compare/v2.3.0...v2.3.1
[2.3.0]: https://github.com/metrics-js/client/compare/v2.2.0...v2.3.0
[2.2.0]: https://github.com/metrics-js/client/compare/v2.1.1...v2.2.0
[2.1.1]: https://github.com/metrics-js/client/compare/v2.1.0...v2.1.1
[2.1.0]: https://github.com/metrics-js/client/compare/v2.0.0...v2.1.0
[2.0.0]: https://github.com/metrics-js/client/compare/v1.0.0...v2.0.0
[1.0.0]: https://github.com/metrics-js/client/tree/v1.0.0
[releases-url]: https://github.com/metrics-js/client/blob/master/CHANGELOG.md
