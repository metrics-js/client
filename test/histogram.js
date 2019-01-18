'use strict';

const tap = require('tap');
const lolex = require('lolex');
const Histogram = require('../lib/histogram');

tap.test(
    'histogram() - creating a basic histogram without options throws',
    t => {
        t.throws(() => new Histogram());
        t.end();
    },
);

tap.test(
    'histogram().observe() - calling observe with no argument throws',
    t => {
        const histogram = new Histogram({
            name: 'valid_name',
            description: 'Valid description',
        });
        t.throws(() => histogram.observe());
        t.end();
    },
);

tap.test(
    'histogram() - creating a basic histogram with minimal arguments',
    t => {
        const histogram = new Histogram({
            name: 'valid_name',
            description: 'Valid description',
        });

        histogram.on('metric', metric => {
            t.equal(metric.name, 'valid_name');
            t.equal(metric.description, 'Valid description');
            t.equal(metric.type, 5);
            t.equal(metric.value, 1);
            t.same(metric.labels, []);
            t.same(metric.meta, {});
            t.end();
        });

        histogram.observe(1);
    },
);

tap.test(
    'histogram() - creating a histogram with labels and then not populating them',
    t => {
        const histogram = new Histogram({
            name: 'valid_name',
            description: 'Valid description',
            labels: { first: undefined, second: undefined, third: undefined },
        });

        histogram.on('metric', metric => {
            t.equal(metric.name, 'valid_name');
            t.equal(metric.description, 'Valid description');
            t.equal(metric.type, 5);
            t.equal(metric.value, 1);
            t.same(metric.labels, [
                { name: 'first', value: undefined },
                { name: 'second', value: undefined },
                { name: 'third', value: undefined },
            ]);
            t.same(metric.meta, {});
            t.end();
        });

        histogram.observe(1);
    },
);

tap.test(
    'histogram() - creating a histogram with labels and then populating them',
    t => {
        const histogram = new Histogram({
            name: 'valid_name',
            description: 'Valid description',
            labels: { first: undefined, second: undefined, third: undefined },
        });

        histogram.on('metric', metric => {
            t.equal(metric.name, 'valid_name');
            t.equal(metric.description, 'Valid description');
            t.equal(metric.type, 5);
            t.equal(metric.value, 1);
            t.same(metric.labels, [
                { name: 'first', value: 'this is first' },
                { name: 'second', value: 'this is second' },
                { name: 'third', value: 'this is third' },
            ]);
            t.same(metric.meta, {});
            t.end();
        });

        histogram.observe(1, {
            labels: {
                first: 'this is first',
                second: 'this is second',
                third: 'this is third',
            },
        });
    },
);

tap.test(
    'histogram() - creating a histogram without labels and then populating them',
    t => {
        const histogram = new Histogram({
            name: 'valid_name',
            description: 'Valid description',
        });

        histogram.on('metric', metric => {
            t.equal(metric.name, 'valid_name');
            t.equal(metric.description, 'Valid description');
            t.equal(metric.type, 5);
            t.equal(metric.value, 1);
            t.same(metric.labels, [
                { name: 'first', value: 'this is first' },
                { name: 'second', value: 'this is second' },
                { name: 'third', value: 'this is third' },
            ]);
            t.same(metric.meta, {});
            t.end();
        });

        histogram.observe(1, {
            labels: {
                first: 'this is first',
                second: 'this is second',
                third: 'this is third',
            },
        });
    },
);

tap.test(
    'histogram() - creating a histogram with some labels and then populating them others (merge)',
    t => {
        const histogram = new Histogram({
            name: 'valid_name',
            description: 'Valid description',
            labels: { first: 'this is first' },
        });

        histogram.on('metric', metric => {
            t.equal(metric.name, 'valid_name');
            t.equal(metric.description, 'Valid description');
            t.equal(metric.type, 5);
            t.equal(metric.value, 1);
            t.same(metric.labels, [
                { name: 'first', value: 'this is first' },
                { name: 'second', value: 'this is second' },
                { name: 'third', value: 'this is third' },
            ]);
            t.same(metric.meta, {});
            t.end();
        });

        histogram.observe(1, {
            labels: {
                second: 'this is second',
                third: 'this is third',
            },
        });
    },
);

tap.test('histogram() - using timer to time a number of seconds', t => {
    const clock = lolex.install();

    const histogram = new Histogram({
        name: 'valid_name',
        description: 'Valid description',
        labels: { first: 'this is first' },
    });

    histogram.on('metric', metric => {
        t.equal(metric.name, 'valid_name');
        t.equal(metric.description, 'Valid description');
        t.equal(metric.type, 5);
        t.equal(metric.value, 0.231);
        t.same(metric.labels, [
            { name: 'first', value: 'this is first' },
            { name: 'second', value: 'this is second' },
            { name: 'third', value: 'this is third' },
        ]);
        t.same(metric.meta, {});
        t.end();
    });

    const end = histogram.timer({
        labels: {
            second: 'this is second',
            third: 'this is third',
        },
    });

    clock.tick(231);

    end();

    clock.uninstall();
});

tap.test(
    'histogram() - using timer to time a number of seconds, label merge',
    t => {
        const clock = lolex.install();

        const histogram = new Histogram({
            name: 'valid_name',
            description: 'Valid description',
            labels: { first: 'this is first' },
        });

        histogram.on('metric', metric => {
            t.equal(metric.name, 'valid_name');
            t.equal(metric.description, 'Valid description');
            t.equal(metric.type, 5);
            t.equal(metric.value, 0.231);
            t.same(metric.labels, [
                { name: 'first', value: 'this is first' },
                { name: 'second', value: 'this is second' },
                { name: 'third', value: 'this is third' },
            ]);
            t.same(metric.meta, {});
            t.end();
        });

        const end = histogram.timer({
            labels: {
                second: 'this is second',
            },
        });

        clock.tick(231);

        end({
            labels: {
                third: 'this is third',
            },
        });

        clock.uninstall();
    },
);

tap.test('histogram() - buckets option', t => {
    const histogram = new Histogram({
        name: 'valid_name',
        description: 'Valid description',
        buckets: [0.001, 0.01, 0.1, 1, 10, 100, 1000],
    });

    histogram.on('metric', metric => {
        t.equal(metric.name, 'valid_name');
        t.equal(metric.description, 'Valid description');
        t.equal(metric.type, 5);
        t.equal(metric.value, 1);
        t.same(metric.labels, []);
        t.same(metric.meta, { buckets: [0.001, 0.01, 0.1, 1, 10, 100, 1000] });
        t.end();
    });

    histogram.observe(1);
});
