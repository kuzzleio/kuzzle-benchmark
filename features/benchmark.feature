Feature: Kuzzle Benchmark Scenarios
  Background:
    Given an index named "benchmark" and a collection named "scenarios"
    Given an amount of 100000 messages or documents to send, 500 at a time
    Given an amount of 10000 subscriptions to perform

  Scenario: Real-time control scenario
    Given 1 sender connections
    When I send real-time messages

  Scenario: Subscription impact: "exists" filter
    Given 1 sender connections
    Given 1 subscribe connections
    When I make subscriptions with a simple "exists" filter
    And I send real-time messages
