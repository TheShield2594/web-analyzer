#!/usr/bin/env node

/**
 * Node.js test script for the diagnostic engine
 */

const fs = require('fs');
const path = require('path');

// Load the diagnostic engine
const DiagnosticEngine = require('./diagnostic-engine.js');

// Load the rules
const rules = JSON.parse(fs.readFileSync(path.join(__dirname, 'diagnostic-rules.json'), 'utf8'));

// Test case 1: DNS Slow Lookup
console.log('=== Test Case 1: DNS Slow Lookup ===');
const signals1 = {
  affected_users: "multiple",
  timing_pattern: "intermittent",
  dns_latency_ms: 420,
  network_latency_ms: 35,
  packet_loss_percent: 0,
  disk_latency_ms: 35,
  cpu_usage_percent: 22,
  load_average: 1.1,
  memory_pressure: false,
  app_specific: true,
  vpn_in_use: true
};

const engine1 = new DiagnosticEngine(rules);
const result1 = engine1.analyze(signals1);
console.log(`Primary Cause: ${result1.primary_cause}`);
console.log(`Confidence: ${result1.confidence_percent}% (${result1.confidence_level})`);
console.log(`Eliminated: ${result1.eliminated_causes.join(', ')}`);
console.log(`Evidence: ${result1.evidence.slice(0, 3).join(', ')}`);
console.log('');

// Test case 2: Network Latency
console.log('=== Test Case 2: Network Latency ===');
const signals2 = {
  affected_users: "everyone",
  timing_pattern: "always",
  dns_latency_ms: 45,
  network_latency_ms: 350,
  packet_loss_percent: 2,
  disk_latency_ms: 8,
  cpu_usage_percent: 18,
  load_average: 0.8,
  memory_pressure: false,
  app_specific: false,
  vpn_in_use: false
};

const engine2 = new DiagnosticEngine(rules);
const result2 = engine2.analyze(signals2);
console.log(`Primary Cause: ${result2.primary_cause}`);
console.log(`Confidence: ${result2.confidence_percent}% (${result2.confidence_level})`);
console.log(`Eliminated: ${result2.eliminated_causes.join(', ')}`);
console.log(`Evidence: ${result2.evidence.slice(0, 3).join(', ')}`);
console.log('');

// Test case 3: Disk I/O Bottleneck
console.log('=== Test Case 3: Disk I/O Bottleneck ===');
const signals3 = {
  affected_users: "multiple",
  timing_pattern: "always",
  dns_latency_ms: 25,
  network_latency_ms: 45,
  packet_loss_percent: 0,
  disk_latency_ms: 85,
  cpu_usage_percent: 22,
  load_average: 1.5,
  memory_pressure: false,
  app_specific: false,
  vpn_in_use: false
};

const engine3 = new DiagnosticEngine(rules);
const result3 = engine3.analyze(signals3);
console.log(`Primary Cause: ${result3.primary_cause}`);
console.log(`Confidence: ${result3.confidence_percent}% (${result3.confidence_level})`);
console.log(`Eliminated: ${result3.eliminated_causes.join(', ')}`);
console.log(`Evidence: ${result3.evidence.slice(0, 3).join(', ')}`);
console.log('');

// Test case 4: CPU Saturation
console.log('=== Test Case 4: CPU Saturation ===');
const signals4 = {
  affected_users: "everyone",
  timing_pattern: "always",
  dns_latency_ms: 30,
  network_latency_ms: 55,
  packet_loss_percent: 0,
  disk_latency_ms: 12,
  cpu_usage_percent: 92,
  load_average: 8.5,
  memory_pressure: false,
  app_specific: false,
  vpn_in_use: false
};

const engine4 = new DiagnosticEngine(rules);
const result4 = engine4.analyze(signals4);
console.log(`Primary Cause: ${result4.primary_cause}`);
console.log(`Confidence: ${result4.confidence_percent}% (${result4.confidence_level})`);
console.log(`Eliminated: ${result4.eliminated_causes.join(', ')}`);
console.log(`Evidence: ${result4.evidence.slice(0, 3).join(', ')}`);
console.log('');

console.log('=== All tests completed ===');
