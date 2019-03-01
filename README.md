# @metrics/client

[![Greenkeeper badge](https://badges.greenkeeper.io/metrics-js/client.svg)](https://greenkeeper.io/)

A streaming metric producer. Allows producing counters, gauges, time series in a way that is independent of your metrics system so that you can produce metrics and let consumers decide how to consume them. Additionally, you can pipe together different metrics streams before finally consuming them all in a single location.

## Quick start

The client is intended to be used in the following way:

### Step 1.

Instantiate a new client

```js
const Metrics = require('@metrics/client');

const client = new Metrics();
```

### Step 2.

Use the client for instrumentation

```js
const counter = client.counter({
    name: 'unique_metric_name',
    description: 'Description of metric being collected',
});

counter.inc();
```

### Step 3.

Pipe collected metrics to a collector

```js
client.pipe(consumer);
```

The client supports 4 types of metric creation use cases.

-   Counters are supported via the `client.counter` method
-   Gauges are supported via the `client.gauge` method
-   Histograms are supported via the `client.histogram` method
-   Summaries are supported via the `client.summary` method

## Examples

_Creating and incrementing a counter_

```js
const counter = client.counter({
    name: 'my_counter',
    description: 'Counter description',
});
counter.inc();
```

_Creating and incrementing a gauge_

```js
const gauge = client.gauge({
    name: 'my_gauge',
    description: 'Gauge description',
});
gauge.set(10);
```

_Creating and incrementing a summary_

```js
const summary = client.summary({
    name: 'my_summary',
    description: 'Summary description',
});
summary.observe(0.123);
```

_Creating and incrementing a summary using a timer_

```js
const summary = client.summary({
    name: 'my_summary',
    description: 'Summary description',
});
const end = summary.timer();
// ... time something
end();
```

_Creating and incrementing a histogram_

```js
const histogram = client.histogram({
    name: 'my_histogram',
    description: 'Histogram description',
});
histogram.observe(0.123);
```

_Creating and incrementing a histogram using a timer_

```js
const histogram = client.histogram({
    name: 'my_histogram',
    description: 'Histogram description',
});
const end = histogram.timer();
// ... time something
end();
```

## Composing metric streams

One of the goals of `@metrics/client` is to allow any number of modules to produce their own metrics, not know about
where they might be consumed.

This can be achieved by including and instantiating a `@metrics/client` client in each module, using it to create metrics and then exposing the client for consumption elsewhere.

_Example_

```js
// module-1

const Metrics = require('@metrics/client');
const client = new Metrics();

const counter = client.counter({
    name: 'my_counter',
    description: 'Counter description',
});
counter.inc();

module.exports.metrics = client;
```

```js
// module-2

const Metrics = require('@metrics/client');
const client = new Metrics();

const counter = client.counter({
    name: 'my_counter',
    description: 'Counter description',
});
counter.inc();

module.exports.metrics = client;
```

```js
// consuming module
const module1 = require('module-1');
const module2 = require('module-2');
const consumer = require('some-consumer');

module1.pipe(consumer);
module2.pipe(consumer);
```

## Metrics consumption

In order to consume metrics produced by `@metrics/client` you just need to listen for data and use your favourite metrics client to convert our data format into something usable by your system of choice.

_Example: Prometheus using prom-client_

```js
const { Counter } = require('prom-client');
const { Writable } = require('stream');

class Consumer extends Writable {
    constructor() {
        super({ objectMode: true });

        this.counter = new Counter({
            name: 'my_metric_counter',
            help: 'Counts http request type things',
            labelNames: ['url', 'method'],
        });
    }

    _write(metric, enc, cb) {
        let url;
        let method;

        metric.labels.forEach(obj => {
            if (obj.name === 'url') {
                url = obj.value;
            }
            if (obj.name === 'method') {
                url = obj.value;
            }
        });

        this.counter.labels(url, method).inc(1);
        cb();
    }
}
```

## API

### new Metrics(options)

Creates a new instance of the metrics client.

The Metrics instance inherit from Transform Stream. Due to this the instance also take all
config parameters which the Transform Stream does. Please see the [documentation of Transform Streams](https://nodejs.org/api/stream.html#stream_duplex_and_transform_streams)
for further documentation.

**options**

| name | description                                                 | type     | default |
| ---- | ----------------------------------------------------------- | -------- | ------- |
| `id` | A optional unique identifier of the instance of the Object. | `string` | hash    |

_Example_

```js
const client = new Metrics(options);
```

**return**: `Duplex Stream`

### instance methods

#### .counter(options)

Creates an instance of a `Counter` class which can be used to populate the metrics stream with counter metrics.

**options**

| name          | description                                   | type     | default | required |
| ------------- | --------------------------------------------- | -------- | ------- | -------- |
| `name`        | Metric name. valid characters: a-z,A-Z,0-9,\_ | `string` | null    | `true`   |
| `description` | Metric description                            | `string` | null    | `true`   |
| `labels`      | Available to be used to hold label data.      | `object` | null    | `false`  |

**return**: `Counter`

_Example_

```js
const client = new Metrics(options);
const counter = client.counter(options);
```

##### counter.inc(value|options, options)

Method that when called will populate the metrics stream with a counter increment.

| name      | description                               | type      | default | required |
| --------- | ----------------------------------------- | --------- | ------- | -------- |
| `value`   | Value to increment the counter by         | `integer` | `1`     | `false`  |
| `options` | Object that can be used to specify labels | `object`  | `{}`    | `false`  |

_Example_

```js
const counter = client.counter(options);

counter.inc(); // increment by 1
counter.inc(10); // increment by 10
counter.inc({ labels: { url: 'http://finn.no' } }); // increment by 1, specify labels
counter.inc(5, { labels: { url: 'http://finn.no' } }); // increment by 5, specify labels
```

#### .gauge(options)

Creates an instance of a `Gauge` class which can be used to populate the metrics stream with gauge metrics.

**options**

| name          | description                                   | type     | default | required |
| ------------- | --------------------------------------------- | -------- | ------- | -------- |
| `name`        | Metric name. valid characters: a-z,A-Z,0-9,\_ | `string` | null    | `true`   |
| `description` | Metric description                            | `string` | null    | `true`   |
| `labels`      | Available to be used to hold label data.      | `object` | null    | `false`  |

_Example_

```js
const client = new Metrics(options);
const gauge = client.gauge(options);
```

##### gauge.set(value, options)

Method that when called will populate the metrics stream with a gauge value.

| name      | description                               | type      | default | required |
| --------- | ----------------------------------------- | --------- | ------- | -------- |
| `value`   | Value to set the gauge to                 | `integer` | null    | `true`   |
| `options` | Object that can be used to specify labels | `object`  | `{}`    | `false`  |

_Example_

```js
const gauge = client.gauge(options);

gauge.set(10); // set to 10
gauge.set(5, { labels: { url: 'http://finn.no' } }); // set to 5, specify labels
```

#### .histogram(options)

Creates an instance of a `Histogram` class which can be used to populate the metrics stream with histogram metrics.

**options**

| name          | description                                   | type     | default | required |
| ------------- | --------------------------------------------- | -------- | ------- | -------- |
| `name`        | Metric name. valid characters: a-z,A-Z,0-9,\_ | `string` | null    | `true`   |
| `description` | Metric description                            | `string` | null    | `true`   |
| `meta`        | Available to be used to hold any misc data.   | `object` | null    | `false`  |
| `labels`      | Available to be used to hold label data.      | `object` | null    | `false`  |

_Example_

```js
const client = new Metrics(options);
const histogram = client.histogram(options);
```

##### histogram.observe(value, options)

Method that when called will populate the metrics stream with a histogram value.

| name      | description                                        | type      | default | required |
| --------- | -------------------------------------------------- | --------- | ------- | -------- |
| `value`   | Value to set the gauge to                          | `integer` | null    | `true`   |
| `options` | Object that can be used to specify labels and meta | `object`  | `{}`    | `false`  |

_Example_

```js
const histogram = client.histogram(options);

histogram.observe(0.001); // observe value 0.001
histogram.observe(5, { labels: { url: 'http://finn.no' } }); // observe value 5, specify labels
histogram.observe(0.01, {
    meta: { buckets: [0.0001, 0.001, 0.01, 0.1, 0.5, 1, 10, 100] }, // observe 0.01, use meta to specify bucket options
});
```

##### histogram.timer(options)

Method that when called will return an end function for use in measuring the time between 2 points

| name      | description                                        | type     | default | required |
| --------- | -------------------------------------------------- | -------- | ------- | -------- |
| `options` | Object that can be used to specify labels and meta | `object` | `{}`    | `false`  |

_Examples_

```js
const histogram = client.histogram(options);

const end = histogram.timer(); // start timer
// stuff happens
end();
```

```js
const end = histogram.timer({ labels: { url: 'http://finn.no' } }); // start timer, set labels
// stuff happens
end();
```

```js
const end = histogram.timer(); // start timer
// stuff happens
end({ labels: { url: 'http://finn.no' } }); // set labels in end function
```

```js
const end = histogram.timer(meta: { buckets: [0.0001, 0.001, 0.01, 0.1, 0.5, 1, 10, 100] }); // start timer, set meta
// stuff happens
end();
```

#### .summary(options)

Creates an instance of a `Summary` class which can be used to populate the metrics stream with summary metrics.

**options**

| name          | description                                   | type     | default | required |
| ------------- | --------------------------------------------- | -------- | ------- | -------- |
| `name`        | Metric name. valid characters: a-z,A-Z,0-9,\_ | `string` | null    | `true`   |
| `description` | Metric description                            | `string` | null    | `true`   |
| `meta`        | Available to be used to hold any misc data.   | `object` | null    | `false`  |
| `labels`      | Available to be used to hold label data.      | `object` | null    | `false`  |

_Example_

```js
const client = new Metrics(options);
const summary = client.summary(options);
```

##### summary.observe(value, options)

Method that when called will populate the metrics stream with a summary value.

| name      | description                                        | type      | default | required |
| --------- | -------------------------------------------------- | --------- | ------- | -------- |
| `value`   | Value to set the summary to                        | `integer` | null    | `true`   |
| `options` | Object that can be used to specify labels and meta | `object`  | `{}`    | `false`  |

_Example_

```js
const summary = client.summary(options);

summary.observe(0.001); // observe value 0.001
summary.observe(5, { labels: { url: 'http://finn.no' } }); // observe value 5, specify labels
summary.observe(0.01, {
    meta: { quantiles: [0.001, 0.01, 0.5, 0.9, 0.99] }, // observe 0.01, use meta to specify quantile meta
});
```

##### summary.timer(options)

Method that when called will return an end function for use in measuring the time between 2 points

| name      | description                                        | type     | default | required |
| --------- | -------------------------------------------------- | -------- | ------- | -------- |
| `options` | Object that can be used to specify labels and meta | `object` | `{}`    | `false`  |

_Examples_

```js
const summary = client.summary(options);

const end = summary.timer(); // start timer
// stuff happens
end();
```

```js
const end = summary.timer({ labels: { url: 'http://finn.no' } }); // start timer, set labels
// stuff happens
end();
```

```js
const end = summary.timer(); // start timer
// stuff happens
end({ labels: { url: 'http://finn.no' } }); // set labels in end function
```

```js
const end = summary.timer({
    meta: { quantiles: [0.001, 0.01, 0.5, 0.9, 0.99] },
}); // start timer, set meta
// stuff happens
end();
```

#### .metric(options)

Collects a generic metric. As a minimum, a name and description for the metric must be provided.

**options**

| name          | description                                      | type             | default | required |
| ------------- | ------------------------------------------------ | ---------------- | ------- | -------- |
| `name`        | Metric name. valid characters: a-z,A-Z,0-9,\_    | `string`         | null    | `true`   |
| `description` | Metric description                               | `string`         | null    | `true`   |
| `value`       | Arbitrary value for the metric (used for gauges) | `string\|number` | null    | `false`  |
| `meta`        | Available to be used to hold any misc data.      | `object`         | null    | `false`  |
| `labels`      | Available to be used to hold label data.         | `array[object]`  | null    | `false`  |

**return**: `void`

```js
client.metric({
    name: '',
    description: '',
});
```

**meta**

`meta` can be used to hold any additional information you might wish to pass on to a consumer.
It should be an object of keys and values.

```js
client.metric({
    name: 'my_metric',
    description: 'My HTTP timing metric',
    meta: {
        quantiles: [0.01, 0.1, 0.5, 0.9, 0.99],
    },
});
```

**labels**

`labels` can be used to pass on specific label metadata to a consumer. Examples of labels are the URL or method when
timing HTTP requests.

Labels should be defined as an array of objects where each object has a `name` and `value` property.
The `name` property describes the labels name and the `value` property describes the label's actual value.

```js
client.metric({
    name: 'my_metric',
    description: 'My HTTP timing metric',
    labels: [
        { name: 'url', value: 'http://finn.no' },
        { name: 'method', value: 'get' },
    ],
});
```

#### .timer(options)

Starts a metric timer and returns and end function to be called when the measurement should be considered finished.

**options**

| name          | description                                      | type             | default | required |
| ------------- | ------------------------------------------------ | ---------------- | ------- | -------- |
| `name`        | Metric name. valid characters: a-z,A-Z,0-9,\_    | `string`         | null    | `true`   |
| `description` | Metric description                               | `string`         | null    | `true`   |
| `value`       | Arbitrary value for the metric (used for gauges) | `string\|number` | null    | `false`  |
| `meta`        | Available to be used to hold any misc data       | `object`         | null    | `false`  |

**return**: `function` Returns an end function (see below) to be used to indicate that the timer measurement is finished.

_Example_

```js
const end = client.timer(options);
```

##### .end(options)

Stops a previously started timer, merges timers `options` with end `options` and and sets the measured `time` value.

**options**

| name          | description                                      | type             | default | required |
| ------------- | ------------------------------------------------ | ---------------- | ------- | -------- |
| `name`        | Metric name. valid characters: a-z,A-Z,0-9,\_    | `string`         | null    | `true`   |
| `description` | Metric description                               | `string`         | null    | `true`   |
| `value`       | Arbitrary value for the metric (used for gauges) | `string\|number` | null    | `false`  |
| `meta`        | Available to be used to hold any misc data       | `object`         | null    | `false`  |

**return**: `void`

_Example_

```js
const end = client.timer(options);
// ... thing to be measured
end(options);
```

### instance events

#### drop

Emitted when the client starts dropping metrics. Will emit the dropped metric.

_Example_

```js
const client = new Metrics();
client.on('drop', metric => {
    console.log('dropped metric', metric);
});
```
