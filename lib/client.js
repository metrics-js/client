'use strict';

/* eslint prefer-rest-params: "off" */

const timeSpan = require('time-span');
const Metric = require('./metric');
const stream = require('readable-stream');
const crypto = require('crypto');

const _push = Symbol('_push');

module.exports = class Metrics extends stream.Transform {
    constructor({ id = undefined } = {}) {
        super(
            Object.assign(
                {
                    objectMode: true,
                },
                ...arguments
            )
        );

        Object.defineProperty(this, 'id', {
            value: id || crypto.randomBytes(3 * 4).toString('base64'),
            enumerable: true,
        });
    }

    get [Symbol.toStringTag]() {
        return 'Metrics';
    }

    [_push](metric) {
        metric.source = this.id;
        if (this._readableState.flowing) {
            this.push(metric);
            return;
        }
        this.emit('drop', metric);
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
            this[_push](metric);
        };
    }

    metric(options) {
        const metric = new Metric({
            timestamp: Date.now() / 1000,
            ...options,
        });
        this[_push](metric);
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
