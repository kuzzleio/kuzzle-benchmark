# kuzzle-benchmark
Benchmarking tool to measure Kuzzle performance

## Starting a benchmark

```sh
$ npm start
```

## Freezes / "Possible SYN flooding" messages

Due to the benchmarker high frequency nature, it has a tendency to trigger Linux Kernels anti-flood protections.
To bypass this problem, you need to set the `net.core.somaxconn` parameter to a higher value.

For instance: `sudo sysctl -w net.core.somaxconn=8192`

## Modifying benchmark scenarios

You can modify the benchmark parameters and scenarios by editing the `benchmark.config.js` file.

