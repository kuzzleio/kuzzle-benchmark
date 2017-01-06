/**
 * Abstract class used to define a benchmark scenario step.
 * @class
 */
class AbstractStep {
  /**
   *
   * @param {Reporter} reporter
   * @param {BenchmarkBuffer} buffer
   * @param {BenchmarkConfiguration} config
   * @param {string} name of the step
   * @param {string} description of the step
   */
  constructor (reporter, buffer, config, name, description) {
    this.reporter = reporter;
    this.buffer = buffer;
    this.config = config;
    this.name = name;
    this.description = description;
    this.stdout = !config.benchmark.silent;

    this.reporter.create(this);
  }

  /**
   * Launches this benchmark step
   * @param {function} callback
   */
  run(callback) {
    callback(new Error('Step not implemented'));
  }
}

module.exports = AbstractStep;
