'use strict';

const tap = require('tap');
const Counter = require('../lib/counter');

tap.test('counter() - creating a basic counter without client throws', t => {
    t.throws(() => new Counter());
    t.end();
});

tap.test('counter() - creating a basic counter without options throws', t => {
    t.throws(() => new Counter({ metric() {} }));
    t.end();
});

tap.test(
    'counter() - creating a basic counter without options.name throws',
    t => {
        t.throws(() => new Counter({ metric() {} }, {}));
        t.end();
    },
);

tap.test(
    'counter() - creating a basic counter with empty options.name throws',
    t => {
        t.throws(() => new Counter({ metric() {} }, { name: '' }));
        t.end();
    },
);

tap.test(
    'counter() - creating a basic counter with invalid options.name throws',
    t => {
        t.throws(
            () =>
                new Counter(
                    { metric() {} },
                    { name: 'this is invalid', description: 'this is valid' },
                ),
        );
        t.end();
    },
);

tap.test(
    'counter() - creating a basic counter with empty options.description throws',
    t => {
        t.throws(() => new Counter({ metric() {} }, { name: 'valid_name' }));
        t.end();
    },
);

tap.test(
    'counter().inc() - calling inc with no argument results in a 1 being set',
    t => {
        const mockClient = {
            metric(options) {
                t.same(options, {
                    name: 'valid_name',
                    description: 'Valid description',
                    type: 2,
                    value: 1,
                    labels: [],
                });
                t.end();
            },
        };

        const counter = new Counter(mockClient, {
            name: 'valid_name',
            description: 'Valid description',
        });

        counter.inc();
    },
);

tap.test('counter().inc() - calling inc with a value', t => {
    const mockClient = {
        metric(options) {
            t.same(options, {
                name: 'valid_name',
                description: 'Valid description',
                type: 2,
                value: 101,
                labels: [],
            });
            t.end();
        },
    };

    const counter = new Counter(mockClient, {
        name: 'valid_name',
        description: 'Valid description',
    });

    counter.inc(101);
});

tap.test('counter() - creating a basic counter with minimal arguments', t => {
    const mockClient = {
        metric(options) {
            t.same(options, {
                name: 'valid_name',
                description: 'Valid description',
                type: 2,
                value: 1,
                labels: [],
            });
            t.end();
        },
    };

    const counter = new Counter(mockClient, {
        name: 'valid_name',
        description: 'Valid description',
    });

    counter.inc();
});

tap.test(
    'counter() - creating a counter with labels and then not populating them',
    t => {
        const mockClient = {
            metric(options) {
                t.same(options, {
                    name: 'valid_name',
                    description: 'Valid description',
                    type: 2,
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

        const counter = new Counter(mockClient, {
            name: 'valid_name',
            description: 'Valid description',
            labels: ['first', 'second', 'third'],
        });

        counter.inc();
    },
);

tap.test(
    'counter() - creating a counter with labels and then populating them',
    t => {
        const mockClient = {
            metric(options) {
                t.same(options, {
                    name: 'valid_name',
                    description: 'Valid description',
                    type: 2,
                    value: 101,
                    labels: [
                        { name: 'first', value: 'this is first' },
                        { name: 'second', value: 'this is second' },
                        { name: 'third', value: 'this is third' },
                    ],
                });
                t.end();
            },
        };

        const counter = new Counter(mockClient, {
            name: 'valid_name',
            description: 'Valid description',
            labels: ['first', 'second', 'third'],
        });

        counter.inc(101, 'this is first', 'this is second', 'this is third');
    },
);

tap.test(
    'counter() - creating a counter with labels and then populating them without specifying an increment',
    t => {
        const mockClient = {
            metric(options) {
                t.same(options, {
                    name: 'valid_name',
                    description: 'Valid description',
                    type: 2,
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

        const counter = new Counter(mockClient, {
            name: 'valid_name',
            description: 'Valid description',
            labels: ['first', 'second', 'third'],
        });

        counter.inc('this is first', 'this is second', 'this is third');
    },
);
