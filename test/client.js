"use strict";

const stream = require("readable-stream");
const fakeTimers = require("@sinonjs/fake-timers");
const tap = require("tap");
const MetricsClient = require("../lib/client");

const destObjectStream = (done) => {
	const arr = [];

	const dStream = new stream.Writable({
		objectMode: true,
		write(chunk, encoding, callback) {
			arr.push(chunk);
			callback();
		},
	});

	dStream.on("finish", () => {
		done(arr);
	});

	return dStream;
};

tap.test("client() - object type - should be MetricsClient", (t) => {
	const client = new MetricsClient();
	t.equal(Object.prototype.toString.call(client), "[object MetricsClient]");
	t.end();
});

tap.test('client() - no "id" argument given - should set a hash on .id', (t) => {
	const client = new MetricsClient();
	t.ok(client.id);
	t.end();
});

tap.test('client() - "id" argument given - should set value on .id', (t) => {
	const client = new MetricsClient({ id: "foo" });
	t.equal(client.id, "foo");
	t.end();
});

tap.test("client.metric() - used to generate and consume a simple counter", (t) => {
	const client = new MetricsClient();
	const dest = destObjectStream((result) => {
		t.equal(result.length, 2);
		t.equal(result[0].name, "valid_name");
		t.end();
	});

	client.pipe(dest);

	client.metric({
		name: "valid_name",
		description: "Valid description",
	});

	client.metric({
		name: "valid_name",
		description: "Valid description",
	});

	setImmediate(() => {
		dest.end();
	});
});

tap.test("client.timer() used to measure a time interval", (t) => {
	const clock = fakeTimers.install();

	const client = new MetricsClient();
	const dest = destObjectStream((result) => {
		t.equal(result.length, 1);
		t.equal(result[0].name, "valid_name");
		t.ok(result[0].value > 0.2 && result[0].value < 0.3);
		t.end();
	});

	client.pipe(dest);

	const end = client.timer({
		name: "valid_name",
		description: "Valid description",
	});

	clock.tick(231);

	end();

	clock.uninstall();

	setImmediate(() => {
		dest.end();
	});
});

tap.test("client.timer() metric details set at end of timing", (t) => {
	const clock = fakeTimers.install();

	const client = new MetricsClient();
	const dest = destObjectStream((result) => {
		t.equal(result.length, 1);
		t.equal(result[0].name, "valid_name");
		t.ok(result[0].value > 0.2 && result[0].value < 0.3);
		t.end();
	});

	client.pipe(dest);

	const end = client.timer();

	clock.tick(231);

	end({
		name: "valid_name",
		description: "Valid description",
	});

	clock.uninstall();

	setImmediate(() => {
		dest.end();
	});
});

tap.test("client.timer() correct merging between creating and ending timer", (t) => {
	const client = new MetricsClient();
	const dest = destObjectStream((result) => {
		t.equal(result.length, 1);
		t.equal(result[0].name, "testing_meta");
		t.equal(result[0].description, "meta data testing");
		t.same(result[0].meta, {
			hi: "paa deg",
			hello: "universe",
			goodbye: "porkpie",
		});
		t.end();
	});

	client.pipe(dest);

	const end = client.timer({
		name: "testing_meta",
		meta: { hello: "world", hi: "paa deg" },
	});

	end({
		description: "meta data testing",
		meta: {
			hello: "universe",
			goodbye: "porkpie",
		},
	});

	setImmediate(() => {
		dest.end();
	});
});

tap.test("client.metric() - metrics is not piped anywhere - should not fill stream buffer", (t) => {
	const client = new MetricsClient();

	for (let i = 0; i < 20; i += 1) {
		client.metric({
			name: "valid_name",
			description: "Valid description",
		});
	}

	t.equal(client._readableState.buffer.length, 0);
	t.end();
});

tap.test("client.metric() - destination is buffering - should emit drop events", (t) => {
	const dropped = [];
	const client = new MetricsClient();
	client.on("drop", (metric) => {
		dropped.push(metric);
	});

	const dest = destObjectStream((result) => {
		t.equal(result.length, 16);
		t.equal(dropped.length, 4);

		t.equal(client._readableState.buffer.length, 0);
		t.end();
	});

	client.pipe(dest);

	// Pause the stream and force buffering
	// in the destination stream
	dest.cork();

	for (let i = 0; i < 20; i += 1) {
		client.metric({
			name: "valid_name",
			description: "Valid description",
		});
	}

	t.equal(client._readableState.buffer.length, 0);

	setImmediate(() => {
		dest.end();
	});
});

tap.test("client.pipe() - pipe streams into each other - should pipe metrics through", (t) => {
	const clientA = new MetricsClient();
	const clientB = new MetricsClient();

	const dest = destObjectStream((result) => {
		t.equal(result.length, 3);
		t.equal(result[0].name, "first");
		t.equal(result[2].name, "third");

		t.equal(clientA._readableState.buffer.length, 0);

		t.equal(clientB._readableState.buffer.length, 0);
		t.end();
	});

	clientA.pipe(clientB).pipe(dest);

	clientA.metric({ name: "first", description: "." });
	clientA.metric({ name: "second", description: "." });
	clientB.metric({ name: "third", description: "." });

	setImmediate(() => {
		dest.end();
	});
});

tap.test("client.pipe() - pipe two streams into one - should pipe metrics through", (t) => {
	const clientA = new MetricsClient();
	const clientB = new MetricsClient();
	const clientC = new MetricsClient();

	const dest = destObjectStream((result) => {
		t.equal(result.length, 6);
		t.end();
	});

	clientA.pipe(clientC);
	clientB.pipe(clientC);

	clientC.pipe(dest);

	clientA.metric({ name: "first", description: "." });
	clientA.metric({ name: "second", description: "." });
	clientB.metric({ name: "third", description: "." });
	clientB.metric({ name: "fourth", description: "." });
	clientA.metric({ name: "fifth", description: "." });
	clientA.metric({ name: "sixth", description: "." });

	setImmediate(() => {
		dest.end();
	});
});

tap.test("client.pipe() - circular pipe - should pipe metrics through", (t) => {
	const clientA = new MetricsClient();
	const clientB = new MetricsClient();
	const clientC = new MetricsClient();

	const result = [];

	clientA.on("drop", (metric) => {
		result.push(metric);
	});

	clientB.on("drop", (metric) => {
		result.push(metric);
	});

	clientC.on("drop", (metric) => {
		result.push(metric);
	});

	clientA.on("finish", () => {
		t.equal(result[0].name, "a");
		t.equal(result[1].name, "b");
		t.equal(result[2].name, "c");
		t.end();
	});

	clientA.pipe(clientB).pipe(clientC).pipe(clientA);

	clientA.metric({ name: "a", description: "." });
	clientB.metric({ name: "b", description: "." });
	clientC.metric({ name: "c", description: "." });

	setImmediate(() => {
		clientA.end();
	});
});

tap.test('client.metric() - "id" on constructor should be set as source on Metric object', (t) => {
	const client = new MetricsClient({ id: "foo" });
	const dest = destObjectStream((result) => {
		t.equal(result.length, 2);
		t.equal(result[0].source, "foo");
		t.equal(result[1].source, "foo");
		t.end();
	});

	client.pipe(dest);

	client.metric({
		name: "valid_name",
		description: "Valid description",
	});

	client.metric({
		name: "valid_name",
		description: "Valid description",
	});

	setImmediate(() => {
		dest.end();
	});
});

tap.test("client.counter() - class instance used to generate and consume a simple counter", (t) => {
	const client = new MetricsClient();
	const counter = client.counter({
		name: "valid_name",
		description: "Valid description",
	});
	const dest = destObjectStream((result) => {
		t.equal(result.length, 2);
		t.equal(result[0].name, "valid_name");
		t.end();
	});

	client.pipe(dest);

	counter.inc();
	counter.inc();

	setImmediate(() => {
		dest.end();
	});
});

tap.test("client.gauge() - class instance used to generate and consume a simple gauge", (t) => {
	const client = new MetricsClient();
	const gauge = client.gauge({
		name: "valid_name",
		description: "Valid description",
	});
	const dest = destObjectStream((result) => {
		t.equal(result.length, 2);
		t.equal(result[0].name, "valid_name");
		t.equal(result[0].value, 20);
		t.equal(result[1].value, 14);
		t.end();
	});

	client.pipe(dest);

	gauge.set(20);
	gauge.set(14);

	setImmediate(() => {
		dest.end();
	});
});

tap.test(
	"client.pipe() - exceed the default, 10, number of max event listeners - should not cause the process to emit a MaxListenersExceededWarning",
	(t) => {
		const clientA = new MetricsClient();
		const clientB = new MetricsClient();
		const clientC = new MetricsClient();
		const clientD = new MetricsClient();
		const clientE = new MetricsClient();
		const clientF = new MetricsClient();
		const clientG = new MetricsClient();
		const clientH = new MetricsClient();
		const clientI = new MetricsClient();
		const clientJ = new MetricsClient();
		const clientK = new MetricsClient();
		const clientL = new MetricsClient();
		const clientM = new MetricsClient();
		const clientN = new MetricsClient();

		const clientX = new MetricsClient();

		process.on("warning", (warning) => {
			if (warning.name === "MaxListenersExceededWarning") {
				t.fail();
			}
		});

		const dest = destObjectStream((result) => {
			t.equal(result.length, 14);
			t.end();
		});

		clientA.on("error", (error) => {
			console.log("a error", error);
		});
		clientB.on("error", (error) => {
			console.log("b error", error);
		});
		clientC.on("error", (error) => {
			console.log("c error", error);
		});
		clientD.on("error", (error) => {
			console.log("d error", error);
		});
		clientE.on("error", (error) => {
			console.log("e error", error);
		});
		clientF.on("error", (error) => {
			console.log("f error", error);
		});
		clientG.on("error", (error) => {
			console.log("g error", error);
		});
		clientH.on("error", (error) => {
			console.log("h error", error);
		});
		clientI.on("error", (error) => {
			console.log("i error", error);
		});
		clientJ.on("error", (error) => {
			console.log("j error", error);
		});
		clientK.on("error", (error) => {
			console.log("k error", error);
		});
		clientL.on("error", (error) => {
			console.log("l error", error);
		});
		clientM.on("error", (error) => {
			console.log("m error", error);
		});
		clientN.on("error", (error) => {
			console.log("n error", error);
		});
		clientX.on("error", (error) => {
			console.log("x error", error);
		});

		clientA.pipe(clientX);
		clientB.pipe(clientX);
		clientC.pipe(clientX);
		clientD.pipe(clientX);
		clientE.pipe(clientX);
		clientF.pipe(clientX);
		clientG.pipe(clientH).pipe(clientI).pipe(clientJ).pipe(clientX);
		clientK.pipe(clientX);
		clientL.pipe(clientM).pipe(clientX);
		clientN.pipe(clientX);

		clientX.pipe(dest);

		clientA.metric({ name: "a_test", description: "." });
		clientB.metric({ name: "b_test", description: "." });
		clientC.metric({ name: "c_test", description: "." });
		clientD.metric({ name: "d_test", description: "." });
		clientE.metric({ name: "e_test", description: "." });
		clientF.metric({ name: "f_test", description: "." });
		clientG.metric({ name: "g_test", description: "." });
		clientH.metric({ name: "h_test", description: "." });
		clientI.metric({ name: "i_test", description: "." });
		clientJ.metric({ name: "j_test", description: "." });
		clientK.metric({ name: "k_test", description: "." });
		clientL.metric({ name: "l_test", description: "." });
		clientM.metric({ name: "m_test", description: "." });
		clientN.metric({ name: "n_test", description: "." });

		setImmediate(() => {
			dest.end();
		});
	},
);
