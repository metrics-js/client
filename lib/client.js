'use strict';

const Metric = require('./metric');
const { PassThrough } = require('readable-stream');
const timeSpan = require('time-span');

const MAX_BUFFER = 100;

module.exports = class Metrics extends PassThrough {
    constructor(options = {}) {
        super({
            objectMode: true,
            highWaterMark: options.maxBuffer || MAX_BUFFER,
        });
    }

    get [Symbol.toStringTag]() {
        return 'Metrics';
    }

    clipBufferIfNecessary() {
        // when too many items are buffered, we remove 1
        if (
            this._readableState.buffer.length >
            this._readableState.highWaterMark
        ) {
            this.read();
        }
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
            this.push(metric);
            this.clipBufferIfNecessary();
        };
    }

    metric(options) {
        const metric = new Metric({
            timestamp: Date.now() / 1000,
            ...options,
        });
        this.push(metric);
        this.clipBufferIfNecessary();
    }
};
