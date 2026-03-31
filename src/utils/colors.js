import chalk from 'chalk';

const VALID_STATUSES = new Set(['todo', 'in-progress', 'done']);
const VALID_PRIORITIES = new Set(['low', 'medium', 'high']);

/**
 * Returns a colorized status label for terminal display.
 *
 * @param {string} status - Task status.
 * @returns {string} Colorized status text.
 * @throws {TypeError} When status is not a valid string value.
 *
 * @example
 * colorStatus('done');
 * // => green "done"
 *
 * @example
 * colorStatus('todo');
 * // => red "todo"
 */
export function colorStatus(status) {
  if (typeof status !== 'string') {
    throw new TypeError('status must be a string');
  }

  if (!VALID_STATUSES.has(status)) {
    throw new TypeError(
      'status must be one of: todo, in-progress, done'
    );
  }

  if (status === 'done') {
    return chalk.green(status);
  }

  if (status === 'in-progress') {
    return chalk.yellow(status);
  }

  return chalk.red(status);
}

/**
 * Returns a colorized priority label for terminal display.
 *
 * @param {string} priority - Task priority.
 * @returns {string} Colorized priority text.
 * @throws {TypeError} When priority is not a valid string value.
 *
 * @example
 * colorPriority('high');
 * // => bold red "high"
 *
 * @example
 * colorPriority('low');
 * // => dim "low"
 */
export function colorPriority(priority) {
  if (typeof priority !== 'string') {
    throw new TypeError('priority must be a string');
  }

  if (!VALID_PRIORITIES.has(priority)) {
    throw new TypeError('priority must be one of: low, medium, high');
  }

  if (priority === 'high') {
    return chalk.bold.red(priority);
  }

  if (priority === 'medium') {
    return chalk.bold.yellow(priority);
  }

  return chalk.dim(priority);
}