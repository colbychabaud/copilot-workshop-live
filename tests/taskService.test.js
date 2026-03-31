import assert from 'node:assert/strict';
import { beforeEach, test } from 'node:test';

import {
  createTask,
  deleteTask,
  listTasks,
  updateTask
} from '../src/services/taskService.js';

function clearAllTasks() {
  const existingTasks = listTasks();
  for (const task of existingTasks) {
    deleteTask(task.id);
  }
}

beforeEach(() => {
  clearAllTasks();
});

test('createTask stores and returns a new task', () => {
  const created = createTask({ title: 'Create first task', priority: 'high' });

  assert.equal(created.title, 'Create first task');
  assert.equal(created.priority, 'high');
  assert.equal(created.status, 'todo');
  assert.ok(created.id);
});

test('createTask throws for non-object input', () => {
  assert.throws(() => createTask(null), /createTask requires an input object/);
});

test('createTask throws for invalid title', () => {
  assert.throws(() => createTask({ title: '   ' }), /title length must be between 1 and 120/);
});

test('createTask allows missing optional description', () => {
  const created = createTask({ title: 'No description provided' });

  assert.equal(created.description, '');
});

test('createTask supports boundary description length of 1000 characters', () => {
  const created = createTask({ title: 'Boundary description', description: 'a'.repeat(1000) });

  assert.equal(created.description.length, 1000);
});

test('createTask rejects very long description above 1000 characters', () => {
  assert.throws(
    () => createTask({ title: 'Too long description', description: 'a'.repeat(1001) }),
    /description must be 1000 characters or fewer/
  );
});

test('createTask rejects numeric type mismatches for string and enum fields', () => {
  assert.throws(
    () => createTask({ title: Number.MAX_SAFE_INTEGER }),
    /title must be a string/
  );
  assert.throws(
    () => createTask({ title: 'Type mismatch', description: 123 }),
    /description must be a string/
  );
  assert.throws(
    () => createTask({ title: 'Type mismatch', status: 1 }),
    /status must be one of/
  );
  assert.throws(
    () => createTask({ title: 'Type mismatch', priority: 2 }),
    /priority must be one of/
  );
});

test('listTasks returns a copy rather than internal references', () => {
  const created = createTask({ title: 'Mutable check' });
  const listed = listTasks();

  listed[0].title = 'Changed externally';

  const listedAgain = listTasks();
  assert.equal(listedAgain[0].id, created.id);
  assert.equal(listedAgain[0].title, 'Mutable check');
});

test('listTasks returns an empty array when no tasks exist', () => {
  const listed = listTasks();

  assert.deepEqual(listed, []);
});

test('listTasks filters tasks by status', () => {
  createTask({ title: 'Todo item', status: 'todo' });
  createTask({ title: 'Done item', status: 'done' });

  const todoTasks = listTasks({ status: 'todo' });

  assert.equal(todoTasks.length, 1);
  assert.equal(todoTasks[0].status, 'todo');
});

test('listTasks filters tasks by priority', () => {
  createTask({ title: 'Low item', priority: 'low' });
  createTask({ title: 'High item', priority: 'high' });

  const highPriorityTasks = listTasks({ priority: 'high' });

  assert.equal(highPriorityTasks.length, 1);
  assert.equal(highPriorityTasks[0].priority, 'high');
});

test('listTasks sorts tasks by priority descending', () => {
  createTask({ title: 'Low', priority: 'low' });
  createTask({ title: 'Medium', priority: 'medium' });
  createTask({ title: 'High', priority: 'high' });

  const sorted = listTasks({ sortBy: 'priority', sortOrder: 'desc' });

  assert.deepEqual(
    sorted.map((task) => task.priority),
    ['high', 'medium', 'low']
  );
});

test('listTasks supports concurrent adds while iterating over a snapshot', () => {
  createTask({ title: 'Initial one' });
  createTask({ title: 'Initial two' });

  const snapshot = listTasks();
  let seen = 0;

  for (const task of snapshot) {
    seen += 1;
    createTask({ title: `Added during iteration ${seen}`, description: task.id });
  }

  assert.equal(seen, 2);
  assert.equal(listTasks().length, 4);
});

test('createTask allows duplicate titles as separate entries', () => {
  const first = createTask({ title: 'Duplicate title' });
  const second = createTask({ title: 'Duplicate title' });

  assert.equal(first.title, second.title);
  assert.notEqual(first.id, second.id);
  assert.equal(listTasks().length, 2);
});

test('listTasks throws for invalid filter options', () => {
  assert.throws(() => listTasks({ status: 'blocked' }), /status must be one of/);
});

test('listTasks throws for invalid sort options', () => {
  assert.throws(() => listTasks({ sortBy: 'title' }), /sortBy must be either/);
});

test('updateTask updates provided fields and refreshes updatedAt', () => {
  const created = createTask({ title: 'Before update', description: 'old' });
  const updated = updateTask(created.id, { title: 'After update', status: 'in-progress' });

  assert.equal(updated.id, created.id);
  assert.equal(updated.createdAt, created.createdAt);
  assert.equal(updated.title, 'After update');
  assert.equal(updated.status, 'in-progress');
  assert.ok(Date.parse(updated.updatedAt) >= Date.parse(created.updatedAt));
});

test('updateTask throws when updates object is empty', () => {
  const created = createTask({ title: 'No-op update' });
  assert.throws(() => updateTask(created.id, {}), /provide at least one field to update/);
});

test('updateTask rejects numeric type mismatches in update payload', () => {
  const created = createTask({ title: 'Update type mismatch target' });

  assert.throws(() => updateTask(created.id, { title: 42 }), /title must be a string/);
  assert.throws(() => updateTask(created.id, { description: 42 }), /description must be a string/);
  assert.throws(() => updateTask(created.id, { status: 42 }), /status must be one of/);
  assert.throws(() => updateTask(created.id, { priority: 42 }), /priority must be one of/);
});

test('updateTask throws when id is not found', () => {
  assert.throws(
    () => updateTask('550e8400-e29b-41d4-a716-446655440000', { title: 'X' }),
    /Task not found/
  );
});

test('updateTask throws for unknown update fields', () => {
  const created = createTask({ title: 'Unknown field check' });
  assert.throws(() => updateTask(created.id, { owner: 'alice' }), /unknown update field/);
});

test('deleteTask removes and returns the deleted task', () => {
  const created = createTask({ title: 'Delete me' });
  const deleted = deleteTask(created.id);

  assert.equal(deleted.id, created.id);
  assert.equal(listTasks().length, 0);
});

test('deleteTask throws when id is not found', () => {
  assert.throws(
    () => deleteTask('550e8400-e29b-41d4-a716-446655440000'),
    /Task not found/
  );
});

test('deleteTask throws when id format is invalid', () => {
  assert.throws(() => deleteTask('invalid-id'), /task id must be a valid UUID/);
});
