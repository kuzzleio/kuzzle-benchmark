# kuzzle-benchmark

Benchmarking tool to measure the performances of your Kuzzle server/cluster.

## Gatling Benchmarks

You can use [Gatling](https://gatling.io/) to perform load tests. All the assets used by Gatling are located in the `gatling` directory.

### Quick start

Once you have prepared your environment (see below), you can launch Gatling with the following command

```sh
npm gatling
```

### Prepare the environment for Gatling

Gatling expects a Kuzzle server running on `localhost:7512`, containing a user called `test` with password `test`.
Before running your tests, you should prepare your environment executing, at least

```sh
cd gatling/utils
node create-index-and-collection.js
```

This creates a test index containing a test collection, which are used by most of the scenarios.
Some scenarios will need users created with the `create-users.js` script in the same directory.

### Tests overview

Gatling tests the following routs for protocols HTTP & WebSocket:

- Bulk Import
- Create
- Create Or Replace
- Get
- MCreate
- MCreate Or Replace
- MGet
- Replace
- Update

_NOTE: For all tests, scenarios are ran 2000 times. For example, the "Create" test will create 2000 files, so send 2000 requests._

### Test results

When finished, Gatling will generate statistics about the test.
You can consult it at http://localhost:8000.

Also, you can verify directly on your admin console if the requests launched by the tests provided the expected modifications.

## Realtime benchmarks

Realtime benchmarks consists of a set of clients simultaneously connected to the Kuzzle server running on `localhost:7512`. These clients simply count the number of notifications they receive until the benchmark is stopped (by pressing a key). At the end of the benchmark, the client compare the number of received notifications with the number of expected ones and report the results.

You can start the realtime benchmarks by executing

```sh
npm run realtime
```

_For the moment, all the values are hardcoded._

## [Deprecated] Old Skool benchmarks

```sh
$ npm start
```

## Freezes / "Possible SYN flooding" messages

Due to the benchmarker high frequency nature, it has a tendency to trigger Linux Kernels anti-flood protections.
To bypass this problem, you need to set the `net.core.somaxconn` parameter to a higher value.

For instance: `sudo sysctl -w net.core.somaxconn=8192`

## Modifying benchmark scenarios

You can modify the benchmark parameters and scenarios by editing the `benchmark.config.js` file.
