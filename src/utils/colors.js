import chalk from 'chalk';
import { validatePriority, validateStatus } from './validators.js';

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
  validateStatus(status);

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
  validatePriority(priority);

  if (priority === 'high') {
    return chalk.bold.red(priority);
  }

  if (priority === 'medium') {
    return chalk.bold.yellow(priority);
  }

  return chalk.dim(priority);
}