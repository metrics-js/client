'use strict';

const util = require('util');

const _metric = Symbol('metric');

module.exports = class Metric {
    constructor(metric) {
        this[_metric] = metric;
    }

    get name() {
        return this[_metric].name;
    }

    get description() {
        return this[_metric].description;
    }

    get timestamp() {
        return this[_metric].timestamp;
    }

    get value() {
        return this[_metric].value || null;
    }

    get time() {
        return this[_metric].time || null;
    }

    get meta() {
        return this[_metric].meta || {};
    }

    toJSON() {
        return {
            name: this.name,
            description: this.description,
            timestamp: this.timestamp,
            value: this.value,
            time: this.time,
            meta: this.meta,
        };
    }

    [util.inspect.custom](depth, options) {
        return `Metric ${util.inspect(this.toJSON(), depth, options)}`;
    }

    [Symbol.toPrimitive](hint) {
        if (hint === 'string') return `Metric ${JSON.stringify(this)}`;
        throw new Error(
            `Invalid usage. Metric class instance cannot be treated as type '${hint}'`
        );
    }

    get [Symbol.toStringTag]() {
        return 'PodiumMetricsMetric';
    }
};
