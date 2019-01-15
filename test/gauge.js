'use strict';

const tap = require('tap');
const Gauge = require('../lib/gauge');

tap.test('gauge() - creating a basic gauge without client throws', t => {
    t.throws(() => new Gauge());
    t.end();
});

tap.test('gauge() - creating a basic gauge without options throws', t => {
    t.throws(() => new Gauge({ metric() {} }));
    t.end();
});

tap.test('gauge() - creating a basic gauge without options.name throws', t => {
    t.throws(() => new Gauge({ metric() {} }, {}));
    t.end();
});

tap.test(
    'gauge() - creating a basic gauge with empty options.name throws',
    t => {
        t.throws(() => new Gauge({ metric() {} }, { name: '' }));
        t.end();
    },
);

tap.test(
    'gauge() - creating a basic gauge with invalid options.name throws',
    t => {
        t.throws(
            () =>
                new Gauge(
                    { metric() {} },
                    { name: 'this is invalid', description: 'this is valid' },
                ),
        );
        t.end();
    },
);

tap.test(
    'gauge() - creating a basic gauge with empty options.description throws',
    t => {
        t.throws(() => new Gauge({ metric() {} }, { name: 'valid_name' }));
        t.end();
    },
);

tap.test('gauge().set() - calling set with no argument throws', t => {
    const gauge = new Gauge(
        { metric() {} },
        { name: 'valid_name', description: 'Valid description' },
    );
    t.throws(() => gauge.set());
    t.end();
});

tap.test('gauge() - creating a basic gauge with minimal arguments', t => {
    const mockClient = {
        metric(options) {
            t.same(options, {
                name: 'valid_name',
                description: 'Valid description',
                type: 1,
                value: 1,
                labels: [],
            });
            t.end();
        },
    };

    const gauge = new Gauge(mockClient, {
        name: 'valid_name',
        description: 'Valid description',
    });

    gauge.set(1);
});

tap.test(
    'gauge() - creating a gauge with labels and then not populating them',
    t => {
        const mockClient = {
            metric(options) {
                t.same(options, {
                    name: 'valid_name',
                    description: 'Valid description',
                    type: 1,
                    value: 1,
                    labels: [
                        { name: 'first', value: undefined },
                        { name: 'second', value: undefined },
                        { name: 'third', value: undefined },
                    ],
                });
                t.end();
            },
        };

        const gauge = new Gauge(mockClient, {
            name: 'valid_name',
            description: 'Valid description',
            labels: ['first', 'second', 'third'],
        });

        gauge.set(1);
    },
);

tap.test(
    'gauge() - creating a gauge with labels and then populating them',
    t => {
        const mockClient = {
            metric(options) {
                t.same(options, {
                    name: 'valid_name',
                    description: 'Valid description',
                    type: 1,
                    value: 1,
                    labels: [
                        { name: 'first', value: 'this is first' },
                        { name: 'second', value: 'this is second' },
                        { name: 'third', value: 'this is third' },
                    ],
                });
                t.end();
            },
        };

        const gauge = new Gauge(mockClient, {
            name: 'valid_name',
            description: 'Valid description',
            labels: ['first', 'second', 'third'],
        });

        gauge.set(1, 'this is first', 'this is second', 'this is third');
    },
);
