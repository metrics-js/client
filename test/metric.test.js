'use strict';

const Metric = require('../lib/metric');
const util = require('util');

test('optional values return null when not provided', () => {
    expect.hasAssertions();
    const metric = new Metric({
        name: 'valid_name',
        description: 'Valid description',
        timestamp: 12345,
    });
    expect(metric.value).toBeNull();
    expect(metric.time).toBeNull();
    expect(metric.meta).toEqual({});
});

test('stringifying includes all keys', () => {
    expect.hasAssertions();
    const metric = new Metric({
        name: 'valid_name',
        description: 'Valid description',
        timestamp: 12345,
    });
    expect(metric).toMatchSnapshot();
});

test('omitting required keys results in undefined instead of null', () => {
    expect.hasAssertions();
    const metric = new Metric({
        name: 'valid_name',
    });
    expect(metric).toMatchSnapshot();
});

test('util.inspect includes all keys', () => {
    expect.hasAssertions();
    const metric = new Metric({
        name: 'valid_name',
        description: 'Valid description',
        timestamp: 12345,
        time: 12345,
        value: 123,
        meta: { key: 'value' },
    });
    expect(util.inspect(metric)).toMatchSnapshot();
});

test('toStringTag includes Metric in name', () => {
    expect.hasAssertions();
    const metric = new Metric({
        name: 'valid_name',
        description: 'Valid description',
        timestamp: 12345,
    });
    expect(`${metric}`).toBe(`Metric ${JSON.stringify(metric)}`);
});

test('toString outputs a full stringified object', () => {
    expect.hasAssertions();
    const metric = new Metric({
        name: 'valid_name',
        description: 'Valid description',
        timestamp: 12345,
    });
    expect(metric.toString()).toBe('[object Metric]');
});

test('parseInt on metric instance outputs null', () => {
    expect.hasAssertions();
    const metric = new Metric({
        name: 'valid_name',
        description: 'Valid description',
        timestamp: 12345,
    });
    expect(() => metric + 1).toThrowErrorMatchingSnapshot();
});
