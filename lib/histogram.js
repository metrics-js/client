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

    observe(value, ...rest) {
        assert(
            typeof value === 'number',
            `argument 'value' to method .observe() must be of type 'number'`,
        );

        const labels = this.options.labels.map((label, i) => ({
            name: label,
            value: rest[i],
        }));

        const metric = {
            name: this.options.name,
            description: this.options.description,
            timestamp: Date.now() / 1000,
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

    timer(...labelsTimer) {
        const end = timeSpan();
        return (...labelsEnd) => {
            const lbls = labelsEnd || labelsTimer || [];
            this.observe(end.seconds(), ...lbls);
        };
    }
};

module.exports = Histogram;
