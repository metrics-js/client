'use strict';

const MetricsClient = require('../lib/client');
const getStream = require('get-stream');
const lolex = require('lolex');

test('.metric() toStringTag outputs correct tagname', () => {
    expect.hasAssertions();
    const client = new MetricsClient();

    expect(client.toString()).toBe('[object Metrics]');
});

test('.metric() used to generate and consume a simple counter', async () => {
    expect.hasAssertions();
    const client = new MetricsClient();

    client.metric({
        name: 'valid_name',
        description: 'Valid description',
    });

    client.metric({
        name: 'valid_name',
        description: 'Valid description',
    });

    client.destroy();

    const result = await getStream.array(client);
    expect(result).toHaveLength(2);
    expect(result[0].name).toBe('valid_name');
});

test('.timer() used to measure a time interval', async () => {
    expect.hasAssertions();

    const clock = lolex.install();
    const client = new MetricsClient();

    const end = client.timer({
        name: 'valid_name',
        description: 'Valid description',
    });

    clock.tick(231);
    end();

    client.destroy();

    const result = await getStream.array(client);
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('valid_name');
    expect(result[0].time).toBeGreaterThan(0.2);

    clock.uninstall();
});

test('.timer() metric details set at end of timing', async () => {
    expect.hasAssertions();

    const clock = lolex.install();
    const client = new MetricsClient();

    const end = client.timer();
    clock.tick(231);
    end({
        name: 'valid_name',
        description: 'Valid description',
    });

    client.destroy();

    const result = await getStream.array(client);
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('valid_name');
    expect(result[0].time).toBeGreaterThan(0.2);

    clock.uninstall();
});

test('.timer() correct merging between creating and ending timer', async () => {
    expect.hasAssertions();
    const client = new MetricsClient();

    const end = client.timer({
        name: 'testing_meta',
        meta: { hello: 'world', hi: 'paa deg' },
    });
    end({
        description: 'meta data testing',
        meta: {
            hello: 'universe',
            goodbye: 'porkpie',
        },
    });

    client.destroy();

    const result = await getStream.array(client);
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('testing_meta');
    expect(result[0].description).toBe('meta data testing');
    expect(result[0].meta).toEqual({
        hi: 'paa deg',
        hello: 'universe',
        goodbye: 'porkpie',
    });
});

test('max buffer is respected', async () => {
    expect.hasAssertions();
    const client = new MetricsClient();

    for (let i = 0; i < 1000; i++) {
        client.metric({
            name: 'valid_name',
            description: 'Valid description',
        });
    }

    expect(client._readableState.buffer).toHaveLength(100);

    client.destroy();

    const result = await getStream.array(client);
    expect(result).toHaveLength(100);
    expect(client._readableState.buffer).toHaveLength(0);
});

test('max buffer preserves latest', async () => {
    expect.hasAssertions();
    const client = new MetricsClient({ maxBuffer: 1 });

    client.metric({ name: 'first', description: '.' });
    client.metric({ name: 'second', description: '.' });
    client.metric({ name: 'third', description: '.' });
    client.metric({ name: 'fourth', description: '.' });

    expect(client._readableState.buffer).toHaveLength(1);

    client.destroy();

    const result = await getStream.array(client);
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('fourth');
    expect(client._readableState.buffer).toHaveLength(0);
});

test('combining metrics streams', async () => {
    expect.hasAssertions();
    const clientA = new MetricsClient();
    const clientB = new MetricsClient();

    clientA.pipe(clientB);

    clientA.metric({ name: 'first', description: '.' });
    clientA.metric({ name: 'second', description: '.' });
    clientB.metric({ name: 'third', description: '.' });

    clientA.end();

    const results = await getStream.array(clientB);
    expect(results).toHaveLength(3);
    expect(results[0].name).toBe('first');
    expect(results[2].name).toBe('third');
    expect(clientA._readableState.buffer).toHaveLength(0);
    expect(clientB._readableState.buffer).toHaveLength(0);
});

test('2 - 1 stream piping with delay', async () => {
    expect.hasAssertions();

    const clock = lolex.install();
    const clientA = new MetricsClient();
    const clientB = new MetricsClient();
    const clientC = new MetricsClient();

    clientA.pipe(clientC);
    clientB.pipe(clientC);

    clientA.metric({ name: 'first', description: '.' });
    clientA.metric({ name: 'second', description: '.' });
    clientB.metric({ name: 'third', description: '.' });
    clientB.metric({ name: 'fourth', description: '.' });

    clock.tick(1000);

    clientA.metric({ name: 'fifth', description: '.' });
    clientA.metric({ name: 'sixth', description: '.' });

    clientA.end();
    clientB.end();

    const results = await getStream.array(clientC);
    expect(results).toHaveLength(6);
    expect(clientA._readableState.buffer).toHaveLength(0);
    expect(clientB._readableState.buffer).toHaveLength(0);

    clock.uninstall();
});
