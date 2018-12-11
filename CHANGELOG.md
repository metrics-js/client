# Changelog

Notable changes to this project.

The latest version of this document is always available in
[releases][releases-url].

## [2.0.0] - 2018-12-11

 - Updated readable-stream to version [3.x.x](https://github.com/nodejs/readable-stream/tree/v3.0.0#version-3xx).
 - Added [drop event](https://github.com/metrics-js/client/pull/6).
 - Added safequard against circular piping.
 - Removed `buffer` argument from the constructor. Uses default steam backpreassure mechanisme instead.
 - Made it possible to name a instance of the client through a `id` argument on the constructor.
 - Moved tests off Jest to Tap.

## [1.0.0] - 2018-xx-xx

- Initial release.

[2.0.0]: https://github.com/metrics-js/client/compare/v1.0.0...v2.0.0
[1.0.0]: https://github.com/metrics-js/client/tree/v1.0.0

[releases-url]: https://github.com/metrics-js/client/blob/master/CHANGELOG.md
