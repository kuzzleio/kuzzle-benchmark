var Random = require('random-js');

module.exports = function () {
  this.World = function () {
    /*
     The following parameters can be changed to modify benchmark behavior
     */
    this.kuzzleUrl = 'kuzzle';

    // Via Proxy:
    //this.kuzzleHttpUrl = 'http://kuzzle:7511/api/1.0/';

    // Direct:
    this.kuzzleHttpUrl = 'http://kuzzle:7510/api/1.0/';

    // Number of messages/documents to send (per scenario)
    this.messagesCount = 100000;

    // Number of messages to send to kuzzle in a single packet
    this.packetSize = 500;

    // Number of subscriptions to make for subscriptions stress scenarios
    this.subscriptionsCount = 10000;

    // Regularly outputs the progress of a scenario on the console
    this.consoleOutputProgress = false;

    /*
     Benchmark templates
     */
    this.generateDocument = () => ({
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
    });

    this.generateSimpleFilter = name => {
      var
        fields = ['_id', 'anInteger', 'aFloat', 'aBoolean', 'aString',
          'aNestedObject.aNestedInteger', 'aNestedObject.aNestedFloat', 'aNestedObject.aNestedBoolean',
          'aNestedObject.aNestedString'],
        randomField = fields[this.randomEngine.integer(0, fields.length - 1)],
        tmp,
        points;

      switch (name) {
        case 'exists':
          return {
            exists: {
              field: this.randomEngine.bool() ? randomField : this.randomEngine.string(10)
            }
          };
        case 'ids':
          return {
            ids: {
              values: [this.randomEngine.uuid4(), this.randomEngine.uuid4(), this.randomEngine.uuid4()]
            }
          };
        case 'missing':
          return {
            missing: {
              field: this.randomEngine.bool() ? randomField : this.randomEngine.string(10)
            }
          };
        case 'range':
          return {
            range: {
              [this.randomEngine.bool() ? 'anInteger' : 'aNestedObject.aNestedInteger']: {
                [this.randomEngine.bool() ? 'lt' : 'lte']: this.randomEngine.integer(501, 1000),
                [this.randomEngine.bool() ? 'gt' : 'gte']: this.randomEngine.integer(0, 500)
              }
            }
          };
        case 'regexp':
          return {
            regexp: {
              [randomField]: {
                value: this.randomEngine.string(10),
                flags: 'i'
              }
            }
          };
        case 'equals':
          return {
            equals: {
              [this.randomEngine.bool() ? 'aString' : 'aNestedObject.aNestedString']: this.randomEngine.string(100)
            }
          };
        case 'in':
          return {
            in: {
              [this.randomEngine.bool() ? 'aString' : 'aNestedObject.aNestedString']: [
                this.randomEngine.string(100),
                this.randomEngine.string(100),
                this.randomEngine.string(100)
              ]
            }
          };
        case 'geoBoundingBox':
          tmp = {
            geoBoundingBox: {
              geoPoint: {
                top: this.randomEngine.real(-80, 80),
                left: this.randomEngine.real(-170, 170)
              }
            }
          };

          tmp.geoBoundingBox.geoPoint.bottom = tmp.geoBoundingBox.geoPoint.top - this.randomEngine.real(0.1, 8);
          tmp.geoBoundingBox.geoPoint.right = tmp.geoBoundingBox.geoPoint.left + this.randomEngine.real(0.1, 8);
          return tmp;
        case 'geoDistance':
          return {
            geoDistance: {
              geoPoint: {
                lat: this.randomEngine.real(-80, 80),
                lon: this.randomEngine.real(-170, 170)
              },
              distance: this.randomEngine.integer(10000, 100000) + 'm'
            }
          };
        case 'geoDistanceRange':
          return {
            geoDistanceRange: {
              geoPoint: {
                lat: this.randomEngine.real(-80, 80),
                lon: this.randomEngine.real(-170, 170)
              },
              from: this.randomEngine.integer(1, 50) + 'km',
              to: this.randomEngine.integer(51, 100) + 'km'
            }
          };
        case 'geoPolygon':
          tmp = {lat: this.randomEngine.real(-80, 80), lon: this.randomEngine.real(-170, 170)};
          points = [tmp];

          points.push({lat: tmp.lat + this.randomEngine.real(0.1, 8), lon: tmp.lon + this.randomEngine.real(0.1, 8)});
          points.push({lat: tmp.lat - this.randomEngine.real(0.1, 8), lon: tmp.lon - this.randomEngine.real(0.1, 8)});

          return {
            geoPolygon: {
              geoPoint: {
                points
              }
            }
          };
        case 'whole collection':
          return {};
        case 'and':
          return {
            and: [
              this.generateSimpleFilter('equals'),
              this.generateSimpleFilter('equals'),
              this.generateSimpleFilter('equals')
            ]
          };
        case 'bool':
          return {
            bool: {
              must: [
                this.generateSimpleFilter('equals')
              ],
              must_not: [
                this.generateSimpleFilter('missing')
              ],
              should: [
                this.generateSimpleFilter('exists')
              ]
            }
          };
        case 'or':
          return {
            or: [
              this.generateSimpleFilter('equals'),
              this.generateSimpleFilter('equals'),
              this.generateSimpleFilter('equals')
            ]
          };
        case 'not exists':
          return {
            not: this.generateSimpleFilter('exists')
          };
        case 'not ids':
          return {
            not: this.generateSimpleFilter('ids')
          };
        case 'not missing':
          return {
            not: this.generateSimpleFilter('missing')
          };
        case 'not range':
          return {
            not: this.generateSimpleFilter('range')
          };
        case 'not regexp':
          return {
            not: this.generateSimpleFilter('regexp')
          };
        case 'not equals':
          return {
            not: this.generateSimpleFilter('equals')
          };
        case 'not in':
          return {
            not: this.generateSimpleFilter('in')
          };
        case 'not geoBoundingBox':
          return {
            not: this.generateSimpleFilter('geoBoundingBox')
          };
        case 'not geoDistance':
          return {
            not: this.generateSimpleFilter('geoDistance')
          };
        case 'not geoDistanceRange':
          return {
            not: this.generateSimpleFilter('geoDistanceRange')
          };
        case 'not geoPolygon':
          return {
            not: this.generateSimpleFilter('geoPolygon')
          };
      }
    };

    this.generateComplexFilter = () => {
      var
        fields = ['_id', 'anInteger', 'aFloat', 'aBoolean', 'aString',
          'aNestedObject.aNestedInteger', 'aNestedObject.aNestedFloat', 'aNestedObject.aNestedBoolean',
          'aNestedObject.aNestedString'],
        randomField = fields[this.randomEngine.integer(0, fields.length - 1)];

      return {
        'and': [
          {
            ids: {
              values: [this.randomEngine.uuid4(), this.randomEngine.uuid4(), this.randomEngine.uuid4()]
            }
          },
          /*
          {
            not: {
              range: {
                [this.randomEngine.bool() ? 'aFloat' : 'aNestedObject.aNestedFloat']: {
                  [this.randomEngine.bool() ? 'gt' : 'gte']: this.randomEngine.integer(0, 500),
                  [this.randomEngine.bool() ? 'lt' : 'lte']: this.randomEngine.integer(501, 1000)
                }
              }
            }
          },*/
          /*{
            regexp: {
              [randomField]: {
                value: 'foo\w+',
                flags: 'i'
              }
            }
          },*/
          {
            in: {
              [this.randomEngine.bool() ? 'aString' : 'aNestedObject.aNestedString']: [
                this.randomEngine.string(100)
              ]
            }
          },
          {
            geoPolygon: {
              geoPoints: {
                points: [
                  {lat: this.randomEngine.real(-90, 90), lon: this.randomEngine.real(-90, 90)},
                  {lat: this.randomEngine.real(-90, 90), lon: this.randomEngine.real(-90, 90)},
                  {lat: this.randomEngine.real(-90, 90), lon: this.randomEngine.real(-90, 90)},
                  {lat: this.randomEngine.real(-90, 90), lon: this.randomEngine.real(-90, 90)},
                  {lat: this.randomEngine.real(-90, 90), lon: this.randomEngine.real(-90, 90)},
                  {lat: this.randomEngine.real(-90, 90), lon: this.randomEngine.real(-90, 90)}
                ]
              }
            }
          },
          {
            exists: {
              field: this.randomEngine.bool() ? randomField : this.randomEngine.string(10)
            }
          }
        ]
      };
    };

    /*
     Internal benchmark variables
     */
    this.randomEngine = new Random(Random.engines.nativeMath);
    this.senderConnections = [];
    this.subscribeConnections = [];
    this.index = null;
    this.collection = null;
  };
};
