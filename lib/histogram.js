'use strict';

const assert = require('assert');
const { EventEmitter } = require('events');
const timeSpan = require('time-span');
const Metric = require('@metrics/metric');

const Histogram = class Histogram extends EventEmitter {
    constructor(options) {
        super();

        assert(
            typeof options === 'object',
            `argument 'options' must be provided`,
        );

        // TODO: validate optional buckets option

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
            type: 5,
            value,
            labels,
        };

        if (this.options.buckets) {
            metric.meta = {
                buckets: this.options.buckets,
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

module.exports = Histogram;
