'use strict';

const util = require('util');

const metric = Symbol('metric');
const source = Symbol('source');

module.exports = class Metric {
    constructor(metricObj) {
        this[metric] = metricObj;
        this[source] = '';
    }

    get source() {
        return this[source];
    }

    set source(value) {
        this[source] = value;
    }

    get name() {
        return this[metric].name;
    }

    get description() {
        return this[metric].description;
    }

    get timestamp() {
        return this[metric].timestamp;
    }

    get value() {
        return this[metric].value || null;
    }

    get time() {
        return this[metric].time || null;
    }

    get meta() {
        return this[metric].meta || {};
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
            `Invalid usage. Metric class instance cannot be treated as type "${hint}"`,
        );
    }

    get [Symbol.toStringTag]() {
        return 'Metric';
    }
};
