import { Task } from '../models/task.js';
import {
  PRIORITY_RANK,
  validateDescription,
  validateFilterOptions,
  validatePriority,
  validateSortOptions,
  validateStatus,
  validateTaskId,
  validateTitle
} from '../utils/validators.js';

const tasks = [];

/**
 * Create and store a new task.
 *
 * @param {{
 * title: string,
 * description?: string,
 * status?: 'todo' | 'in-progress' | 'done',
 * priority?: 'low' | 'medium' | 'high'
 * }} input - Create task input.
 * @returns {{
 * id: string,
 * title: string,
 * description: string,
 * status: 'todo' | 'in-progress' | 'done',
 * priority: 'low' | 'medium' | 'high',
 * createdAt: string,
 * updatedAt: string
 * }} Created task.
 */
export function createTask(input) {
  validateCreateInput(input);

  const task = new Task({
    title: input.title,
    description: input.description ?? '',
    status: input.status ?? 'todo',
    priority: input.priority ?? 'medium'
  });

  tasks.push(task);
  return task.toJSON();
}

/**
 * List tasks with optional filtering and sorting.
 *
 * @param {{
 * status?: 'todo' | 'in-progress' | 'done',
 * priority?: 'low' | 'medium' | 'high',
 * sortBy?: 'priority' | 'createdAt',
 * sortOrder?: 'asc' | 'desc'
 * }} [options={}] - Filter and sort options.
 * @returns {Array<{
 * id: string,
 * title: string,
 * description: string,
 * status: 'todo' | 'in-progress' | 'done',
 * priority: 'low' | 'medium' | 'high',
 * createdAt: string,
 * updatedAt: string
 * }>} Task list copy.
 */
export function listTasks(options = {}) {
  const filters = validateFilterOptions({
    status: options.status,
    priority: options.priority
  });
  const sorting = validateSortOptions({
    sortBy: options.sortBy,
    sortOrder: options.sortOrder
  });

  const filteredTasks = tasks
    .map((task) => task.toJSON())
    .filter((task) => {
      if (filters.status !== undefined && task.status !== filters.status) {
        return false;
      }

      if (filters.priority !== undefined && task.priority !== filters.priority) {
        return false;
      }

      return true;
    });

  return filteredTasks.sort(createTaskComparator(sorting.sortBy, sorting.sortOrder));
}

/**
 * Update an existing task by id.
 *
 * @param {string} id - Task id.
 * @param {{
 * title?: string,
 * description?: string,
 * status?: 'todo' | 'in-progress' | 'done',
 * priority?: 'low' | 'medium' | 'high'
 * }} updates - Task fields to update.
 * @returns {{
 * id: string,
 * title: string,
 * description: string,
 * status: 'todo' | 'in-progress' | 'done',
 * priority: 'low' | 'medium' | 'high',
 * createdAt: string,
 * updatedAt: string
 * }} Updated task.
 */
export function updateTask(id, updates) {
  const validatedId = validateTaskId(id);
  validateUpdateInput(updates);

  const taskIndex = tasks.findIndex((task) => task.id === validatedId);
  if (taskIndex === -1) {
    throw new Error(`Task not found: ${validatedId}`);
  }

  const existingTask = tasks[taskIndex].toJSON();
  const mergedTaskData = {
    ...existingTask,
    ...normalizeUpdatePayload(updates),
    id: existingTask.id,
    createdAt: existingTask.createdAt,
    updatedAt: new Date().toISOString()
  };

  const updatedTask = new Task(mergedTaskData);
  tasks[taskIndex] = updatedTask;

  return updatedTask.toJSON();
}

/**
 * Delete a task by id.
 *
 * @param {string} id - Task id.
 * @returns {{
 * id: string,
 * title: string,
 * description: string,
 * status: 'todo' | 'in-progress' | 'done',
 * priority: 'low' | 'medium' | 'high',
 * createdAt: string,
 * updatedAt: string
 * }} Deleted task.
 */
export function deleteTask(id) {
  const validatedId = validateTaskId(id);
  const taskIndex = tasks.findIndex((task) => task.id === validatedId);

  if (taskIndex === -1) {
    throw new Error(`Task not found: ${validatedId}`);
  }

  const [deletedTask] = tasks.splice(taskIndex, 1);
  return deletedTask.toJSON();
}

/**
 * Validate create input object.
 *
 * @param {unknown} input - Potential create input.
 */
function validateCreateInput(input) {
  if (input === null || typeof input !== 'object' || Array.isArray(input)) {
    throw new TypeError('Invalid input: createTask requires an input object.');
  }

  validateTitle(input.title);

  if (input.description !== undefined) {
    validateDescription(input.description);
  }

  if (input.status !== undefined) {
    validateStatus(input.status);
  }

  if (input.priority !== undefined) {
    validatePriority(input.priority);
  }
}

/**
 * Validate update input object.
 *
 * @param {unknown} updates - Potential update input.
 */
function validateUpdateInput(updates) {
  if (updates === null || typeof updates !== 'object' || Array.isArray(updates)) {
    throw new TypeError('Invalid input: updates must be an object.');
  }

  const allowedKeys = ['title', 'description', 'status', 'priority'];
  const providedKeys = Object.keys(updates);

  if (providedKeys.length === 0) {
    throw new TypeError('Invalid input: provide at least one field to update.');
  }

  for (const key of providedKeys) {
    if (!allowedKeys.includes(key)) {
      throw new TypeError(`Invalid input: unknown update field '${key}'.`);
    }
  }

  if (updates.title !== undefined) {
    validateTitle(updates.title);
  }

  if (updates.description !== undefined) {
    validateDescription(updates.description);
  }

  if (updates.status !== undefined) {
    validateStatus(updates.status);
  }

  if (updates.priority !== undefined) {
    validatePriority(updates.priority);
  }
}

/**
 * Normalize update payload.
 *
 * @param {{title?: string, description?: string, status?: string, priority?: string}} updates - Update payload.
 * @returns {{title?: string, description?: string, status?: 'todo' | 'in-progress' | 'done', priority?: 'low' | 'medium' | 'high'}}
 * Normalized values.
 */
function normalizeUpdatePayload(updates) {
  const normalizedUpdates = {};

  if (updates.title !== undefined) {
    normalizedUpdates.title = validateTitle(updates.title);
  }

  if (updates.description !== undefined) {
    normalizedUpdates.description = validateDescription(updates.description);
  }

  if (updates.status !== undefined) {
    normalizedUpdates.status = validateStatus(updates.status);
  }

  if (updates.priority !== undefined) {
    normalizedUpdates.priority = validatePriority(updates.priority);
  }

  return normalizedUpdates;
}

/**
 * Build a comparator for list sorting.
 *
 * @param {'priority' | 'createdAt'} sortBy - Sort field.
 * @param {'asc' | 'desc'} sortOrder - Sort direction.
 * @returns {(a: {priority: 'low' | 'medium' | 'high', createdAt: string}, b: {priority: 'low' | 'medium' | 'high', createdAt: string}) => number}
 * Comparator function.
 */
function createTaskComparator(sortBy, sortOrder) {
  const direction = sortOrder === 'asc' ? 1 : -1;

  if (sortBy === 'priority') {
    return (a, b) => (PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority]) * direction;
  }

  return (a, b) => (Date.parse(a.createdAt) - Date.parse(b.createdAt)) * direction;
}
