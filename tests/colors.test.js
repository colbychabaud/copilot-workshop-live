import assert from 'node:assert/strict';
import test from 'node:test';

import { colorPriority, colorStatus } from '../src/utils/colors.js';

test('colorStatus returns a string containing the status value for todo', () => {
  const result = colorStatus('todo');
  assert.ok(result.includes('todo'));
});

test('colorStatus returns a string containing the status value for in-progress', () => {
  const result = colorStatus('in-progress');
  assert.ok(result.includes('in-progress'));
});

test('colorStatus returns a string containing the status value for done', () => {
  const result = colorStatus('done');
  assert.ok(result.includes('done'));
});

test('colorStatus throws TypeError for a non-string input', () => {
  assert.throws(() => colorStatus(42), TypeError);
});

test('colorStatus throws TypeError matching "Invalid input:" for invalid status', () => {
  assert.throws(() => colorStatus('blocked'), /Invalid input:/);
});

test('colorPriority returns a string containing the priority value for low', () => {
  const result = colorPriority('low');
  assert.ok(result.includes('low'));
});

test('colorPriority returns a string containing the priority value for medium', () => {
  const result = colorPriority('medium');
  assert.ok(result.includes('medium'));
});

test('colorPriority returns a string containing the priority value for high', () => {
  const result = colorPriority('high');
  assert.ok(result.includes('high'));
});

test('colorPriority throws TypeError for a non-string input', () => {
  assert.throws(() => colorPriority(null), TypeError);
});

test('colorPriority throws TypeError matching "Invalid input:" for invalid priority', () => {
  assert.throws(() => colorPriority('urgent'), /Invalid input:/);
});
