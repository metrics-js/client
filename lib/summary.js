'use strict';

const assert = require('assert');
const { EventEmitter } = require('events');
const timeSpan = require('time-span');
const Metric = require('@metrics/metric');

const Summary = class Summary extends EventEmitter {
    constructor(options) {
        super();

        assert(
            typeof options === 'object',
            `argument 'options' must be provided`,
        );

        // TODO: validate optional quantiles option

        this.options = {
            labels: [],
            ...options,
        };
    }

    observe(value, options = {}) {
        assert(
            typeof value === 'number',
            `argument 'value' to method .observe() must be of type 'number'`,
        );

        const labelsObject = {
            ...(this.options.labels || {}),
            ...(options.labels || {}),
        };

        const labels = Object.keys(labelsObject).map(label => ({
            name: label,
            value: labelsObject[label],
        }));

        const metric = {
            name: this.options.name,
            description: this.options.description,
            type: 7,
            value,
            labels,
        };

        if (this.options.quantiles) {
            metric.meta = {
                quantiles: this.options.quantiles,
            };
        }

        this.emit('metric', new Metric(metric));
    }

    timer(options = {}) {
        const end = timeSpan();
        return (opts = {}) => {
            const labels = {
                ...(options.labels || {}),
                ...(opts.labels || {}),
            };
            this.observe(end.seconds(), { labels });
        };
    }
};

module.exports = Summary;
