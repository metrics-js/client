'use strict';

const tap = require('tap');
const Gauge = require('../lib/gauge');

tap.test('gauge() - creating a basic gauge without options throws', t => {
    t.throws(() => new Gauge());
    t.end();
});

tap.test('gauge().set() - calling set with no argument throws', t => {
    const gauge = new Gauge({
        name: 'valid_name',
        description: 'Valid description',
    });
    t.throws(() => gauge.set());
    t.end();
});

tap.test('gauge() - creating a basic gauge with minimal arguments', t => {
    const gauge = new Gauge({
        name: 'valid_name',
        description: 'Valid description',
    });

    gauge.on('metric', metric => {
        t.equal(metric.name, 'valid_name');
        t.equal(metric.description, 'Valid description');
        t.equal(metric.type, 1);
        t.equal(metric.value, 1);
        t.same(metric.labels, []);
        t.same(metric.meta, {});
        t.end();
    });

    gauge.set(1);
});

// tap.test(
//     'gauge() - creating a gauge with labels and then not populating them',
//     t => {
//         const gauge = new Gauge({
//             name: 'valid_name',
//             description: 'Valid description',
//             labels: ['first', 'second', 'third'],
//         });

//         gauge.on('metric', metric => {
//             t.same(metric, {
//                 name: 'valid_name',
//                 description: 'Valid description',
//                 type: 1,
//                 value: 1,
//                 labels: [
//                     { name: 'first', value: undefined },
//                     { name: 'second', value: undefined },
//                     { name: 'third', value: undefined },
//                 ],
//             });
//             t.end();
//         });

//         gauge.set(1);
//     },
// );

tap.test(
    'gauge() - creating a gauge with labels and then populating them',
    t => {
        const gauge = new Gauge({
            name: 'valid_name',
            description: 'Valid description',
            labels: ['first', 'second', 'third'],
        });

        gauge.on('metric', metric => {
            t.equal(metric.name, 'valid_name');
            t.equal(metric.description, 'Valid description');
            t.equal(metric.type, 1);
            t.equal(metric.value, 1);
            t.same(metric.labels, [
                { name: 'first', value: 'this is first' },
                { name: 'second', value: 'this is second' },
                { name: 'third', value: 'this is third' },
            ]);
            t.same(metric.meta, {});
            t.end();
        });

        gauge.set(1, 'this is first', 'this is second', 'this is third');
    },
);
