'use strict';

const assert = require('assert');
const { EventEmitter } = require('events');
const Metric = require('@metrics/metric');

const Counter = class Counter extends EventEmitter {
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

    inc(value, ...rest) {
        let val = value;

        if (typeof value !== 'number') {
            val = 1;

            if (typeof value === 'string') {
                rest.unshift(value);
            }
        }

        const labels = this.options.labels.map((label, i) => ({
            name: label,
            value: rest[i],
        }));

        const metric = new Metric({
            name: this.options.name,
            description: this.options.description,
            type: 2,
            value: val,
            labels,
        });
        this.emit('metric', metric);
    }
};

module.exports = Counter;
