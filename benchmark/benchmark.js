"use strict";

const benchmark = require("benchmark");
const Metric = require("@metrics/metric");

const suite = new benchmark.Suite();

const add = (name, fn) => {
	suite.add(name, fn);
};

/**
 * new Metric();
 */

const now = Date.now();

add("new Metric()", () => {
	// eslint-disable-next-line no-unused-vars
	const m = new Metric({
		name: "foo",
		description: "foobar",
		timestamp: now,
	});
});

suite
	.on("cycle", (ev) => {
		console.log(ev.target.toString());
		if (ev.target.error) {
			console.error(ev.target.error);
		}
	})
	.run();
