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

        Object.defineProperty(this, 'options', {
            value: {
                labels: {},
                ...options,
            },
        });
    }

    inc(value, options) {
        let val = value || 1;
        let opts = options || {};

        if (typeof value === 'object' && !options) {
            val = 1;
            opts = value;
        }

        const labelsObject = {
            ...(this.options.labels || {}),
            ...(opts.labels || {}),
        };

        const labels = Object.keys(labelsObject).map((label) => ({
            name: label,
            value: labelsObject[label],
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
