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

tap.test(
    'gauge() - creating a gauge with labels and then not populating them',
    t => {
        const gauge = new Gauge({
            name: 'valid_name',
            description: 'Valid description',
            labels: { first: undefined, second: undefined, third: undefined },
        });

        gauge.on('metric', metric => {
            t.equal(metric.name, 'valid_name');
            t.equal(metric.description, 'Valid description');
            t.equal(metric.type, 1);
            t.equal(metric.value, 1);
            t.same(metric.labels, [
                { name: 'first', value: undefined },
                { name: 'second', value: undefined },
                { name: 'third', value: undefined },
            ]);
            t.same(metric.meta, {});
            t.end();
        });

        gauge.set(1);
    },
);

tap.test(
    'gauge() - creating a gauge with labels and then populating them',
    t => {
        const gauge = new Gauge({
            name: 'valid_name',
            description: 'Valid description',
            labels: { first: undefined, second: undefined, third: undefined },
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

        gauge.set(1, {
            labels: {
                first: 'this is first',
                second: 'this is second',
                third: 'this is third',
            },
        });
    },
);

tap.test(
    'gauge() - creating a gauge without labels and then populating them',
    t => {
        const gauge = new Gauge({
            name: 'valid_name',
            description: 'Valid description',
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

        gauge.set(1, {
            labels: {
                first: 'this is first',
                second: 'this is second',
                third: 'this is third',
            },
        });
    },
);

tap.test(
    'gauge() - creating a gauge with some labels and then populating them others (merge)',
    t => {
        const gauge = new Gauge({
            name: 'valid_name',
            description: 'Valid description',
            labels: { first: 'this is first' },
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

        gauge.set(1, {
            labels: {
                second: 'this is second',
                third: 'this is third',
            },
        });
    },
);
