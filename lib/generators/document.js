'use strict';

const Random = require('random-js');

class DocumentGenerator {
  constructor() {
    this.randomEngine = new Random(Random.engines.nativeMath);
  }

  generate() {
    return {
      _id: this.randomEngine.uuid4(),
      anInteger: this.randomEngine.integer(0, 1000),
      aFloat: this.randomEngine.real(0, 1000, false),
      aBoolean: this.randomEngine.bool(),
      aString: this.randomEngine.string(100),
      geoPoint: {
        lat: this.randomEngine.real(-80, 80),
        lon: this.randomEngine.real(-170, 170)
      },
      aNestedObject: {
        aNestedInteger: this.randomEngine.integer(0, 1000),
        aNestedFloat: this.randomEngine.real(0, 1000, false),
        aNestedBoolean: this.randomEngine.bool(),
        aNestedString: this.randomEngine.string(100)
      }
    };
  }
}

module.exports = DocumentGenerator;
