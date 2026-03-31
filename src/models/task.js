import { randomUUID } from 'node:crypto';

import {
  validateDescription,
  validatePriority,
  validateStatus,
  validateTaskId,
  validateTitle
} from '../utils/validators.js';

/**
 * A Task domain model with schema-level validation.
 */
export class Task {
  /**
   * Create a Task instance.
   *
   * @param {object} input - Task constructor input.
   * @param {string} input.title - Task title.
   * @param {string} [input.description=''] - Task description.
   * @param {'todo' | 'in-progress' | 'done'} [input.status='todo'] - Task status.
   * @param {'low' | 'medium' | 'high'} [input.priority='medium'] - Task priority.
   * @param {string} [input.id] - Existing UUID, used by update flows.
   * @param {string} [input.createdAt] - Existing creation timestamp.
   * @param {string} [input.updatedAt] - Existing update timestamp.
   */
  constructor({
    title,
    description = '',
    status = 'todo',
    priority = 'medium',
    id = randomUUID(),
    createdAt = new Date().toISOString(),
    updatedAt = createdAt
  }) {
    if (arguments.length !== 1 || arguments[0] === null || typeof arguments[0] !== 'object') {
      throw new TypeError('Invalid input: Task constructor expects a single object argument.');
    }

    this.id = validateTaskId(id);
    this.title = validateTitle(title);
    this.description = validateDescription(description);
    this.status = validateStatus(status);
    this.priority = validatePriority(priority);
    this.createdAt = validateIsoTimestamp(createdAt, 'createdAt');
    this.updatedAt = validateIsoTimestamp(updatedAt, 'updatedAt');

    if (Date.parse(this.updatedAt) < Date.parse(this.createdAt)) {
      throw new TypeError('Invalid input: updatedAt must be greater than or equal to createdAt.');
    }
  }

  /**
   * Convert this Task to a plain object.
   *
   * @returns {{
   * id: string,
   * title: string,
   * description: string,
   * status: 'todo' | 'in-progress' | 'done',
   * priority: 'low' | 'medium' | 'high',
   * createdAt: string,
   * updatedAt: string
   * }}
   */
  toJSON() {
    return {
      id: this.id,
      title: this.title,
      description: this.description,
      status: this.status,
      priority: this.priority,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }
}

/**
 * Validate that a timestamp is an ISO 8601 value.
 *
 * @param {string} value - Timestamp value.
 * @param {string} fieldName - Field label for errors.
 * @returns {string}
 */
function validateIsoTimestamp(value, fieldName) {
  if (typeof value !== 'string') {
    throw new TypeError(`Invalid input: ${fieldName} must be an ISO 8601 string.`);
  }

  if (Number.isNaN(Date.parse(value))) {
    throw new TypeError(`Invalid input: ${fieldName} must be a valid ISO 8601 timestamp.`);
  }

  return value;
}
