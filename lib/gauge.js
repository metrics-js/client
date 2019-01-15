'use strict';

const Gauge = class Gauge {
    constructor(options) {
        this.options = {
            labels: [],
            ...options,
        };
    }

    set(value, ...rest) {
        // TODO: assert value is set and a number

        const labels = this.options.labels.map((label, i) => ({
            name: label,
            value: rest[i],
        }));

        this.client.metric({
            name: this.options.name,
            description: this.options.description,
            type: 1,
            value,
            labels,
        });
    }
};

module.exports = Gauge;
