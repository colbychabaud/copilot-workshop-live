import assert from 'node:assert/strict';
import test from 'node:test';

import {
  DEFAULT_TASK_CATEGORY,
  PRIORITY_RANK,
  TASK_PRIORITIES,
  TASK_STATUSES,
  validateCategory,
  validateDescription,
  validateFilterOptions,
  validatePriority,
  validateSortOptions,
  validateStatus,
  validateTaskId,
  validateTitle
} from '../src/utils/validators.js';

test('DEFAULT_TASK_CATEGORY is general', () => {
  assert.equal(DEFAULT_TASK_CATEGORY, 'general');
});

test('TASK_STATUSES exposes expected values', () => {
  assert.deepEqual(TASK_STATUSES, ['todo', 'in-progress', 'done']);
});

test('TASK_PRIORITIES exposes expected values', () => {
  assert.deepEqual(TASK_PRIORITIES, ['low', 'medium', 'high']);
});

test('PRIORITY_RANK maps priorities for sorting', () => {
  assert.deepEqual(PRIORITY_RANK, { low: 1, medium: 2, high: 3 });
});

test('validateTitle returns trimmed title for valid input', () => {
  assert.equal(validateTitle('  Buy milk  '), 'Buy milk');
});

test('validateTitle throws when title is not a string', () => {
  assert.throws(() => validateTitle(42), /title must be a string/);
});

test('validateTitle throws when title is empty after trim', () => {
  assert.throws(() => validateTitle('   '), /title length must be between 1 and 120/);
});

test('validateTitle throws when title is longer than 120 characters', () => {
  const tooLong = 'a'.repeat(121);
  assert.throws(() => validateTitle(tooLong), /title length must be between 1 and 120/);
});

test('validateDescription returns trimmed description for valid input', () => {
  assert.equal(validateDescription('  notes  '), 'notes');
});

test('validateDescription throws when description is not a string', () => {
  assert.throws(() => validateDescription(null), /description must be a string/);
});

test('validateDescription throws when description is longer than 1000 characters', () => {
  const tooLong = 'a'.repeat(1001);
  assert.throws(() => validateDescription(tooLong), /description must be 1000 characters or fewer/);
});

test('validateStatus accepts todo', () => {
  assert.equal(validateStatus('todo'), 'todo');
});

test('validateStatus throws for unsupported status', () => {
  assert.throws(() => validateStatus('blocked'), /status must be one of/);
});

test('validatePriority accepts high', () => {
  assert.equal(validatePriority('high'), 'high');
});

test('validatePriority throws for unsupported priority', () => {
  assert.throws(() => validatePriority('urgent'), /priority must be one of/);
});

test('validateCategory returns trimmed category for valid input', () => {
  assert.equal(validateCategory('  work  '), 'work');
});

test('validateCategory throws when category is not a string', () => {
  assert.throws(() => validateCategory(42), /category must be a string/);
});

test('validateCategory throws when category is empty after trim', () => {
  assert.throws(() => validateCategory('   '), /category must be a non-empty string/);
});

test('validateTaskId accepts UUID values', () => {
  const uuid = '550e8400-e29b-41d4-a716-446655440000';
  assert.equal(validateTaskId(uuid), uuid);
});

test('validateTaskId throws for non-string ids', () => {
  assert.throws(() => validateTaskId(7), /task id must be a string/);
});

test('validateTaskId throws for malformed UUID values', () => {
  assert.throws(() => validateTaskId('not-a-uuid'), /task id must be a valid UUID/);
});

test('validateFilterOptions returns empty object when no filters are provided', () => {
  assert.deepEqual(validateFilterOptions({}), {});
});

test('validateFilterOptions accepts valid status filter', () => {
  assert.deepEqual(validateFilterOptions({ status: 'done' }), { status: 'done' });
});

test('validateFilterOptions accepts valid priority filter', () => {
  assert.deepEqual(validateFilterOptions({ priority: 'low' }), { priority: 'low' });
});

test('validateFilterOptions accepts valid category filter', () => {
  assert.deepEqual(validateFilterOptions({ category: 'work' }), { category: 'work' });
});

test('validateFilterOptions throws for non-object filters', () => {
  assert.throws(() => validateFilterOptions(null), /filters must be an object/);
});

test('validateFilterOptions throws for invalid status filter', () => {
  assert.throws(() => validateFilterOptions({ status: 'blocked' }), /status must be one of/);
});

test('validateFilterOptions throws for invalid category filter', () => {
  assert.throws(
    () => validateFilterOptions({ category: '   ' }),
    /category must be a non-empty string/
  );
});

test('validateSortOptions returns defaults when options are omitted', () => {
  assert.deepEqual(validateSortOptions({}), { sortBy: 'createdAt', sortOrder: 'asc' });
});

test('validateSortOptions accepts explicit valid options', () => {
  assert.deepEqual(validateSortOptions({ sortBy: 'priority', sortOrder: 'desc' }), {
    sortBy: 'priority',
    sortOrder: 'desc'
  });
});

test('validateSortOptions throws for non-object input', () => {
  assert.throws(() => validateSortOptions([]), /sort options must be an object/);
});

test('validateSortOptions throws for invalid sortBy', () => {
  assert.throws(() => validateSortOptions({ sortBy: 'title' }), /sortBy must be either/);
});

test('validateSortOptions throws for invalid sortOrder', () => {
  assert.throws(() => validateSortOptions({ sortOrder: 'up' }), /sortOrder must be either/);
});
