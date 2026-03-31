import assert from 'node:assert/strict';
import test from 'node:test';

import { Task } from '../src/models/task.js';

test('Task constructor creates a valid task with defaults', () => {
  const task = new Task({ title: 'Write tests' });
  const json = task.toJSON();

  assert.equal(json.title, 'Write tests');
  assert.equal(json.description, '');
  assert.equal(json.status, 'todo');
  assert.equal(json.priority, 'medium');
  assert.match(json.id, /^[0-9a-f-]{36}$/i);
  assert.ok(!Number.isNaN(Date.parse(json.createdAt)));
  assert.ok(!Number.isNaN(Date.parse(json.updatedAt)));
});

test('Task constructor trims title and description', () => {
  const task = new Task({ title: '  Build CLI  ', description: '  details  ' });
  const json = task.toJSON();

  assert.equal(json.title, 'Build CLI');
  assert.equal(json.description, 'details');
});

test('Task constructor throws for non-object input', () => {
  assert.throws(() => new Task('invalid'), /expects a single object argument/);
});

test('Task constructor throws when title is missing', () => {
  assert.throws(() => new Task({}), /title must be a string/);
});

test('Task constructor accepts missing optional fields', () => {
  const task = new Task({ title: 'Only title is required' });
  const json = task.toJSON();

  assert.equal(json.description, '');
  assert.equal(json.status, 'todo');
  assert.equal(json.priority, 'medium');
});

test('Task constructor accepts boundary title length of 120 characters', () => {
  const task = new Task({ title: 'a'.repeat(120) });

  assert.equal(task.title.length, 120);
});

test('Task constructor throws when title is 121 characters', () => {
  assert.throws(
    () => new Task({ title: 'a'.repeat(121) }),
    /title length must be between 1 and 120 characters/
  );
});

test('Task constructor accepts boundary description length of 1000 characters', () => {
  const task = new Task({ title: 'A', description: 'd'.repeat(1000) });

  assert.equal(task.description.length, 1000);
});

test('Task constructor throws when description is 1001 characters', () => {
  assert.throws(
    () => new Task({ title: 'A', description: 'd'.repeat(1001) }),
    /description must be 1000 characters or fewer/
  );
});

test('Task constructor throws for type mismatches on string fields', () => {
  assert.throws(() => new Task({ title: 123 }), /title must be a string/);
  assert.throws(() => new Task({ title: 'A', description: 123 }), /description must be a string/);
  assert.throws(() => new Task({ title: 'A', status: 123 }), /status must be one of/);
  assert.throws(() => new Task({ title: 'A', priority: 123 }), /priority must be one of/);
});

test('Task constructor allows duplicate ids at model level', () => {
  const duplicateId = '550e8400-e29b-41d4-a716-446655440000';
  const first = new Task({ title: 'First', id: duplicateId });
  const second = new Task({ title: 'Second', id: duplicateId });

  assert.equal(first.id, duplicateId);
  assert.equal(second.id, duplicateId);
});

test('Task constructor throws when status is invalid', () => {
  assert.throws(() => new Task({ title: 'A', status: 'blocked' }), /status must be one of/);
});

test('Task constructor throws when priority is invalid', () => {
  assert.throws(() => new Task({ title: 'A', priority: 'urgent' }), /priority must be one of/);
});

test('Task constructor throws when id is not a UUID', () => {
  assert.throws(() => new Task({ title: 'A', id: '123' }), /task id must be a valid UUID/);
});

test('Task constructor throws when createdAt is not a valid timestamp', () => {
  assert.throws(() => new Task({ title: 'A', createdAt: 'not-a-date' }), /createdAt must be a valid ISO 8601 timestamp/);
});

test('Task constructor throws when updatedAt is not a valid timestamp', () => {
  assert.throws(() => new Task({ title: 'A', updatedAt: 'not-a-date' }), /updatedAt must be a valid ISO 8601 timestamp/);
});

test('Task constructor throws when updatedAt is before createdAt', () => {
  assert.throws(
    () =>
      new Task({
        title: 'A',
        createdAt: '2026-03-31T10:00:00.000Z',
        updatedAt: '2026-03-31T09:59:59.000Z'
      }),
    /updatedAt must be greater than or equal to createdAt/
  );
});

test('toJSON returns a plain object with task fields', () => {
  const task = new Task({ title: 'Check JSON' });
  const output = task.toJSON();

  assert.equal(typeof output, 'object');
  assert.equal(output.id, task.id);
  assert.equal(output.title, task.title);
  assert.equal(output.description, task.description);
  assert.equal(output.status, task.status);
  assert.equal(output.priority, task.priority);
  assert.equal(output.createdAt, task.createdAt);
  assert.equal(output.updatedAt, task.updatedAt);
});
