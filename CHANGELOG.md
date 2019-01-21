# Changelog

Notable changes to this project.

The latest version of this document is always available in
[releases][releases-url].

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

[2.3.0]: https://github.com/metrics-js/client/compare/v2.2.0...v2.3.0
[2.2.0]: https://github.com/metrics-js/client/compare/v2.1.1...v2.2.0
[2.1.1]: https://github.com/metrics-js/client/compare/v2.1.0...v2.1.1
[2.1.0]: https://github.com/metrics-js/client/compare/v2.0.0...v2.1.0
[2.0.0]: https://github.com/metrics-js/client/compare/v1.0.0...v2.0.0
[1.0.0]: https://github.com/metrics-js/client/tree/v1.0.0
[releases-url]: https://github.com/metrics-js/client/blob/master/CHANGELOG.md
