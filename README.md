# kuzzle-benchmark
Benchmarking tool to measure Kuzzle performance

## Project status

This project is currently under development. We need to add more scenarios and better metrics.

## Starting a benchmark

```sh
$ npm start
```

## Modifying benchmark scenarios

You can modify the benchmark parameters and scenarios by editing `features/benchmark.feature`

This file is written using [gherkin syntax](https://cucumber.io/docs/reference)


The first part of this file sets global benchmark parameters (number of messages to send, number of subscriptions to perform, and so on), and the rest describes the scenarios definitions.

