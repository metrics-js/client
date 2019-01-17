'use strict';

const tap = require('tap');
const Counter = require('../lib/counter');

tap.test('counter() - creating a basic counter without options throws', t => {
    t.throws(() => new Counter());
    t.end();
});

tap.test(
    'counter().inc() - calling inc with no argument results in a 1 being set',
    t => {
        const counter = new Counter({
            name: 'valid_name',
            description: 'Valid description',
        });

        counter.on('metric', metric => {
            t.equal(metric.name, 'valid_name');
            t.equal(metric.description, 'Valid description');
            t.equal(metric.type, 2);
            t.equal(metric.value, 1);
            t.same(metric.labels, []);
            t.same(metric.meta, {});
            t.end();
        });

        counter.inc();
    },
);

tap.test('counter().inc() - calling inc with a value', t => {
    const counter = new Counter({
        name: 'valid_name',
        description: 'Valid description',
    });

    counter.on('metric', metric => {
        t.equal(metric.name, 'valid_name');
        t.equal(metric.description, 'Valid description');
        t.equal(metric.type, 2);
        t.equal(metric.value, 101);
        t.same(metric.labels, []);
        t.same(metric.meta, {});
        t.end();
    });

    counter.inc(101);
});

tap.test('counter() - creating a basic counter with minimal arguments', t => {
    const counter = new Counter({
        name: 'valid_name',
        description: 'Valid description',
    });

    counter.on('metric', metric => {
        t.equal(metric.name, 'valid_name');
        t.equal(metric.description, 'Valid description');
        t.equal(metric.type, 2);
        t.equal(metric.value, 1);
        t.same(metric.labels, []);
        t.same(metric.meta, {});
        t.end();
    });

    counter.inc();
});

// tap.test(
//     'counter() - creating a counter with labels and then not populating them',
//     t => {
//         const counter = new Counter({
//             name: 'valid_name',
//             description: 'Valid description',
//             labels: ['first', 'second', 'third'],
//         });

//         counter.on('metric', metric => {
//             t.equal(metric.name, 'valid_name');
//             t.equal(metric.description, 'Valid description');
//             t.equal(metric.type, 2);
//             t.equal(metric.value, 1);
//             t.same(metric.labels, [
//                 { name: 'first', value: undefined },
//                 { name: 'second', value: undefined },
//                 { name: 'third', value: undefined },
//             ]);
//             t.same(metric.meta, {});
//             t.end();
//         });

//         counter.inc();
//     },
// );

tap.test(
    'counter() - creating a counter with labels and then populating them',
    t => {
        const counter = new Counter({
            name: 'valid_name',
            description: 'Valid description',
            labels: ['first', 'second', 'third'],
        });

        counter.on('metric', metric => {
            t.equal(metric.name, 'valid_name');
            t.equal(metric.description, 'Valid description');
            t.equal(metric.type, 2);
            t.equal(metric.value, 101);
            t.same(metric.labels, [
                { name: 'first', value: 'this is first' },
                { name: 'second', value: 'this is second' },
                { name: 'third', value: 'this is third' },
            ]);
            t.same(metric.meta, {});
            t.end();
        });

        counter.inc(101, 'this is first', 'this is second', 'this is third');
    },
);

tap.test(
    'counter() - creating a counter with labels and then populating them without specifying an increment',
    t => {
        const counter = new Counter({
            name: 'valid_name',
            description: 'Valid description',
            labels: ['first', 'second', 'third'],
        });

        counter.on('metric', metric => {
            t.equal(metric.name, 'valid_name');
            t.equal(metric.description, 'Valid description');
            t.equal(metric.type, 2);
            t.equal(metric.value, 1);
            t.same(metric.labels, [
                { name: 'first', value: 'this is first' },
                { name: 'second', value: 'this is second' },
                { name: 'third', value: 'this is third' },
            ]);
            t.same(metric.meta, {});
            t.end();
        });

        counter.inc('this is first', 'this is second', 'this is third');
    },
);
