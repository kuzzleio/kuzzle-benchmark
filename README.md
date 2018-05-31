# kuzzle-benchmark
Benchmarking tool to measure Kuzzle performance

## Project status

This project is currently under development. We need to add more scenarios and better metrics.

## Starting a benchmark

```sh
$ npm start
```

## Freezes / "Possible SYN flooding" messages

Due to the benchmarker high frequency nature, it has a tendency to trigger Linux Kernels anti-flood protections.
To bypass this problem, you need to set the `net.core.somaxconn` parameter to a higher value.

For instance: `sudo sysctl -w net.core.somaxconn=2048`

## Modifying benchmark scenarios

You can modify the benchmark parameters and scenarios by editing `features/benchmark.feature`

This file is written using [gherkin syntax](https://cucumber.io/docs/reference)


The first part of this file sets global benchmark parameters (number of messages to send, number of subscriptions to perform, and so on), and the rest describes the scenarios definitions.

