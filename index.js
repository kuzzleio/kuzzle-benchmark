'use strict';

const
  config = require('rc')('benchmark', require('./default.config')),
  BenchmarkBuffer = require('./lib/core/buffer'),
  Steps = require('./lib/steps');

// Benchmark initialization
const buffer = new BenchmarkBuffer(config, err => {
  if (err) {
    console.error(err);
    process.exit(1);
  }

  const steps = new Steps(buffer, config);

  steps.start(() => {
    buffer.free();
    process.exit(0);
  });
});

