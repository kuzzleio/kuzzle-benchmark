'use strict';

const
  moment = require('moment'),
  path = require('path'),
  fs = require('fs');

/**
 * Reports and stores step results
 * @class
 * @throws
 * @param {BenchmarkConfiguration} config
 */
class Reporter {
  constructor(config) {
    this.directory = config.benchmark.resultDirectory + path.sep + moment().format('YYYYMMDDHHmmSS');
    this.stream = null;
    this.stepno = 0;

    fs.mkdirSync(this.directory, 0o755);
    dumpScenarioConfiguration(config, this.directory);
  }

  /**
   * Creates a CSV file for a step definition
   * @param {AbstractStep} step
   */
  create(step) {
    if (this.stream) {
      this.close();
    }

    this.stepno++;

    const stepPrefix = '00' + this.stepno;

    this.stream = fs.createWriteStream(
      this.directory + path.sep + stepPrefix.slice(stepPrefix.length - 3) + '.' + step.name + '.csv',
      {mode: 0o644}
    );
  }

  /**
   * Writes an array of scalar values as a CSV line.
   * The values should match the headers provided during the
   * stream creation process (see create)
   *
   * @param {Array} values
   */
  write(values) {
    this.stream.cork();

    values.forEach((v, i) => {
      this.stream.write(typeof v === 'string' ? v : JSON.stringify(v));

      if (i < (values.length - 1)) {
        this.stream.write(';');
      }
    });

    this.stream.write('\r\n');
    this.stream.uncork();
  }

  /**
   * Closes the current report step
   */
  close() {
    if (this.stream) {
      this.stream.end();
      this.stream = null;
    }
  }
}

/**
 * Dumps the benchmark configuration in a JSON file
 * @param {BenchmarkConfiguration} config
 * @param {string} directory
 * @throws
 */
function dumpScenarioConfiguration(config, directory) {
  fs.writeFileSync(
    directory + path.sep + 'scenario.json',
    JSON.stringify(config, undefined, '\t'),
    {
      encoding: 'utf8',
      mode: 0o644,
      flag: 'w'
    }
  );
}


module.exports = Reporter;
