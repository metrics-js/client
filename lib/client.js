'use strict';

/* eslint prefer-rest-params: "off" */

const timeSpan = require('time-span');
const stream = require('readable-stream');
const crypto = require('crypto');
const Metric = require('@metrics/metric');

const Counter = require('./counter');
const Gauge = require('./gauge');

const push = Symbol('push');

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

        const client = this;

        Object.defineProperty(this, 'Counter', {
            value: class MetricsCounter extends Counter {
                get [Symbol.toStringTag]() {
                    return 'MetricsCounter';
                }

                get client() {
                    return client;
                }
            },
        });

        Object.defineProperty(this, 'Gauge', {
            value: class MetricsGauge extends Gauge {
                get [Symbol.toStringTag]() {
                    return 'MetricsGauge';
                }

                get client() {
                    return client;
                }
            },
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

    timer(options = {}) {
        const end = timeSpan();
        return (opts = {}) => {
            const meta = { ...options.meta, ...opts.meta };
            const time = end.seconds();
            const metric = new Metric({
                timestamp: Date.now() / 1000,
                ...options,
                ...opts,
                time,
                meta,
            });
            this[push](metric);
        };
    }

    metric(options) {
        const metric = new Metric({
            timestamp: Date.now() / 1000,
            ...options,
        });
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
