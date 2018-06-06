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
    this.fd = null;
    this.bytes = 0;
    this.config = config;
  }

  open(callback) {
    try {
      fs.mkdirSync(this.config.benchmark.resultDirectory, 0o755);
    } catch (err) {
      if (err.code !== 'EEXIST') {
        console.error(err);
        process.exit(1);
      }
    }

    const fn = this.config.benchmark.resultDirectory + path.sep + moment().format('YYYYMMDDHHmmSS') + '.json';
    try {
      this.fd = fs.openSync(fn, 'w', 0o644);
    } catch(err) {
      console.error(err);
      process.exit(1);
    }

    this.append('config', this.config, callback);
  }

  /**
   * Add new data to the report file.
   * We make sure the JSON file is valid
   * at the end of each addition, meaning we
   * need to go back 1 byte to overwrite the JSON-ending brace
   * @param  {String} key
   * @param  {*} content
   * @param  {Function} callback
   */
  append(key, content, callback) {
    const start = Math.max(0, this.bytes - 1);
    let data = `${start === 0 ? '{' : ','}"${key}":${JSON.stringify(content)}}`;

    fs.write(this.fd, data, start, 'utf8', (err, written) => {
      this.bytes = start + written;
      callback(err);
    });
  }

  /**
   * Closes the current report step
   */
  close() {
    if (this.fd) {
      fs.closeSync(this.fd);
      this.fd = null;
    }
  }
}

module.exports = Reporter;
