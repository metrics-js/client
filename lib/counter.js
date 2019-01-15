'use strict';

const Counter = class Counter {
    constructor(options) {
        this.options = {
            labels: [],
            ...options,
        };
    }

    inc(value = 1, ...rest) {
        const labels = this.options.labels.map((label, i) => ({
            name: label,
            value: rest[i],
        }));

        this.client.metric({
            name: this.options.name,
            description: this.options.description,
            type: 2,
            value,
            labels,
        });
    }
};

module.exports = Counter;
