Feature: Kuzzle Benchmark Scenarios

  Background:
    Given an index named "benchmark"
    And a collection named "scenarios"
    And an amount of 100000 messages or documents to send, 500 at a time
    And an amount of 10000 subscriptions to perform

  Scenario: Real-time control scenario
    Given 100 sender connections
    When I send real-time messages
