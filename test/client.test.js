'use strict';

const MetricsClient = require('../lib/client');
const stream = require('readable-stream');
const lolex = require('lolex');

const destObjectStream = done => {
    const arr = [];

    const dStream = new stream.Writable({
        objectMode: true,
        highWaterMark: 0, // 0 buffering to make sure source buffers
        write(chunk, encoding, callback) {
            arr.push(chunk);
            callback();
        },
    });

    dStream.on('finish', () => {
        done(arr);
    });

    return dStream;
};

test('client() - toStringTag outputs correct tagname', () => {
    const client = new MetricsClient();
    expect(client.toString()).toBe('[object Metrics]');
});

test('client.metric() - used to generate and consume a simple counter', () => {
    const client = new MetricsClient();
    const dest = destObjectStream(result => {
        expect(result).toHaveLength(2);
        expect(result[0].name).toBe('valid_name');
    });

    client.pipe(dest);

    client.metric({
        name: 'valid_name',
        description: 'Valid description',
    });

    client.metric({
        name: 'valid_name',
        description: 'Valid description',
    });

    client.destroy();
});

test('client.timer() used to measure a time interval', () => {
    const clock = lolex.install();
    const client = new MetricsClient();
    const dest = destObjectStream(result => {
        expect(result).toHaveLength(1);
        expect(result[0].name).toBe('valid_name');
        expect(result[0].time).toBeGreaterThan(0.2);
    });

    client.pipe(dest);

    const end = client.timer({
        name: 'valid_name',
        description: 'Valid description',
    });

    clock.tick(231);
    end();

    client.destroy();
    clock.uninstall();
});

test('client.timer() metric details set at end of timing', () => {
    const clock = lolex.install();
    const client = new MetricsClient();
    const dest = destObjectStream(result => {
        expect(result).toHaveLength(1);
        expect(result[0].name).toBe('valid_name');
        expect(result[0].time).toBeGreaterThan(0.2);
    });

    client.pipe(dest);

    const end = client.timer();
    clock.tick(231);
    end({
        name: 'valid_name',
        description: 'Valid description',
    });

    client.destroy();
    clock.uninstall();
});

test('client.timer() correct merging between creating and ending timer', () => {
    const client = new MetricsClient();
    const dest = destObjectStream(result => {
        expect(result).toHaveLength(1);
        expect(result[0].name).toBe('testing_meta');
        expect(result[0].description).toBe('meta data testing');
        expect(result[0].meta).toEqual({
            hi: 'paa deg',
            hello: 'universe',
            goodbye: 'porkpie',
        });
    });

    client.pipe(dest);

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
});

test('client.metric() - max buffer is respected', () => {
    const client = new MetricsClient();
    const dest = destObjectStream(result => {
        expect(result).toHaveLength(100);
        expect(client._readableState.buffer).toHaveLength(0);
    });

    client.pipe(dest);

    // Pause the stream and force buffering
    dest.cork();

    for (let i = 0; i < 1000; i++) {
        client.metric({
            name: 'valid_name',
            description: 'Valid description',
        });
    }

    expect(client._readableState.buffer).toHaveLength(100);

    client.destroy();
});

test('client.metric() - max buffer is reached - should emit drop event', () => {
    const dropped = [];
    const client = new MetricsClient();
    client.on('drop', metric => {
        dropped.push(metric);
    });

    const dest = destObjectStream(result => {
        expect(result).toHaveLength(100);
        expect(dropped).toHaveLength(4); // 4 because one off
        expect(client._readableState.buffer).toHaveLength(0);
    });

    client.pipe(dest);

    // Pause the stream and force buffering
    dest.cork();

    for (let i = 0; i < 105; i++) {
        client.metric({
            name: 'valid_name',
            description: 'Valid description',
        });
    }

    expect(client._readableState.buffer).toHaveLength(100);

    client.destroy();
});

test('client.metric() - max buffer preserves latest', () => {
    const client = new MetricsClient({ maxBuffer: 1 });
    const dest = destObjectStream(result => {
        expect(result).toHaveLength(1);
        expect(result[0].name).toBe('fourth');
        expect(client._readableState.buffer).toHaveLength(0);
    });

    client.pipe(dest);

    // Pause the stream and force buffering
    dest.cork();

    client.metric({ name: 'first', description: '.' });
    client.metric({ name: 'second', description: '.' });
    client.metric({ name: 'third', description: '.' });
    client.metric({ name: 'fourth', description: '.' });

    expect(client._readableState.buffer).toHaveLength(1);

    client.destroy();
});

test('client.pipe() - combining metrics streams', () => {
    const clientA = new MetricsClient();
    const clientB = new MetricsClient();

    const dest = destObjectStream(results => {
        expect(results).toHaveLength(3);
        expect(results[0].name).toBe('first');
        expect(results[2].name).toBe('third');
        expect(clientA._readableState.buffer).toHaveLength(0);
        expect(clientB._readableState.buffer).toHaveLength(0);
    });

    clientA.pipe(clientB).pipe(dest);

    clientA.metric({ name: 'first', description: '.' });
    clientA.metric({ name: 'second', description: '.' });
    clientB.metric({ name: 'third', description: '.' });

    clientA.end();
});

test('client.pipe() - 2 - 1 stream piping with delay', () => {
    const clock = lolex.install();
    const clientA = new MetricsClient();
    const clientB = new MetricsClient();
    const clientC = new MetricsClient();

    const dest = destObjectStream(results => {
        expect(results).toHaveLength(6);
    });

    clientA.pipe(clientC);
    clientB.pipe(clientC);

    clientC.pipe(dest);

    clientA.metric({ name: 'first', description: '.' });
    clientA.metric({ name: 'second', description: '.' });
    clientB.metric({ name: 'third', description: '.' });
    clientB.metric({ name: 'fourth', description: '.' });

    clock.tick(1000);

    clientA.metric({ name: 'fifth', description: '.' });
    clientA.metric({ name: 'sixth', description: '.' });

    clientA.end();
    clientB.end();

    expect(clientA._readableState.buffer).toHaveLength(0);
    expect(clientB._readableState.buffer).toHaveLength(0);

    clock.uninstall();
});
