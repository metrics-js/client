'use strict';

const tap = require('tap');
const lolex = require('lolex');
const Summary = require('../lib/summary');

tap.test('summary() - creating a basic summary without options throws', t => {
    t.throws(() => new Summary());
    t.end();
});

tap.test('summary().observe() - calling observe with no argument throws', t => {
    const summary = new Summary({
        name: 'valid_name',
        description: 'Valid description',
    });
    t.throws(() => summary.observe());
    t.end();
});

tap.test('summary() - creating a basic summary with minimal arguments', t => {
    const summary = new Summary({
        name: 'valid_name',
        description: 'Valid description',
    });

    summary.on('metric', metric => {
        t.equal(metric.name, 'valid_name');
        t.equal(metric.description, 'Valid description');
        t.equal(metric.type, 7);
        t.equal(metric.value, 1);
        t.same(metric.labels, []);
        t.same(metric.meta, {});
        t.end();
    });

    summary.observe(1);
});

tap.test(
    'summary() - creating a summary with labels and then not populating them',
    t => {
        const summary = new Summary({
            name: 'valid_name',
            description: 'Valid description',
            labels: { first: undefined, second: undefined, third: undefined },
        });

        summary.on('metric', metric => {
            t.equal(metric.name, 'valid_name');
            t.equal(metric.description, 'Valid description');
            t.equal(metric.type, 7);
            t.equal(metric.value, 1);
            t.same(metric.labels, [
                { name: 'first', value: undefined },
                { name: 'second', value: undefined },
                { name: 'third', value: undefined },
            ]);
            t.same(metric.meta, {});
            t.end();
        });

        summary.observe(1);
    },
);

tap.test(
    'summary() - creating a summary with labels and then populating them',
    t => {
        const summary = new Summary({
            name: 'valid_name',
            description: 'Valid description',
            labels: { first: undefined, second: undefined, third: undefined },
        });

        summary.on('metric', metric => {
            t.equal(metric.name, 'valid_name');
            t.equal(metric.description, 'Valid description');
            t.equal(metric.type, 7);
            t.equal(metric.value, 1);
            t.same(metric.labels, [
                { name: 'first', value: 'this is first' },
                { name: 'second', value: 'this is second' },
                { name: 'third', value: 'this is third' },
            ]);
            t.same(metric.meta, {});
            t.end();
        });

        summary.observe(1, {
            labels: {
                first: 'this is first',
                second: 'this is second',
                third: 'this is third',
            },
        });
    },
);

tap.test(
    'summary() - creating a summary without labels and then populating them',
    t => {
        const summary = new Summary({
            name: 'valid_name',
            description: 'Valid description',
        });

        summary.on('metric', metric => {
            t.equal(metric.name, 'valid_name');
            t.equal(metric.description, 'Valid description');
            t.equal(metric.type, 7);
            t.equal(metric.value, 1);
            t.same(metric.labels, [
                { name: 'first', value: 'this is first' },
                { name: 'second', value: 'this is second' },
                { name: 'third', value: 'this is third' },
            ]);
            t.same(metric.meta, {});
            t.end();
        });

        summary.observe(1, {
            labels: {
                first: 'this is first',
                second: 'this is second',
                third: 'this is third',
            },
        });
    },
);

tap.test(
    'summary() - creating a summary with some labels and then populating them others (merge)',
    t => {
        const summary = new Summary({
            name: 'valid_name',
            description: 'Valid description',
            labels: { first: 'this is first' },
        });

        summary.on('metric', metric => {
            t.equal(metric.name, 'valid_name');
            t.equal(metric.description, 'Valid description');
            t.equal(metric.type, 7);
            t.equal(metric.value, 1);
            t.same(metric.labels, [
                { name: 'first', value: 'this is first' },
                { name: 'second', value: 'this is second' },
                { name: 'third', value: 'this is third' },
            ]);
            t.same(metric.meta, {});
            t.end();
        });

        summary.observe(1, {
            labels: {
                second: 'this is second',
                third: 'this is third',
            },
        });
    },
);

tap.test('summary() - using timer to time a number of seconds', t => {
    const clock = lolex.install();

    const summary = new Summary({
        name: 'valid_name',
        description: 'Valid description',
        labels: { first: 'this is first' },
    });

    summary.on('metric', metric => {
        t.equal(metric.name, 'valid_name');
        t.equal(metric.description, 'Valid description');
        t.equal(metric.type, 7);
        t.equal(metric.value, 0.231);
        t.same(metric.labels, [
            { name: 'first', value: 'this is first' },
            { name: 'second', value: 'this is second' },
            { name: 'third', value: 'this is third' },
        ]);
        t.same(metric.meta, {});
        t.end();
    });

    const end = summary.timer({
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
    'summary() - using timer to time a number of seconds, label merge',
    t => {
        const clock = lolex.install();

        const summary = new Summary({
            name: 'valid_name',
            description: 'Valid description',
            labels: { first: 'this is first' },
        });

        summary.on('metric', metric => {
            t.equal(metric.name, 'valid_name');
            t.equal(metric.description, 'Valid description');
            t.equal(metric.type, 7);
            t.equal(metric.value, 0.231);
            t.same(metric.labels, [
                { name: 'first', value: 'this is first' },
                { name: 'second', value: 'this is second' },
                { name: 'third', value: 'this is third' },
            ]);
            t.same(metric.meta, {});
            t.end();
        });

        const end = summary.timer({
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

tap.test('summary() - buckets option', t => {
    const summary = new Summary({
        name: 'valid_name',
        description: 'Valid description',
        quantiles: [0.001, 0.01, 0.1, 0.5, 0.9, 0.99, 0.999],
    });

    summary.on('metric', metric => {
        t.equal(metric.name, 'valid_name');
        t.equal(metric.description, 'Valid description');
        t.equal(metric.type, 7);
        t.equal(metric.value, 1);
        t.same(metric.labels, []);
        t.same(metric.meta, {
            quantiles: [0.001, 0.01, 0.1, 0.5, 0.9, 0.99, 0.999],
        });
        t.end();
    });

    summary.observe(1);
});
