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

        Object.defineProperty(this, 'options', {
            value: {
                labels: {},
                ...options,
            },
        });
    }

    set(value, options = {}) {
        assert(
            typeof value === 'number',
            `argument 'value' to method .set() must be of type 'number'`,
        );

        const labelsObject = {
            ...(this.options.labels || {}),
            ...(options.labels || {}),
        };

        const labels = Object.keys(labelsObject).map((label) => ({
            name: label,
            value: labelsObject[label],
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
