'use strict';

const assert = require('assert');

const Counter = class Counter {
    constructor(client, options) {
        assert(
            typeof client.metric === 'function',
            `argument 'client' is not a Metrics client instance`,
        );
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

        this.client = client;
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

        this.client.metric({
            name: this.options.name,
            description: this.options.description,
            type: 2,
            value: val,
            labels,
        });
    }
};

module.exports = Counter;
