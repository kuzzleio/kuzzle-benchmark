Feature: Kuzzle Benchmark Scenarios

  Background:
    Given an index named "benchmark"
      And a collection named "scenarios"
      And an amount of 100000 messages or documents to send, 500 at a time
      And an amount of 10000 subscriptions to perform
      And no progress output on the console

  Scenario: Real-time control scenario
    Given 1 sender connections
    When I send real-time messages

  Scenario Outline: Subscription impact: DSL keywords
    Given 1 sender connections
      And 1 subscribe connections
    When I make subscriptions with a simple "<keyword>" filter
      And I send real-time messages

    Examples:
      | keyword              |
      | whole collection     |
      | missing              |
      | exists               |
      | ids                  |
      | range                |
      | regexp               |
      | term                 |
      | terms                |
      | geoBoundingBox       |
      | geoDistance          |
      | geoDistanceRange     |
      | geoPolygon           |
      | and                  |
      | bool                 |
      | or                   |
      | not exists           |
      | not ids              |
      | not missing          |
      | not range            |
      | not regexp           |
      | not term             |
      | not terms            |
      | not geoBoundingBox   |
      | not geoDistance      |
      | not geoDistanceRange |
      | not geoPolygon       |

