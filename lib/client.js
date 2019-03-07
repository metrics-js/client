'use strict';

/* eslint prefer-rest-params: "off" */

const timeSpan = require('time-span');
const stream = require('readable-stream');
const crypto = require('crypto');
const Metric = require('@metrics/metric');

const Counter = require('./counter');
const Gauge = require('./gauge');
const Summary = require('./summary');
const Histogram = require('./histogram');

const push = Symbol('metrics:client:push');

const MetricsClient = class MetricsClient extends stream.Transform {
    constructor({ id = undefined } = {}) {
        super(
            Object.assign(
                {
                    objectMode: true,
                },
                ...arguments,
            ),
        );

        Object.defineProperty(this, 'id', {
            value: id || crypto.randomBytes(3 * 4).toString('base64'),
            enumerable: true,
        });

        // Avoid hitting the max listeners limit when multiple
        // streams is piped into the same stream.
        this.on('pipe', (src) => {
            this.setMaxListeners(this.getMaxListeners() + 1);
        });

        this.on('unpipe', () => {
            this.setMaxListeners(this.getMaxListeners() - 1);
        });
    }

    get [Symbol.toStringTag]() {
        return 'MetricsClient';
    }

    [push](metric) {
        const met = metric;
        met.source = this.id;
        // eslint-disable-next-line no-underscore-dangle
        if (this._readableState.flowing) {
            this.push(met);
            return;
        }
        this.emit('drop', met);
    }

    counter(options) {
        const counter = new Counter(options);
        counter.on('metric', metric => {
            // eslint-disable-next-line no-param-reassign
            metric.source = this.source;
            this[push](metric);
        });
        return counter;
    }

    gauge(options) {
        const gauge = new Gauge(options);
        gauge.on('metric', metric => {
            // eslint-disable-next-line no-param-reassign
            metric.source = this.source;
            this[push](metric);
        });
        return gauge;
    }

    summary(options) {
        const summary = new Summary(options);
        summary.on('metric', metric => {
            // eslint-disable-next-line no-param-reassign
            metric.source = this.source;
            this[push](metric);
        });
        return summary;
    }

    histogram(options) {
        const histogram = new Histogram(options);
        histogram.on('metric', metric => {
            // eslint-disable-next-line no-param-reassign
            metric.source = this.source;
            this[push](metric);
        });
        return histogram;
    }

    timer(options = {}) {
        const end = timeSpan();
        return (opts = {}) => {
            const meta = { ...options.meta, ...opts.meta };
            const time = end.seconds();
            const metric = new Metric({
                type: 5,
                value: time,
                ...options,
                ...opts,
                meta,
            });
            metric.source = this.source;
            this[push](metric);
        };
    }

    metric(options) {
        const metric = new Metric(options);
        metric.source = this.source;
        this[push](metric);
    }

    _transform(metric, enc, next) {
        if (metric.source === this.id) {
            this.emit('drop', metric);
            next(null);
            return;
        }
        next(null, metric);
    }
};

module.exports = MetricsClient;
