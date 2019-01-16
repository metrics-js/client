'use strict';

const assert = require('assert');
const { EventEmitter } = require('events');
const Metric = require('@metrics/metric');

const Gauge = class Gauge extends EventEmitter {
    constructor(options) {
        super();

        assert(
            typeof options === 'object',
            `argument 'options' must be provided`,
        );

        assert(
            /^[A-Za-z-_]*$/.test(options.name),
            `argument 'options.name' must be a valid string`,
        );

        assert(
            options.description && typeof options.description === 'string',
            `argument 'options.description' must be provided`,
        );

        this.options = {
            labels: [],
            ...options,
        };
    }

    set(value, ...rest) {
        assert(
            typeof value === 'number',
            `argument 'value' to method .set() must be of type 'number'`,
        );

        const labels = this.options.labels.map((label, i) => ({
            name: label,
            value: rest[i],
        }));

        const metric = new Metric({
            name: this.options.name,
            description: this.options.description,
            timestamp: Date.now() / 1000,
            type: 1,
            value,
            labels,
        });
        this.emit('metric', metric);
    }
};

module.exports = Gauge;
