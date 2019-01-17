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
            type: 1,
            value,
            labels,
        });
        this.emit('metric', metric);
    }
};

module.exports = Gauge;
