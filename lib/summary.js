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

    timer(...labelsTimer) {
        const end = timeSpan();
        return (...labelsEnd) => {
            const labels = labelsEnd || labelsTimer || [];
            this.observe(end.seconds(), ...labels);
        };
    }
};

module.exports = Summary;
