Feature: Kuzzle Benchmark HTTP Scenarios

  Background:
    Given an index named "benchmark"
    And a collection named "scenarios"
    And an amount of 100000 messages or documents to send, 500 at a time
    And no progress output on the console

  Scenario: HTTP control scenario
    Given 1 http connections
    When I send real-time messages

  Scenario: HTTP connections impact
    Given 100 http connections
    When I send real-time messages
