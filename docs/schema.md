# Task Manager CLI Technical Design

## 1. Data models

### Task
- `id`: number, required
  - Validation: positive integer (`>= 1`), no decimals, unique within in-memory store, system-assigned only (not user-editable).
- `title`: string, required
  - Validation: string type, trimmed non-empty value, length `1..120`, must not contain only whitespace.
- `description`: string, required
  - Validation: string type, maximum 1000 characters, empty string allowed, leading/trailing whitespace trimmed before storage.
- `status`: 'todo' | 'in-progress' | 'done', required
  - Validation: exact enum match to one of `todo`, `in-progress`, or `done` (case-sensitive).
- `priority`: 'low' | 'medium' | 'high', required
  - Validation: exact enum match to one of `low`, `medium`, or `high` (case-sensitive).
- `category`: string, required
  - Validation: string type, trimmed non-empty value, defaults to `'general'` when omitted at creation.
- `createdAt`: string, required
  - Validation: valid ISO 8601 UTC timestamp (`Date.parse(createdAt)` is valid), system-managed only, immutable after creation.
- `updatedAt`: string, required
  - Validation: valid ISO 8601 UTC timestamp (`Date.parse(updatedAt)` is valid), system-managed only, must be refreshed on every successful update, must be greater than or equal to `createdAt`.

### InMemoryTaskStore
- `tasks`: Task[], required
  - Validation: array elements must conform to `Task` model.
- `nextId`: number, required
  - Validation: positive integer; incremented after each successful create.

### CreateTaskInput
- `title`: string, required
  - Validation: same as `Task.title`.
- `description`: string, optional
  - Validation: same as `Task.description`; default `''`.
- `status`: 'todo' | 'in-progress' | 'done', optional
  - Validation: same as `Task.status`; default `'todo'`.
- `priority`: 'low' | 'medium' | 'high', optional
  - Validation: same as `Task.priority`; default `'medium'`.
- `category`: string, optional
  - Validation: same as `Task.category`; default `'general'`.

### UpdateTaskInput
- `id`: number, required
  - Validation: positive integer and existing task id.
- `title`: string, optional
  - Validation: same as `Task.title` when present.
- `description`: string, optional
  - Validation: same as `Task.description` when present.
- `status`: 'todo' | 'in-progress' | 'done', optional
  - Validation: same as `Task.status` when present.
- `priority`: 'low' | 'medium' | 'high', optional
  - Validation: same as `Task.priority` when present.
- `category`: string, optional
  - Validation: same as `Task.category` when present.
- Rule: at least one of `title`, `description`, `status`, `priority`, or `category` must be provided.

### ListQuery
- `status`: 'todo' | 'in-progress' | 'done', optional
  - Validation: must be an allowed status value.
- `priority`: 'low' | 'medium' | 'high', optional
  - Validation: must be an allowed priority value.
- `category`: string, optional
  - Validation: string type, trimmed non-empty value.
- `sortBy`: 'priority' | 'createdAt', optional
  - Validation: must be one of allowed sort fields.
- `sortDir`: 'asc' | 'desc', optional
  - Validation: defaults to `'asc'` when omitted.

## 2. File structure

```text
src/
  index.js                     # CLI entry point and top-level command routing.
  constants.js                 # Shared enums and ordering constants for status/priority/sort.
  types.js                     # JSDoc typedef exports for Task and command payload shapes.
  store/
    inMemoryTaskStore.js       # In-memory task collection and incremental id management.
  services/
    taskService.js             # Core CRUD, filtering, sorting, and validation orchestration.
  cli/
    parser.js                  # argv parsing and normalization into typed command inputs.
    formatter.js               # Console output formatting for success, errors, and task lists.
  utils/
    validate.js                # Reusable field and enum validation helpers.
    date.js                    # Timestamp generation helper for createdAt/updatedAt.
```

## 3. Module responsibilities

### `src/constants.js`
- Exports:
  - `TASK_STATUS` (allowed status values)
  - `TASK_PRIORITY` (allowed priority values)
  - `PRIORITY_SORT_ORDER` (high > medium > low)
  - `SORT_FIELDS` (`priority`, `createdAt`)
  - `SORT_DIRECTIONS` (`asc`, `desc`)
- Dependencies: none.

### `src/types.js`
- Exports:
  - JSDoc typedefs for `Task`, `CreateTaskInput`, `UpdateTaskInput`, and `ListQuery`.
- Dependencies: none.

### `src/store/inMemoryTaskStore.js`
- Exports:
  - `createInMemoryTaskStore()` factory returning store methods:
    - `getAll()`
    - `getById(id)`
    - `insert(task)`
    - `updateById(id, patch)`
    - `deleteById(id)`
    - `nextId()`
- Dependencies:
  - Internal JavaScript arrays and numbers only.

### `src/utils/date.js`
- Exports:
  - `nowIso()` for current ISO 8601 timestamp.
- Dependencies:
  - Built-in JavaScript `Date`.

### `src/utils/validate.js`
- Exports:
  - `validateTaskId(id)`
  - `validateCreateInput(input)`
  - `validateUpdateInput(input)`
  - `validateListQuery(query)`
- Dependencies:
  - `src/constants.js` for allowed enum values.

### `src/services/taskService.js`
- Exports:
  - `createTask(input)`
  - `listTasks(query)`
  - `updateTask(input)`
  - `deleteTask(id)`
- Dependencies:
  - `src/store/inMemoryTaskStore.js` for persistence.
  - `src/utils/validate.js` for input validation.
  - `src/utils/date.js` for timestamps.
  - `src/constants.js` for sorting behavior.

### `src/cli/parser.js`
- Exports:
  - `parseArgv(argv)` returning normalized command object.
- Dependencies:
  - `src/constants.js` for command and option value validation.

### `src/cli/formatter.js`
- Exports:
  - `formatTask(task)`
  - `formatTaskList(tasks)`
  - `formatError(error)`
  - `formatHelp()`
- Dependencies: none.

### `src/index.js`
- Exports:
  - None (application entrypoint).
- Responsibilities:
  - Parse arguments, dispatch command handlers, print output, set process exit code.
- Dependencies:
  - `src/cli/parser.js`
  - `src/cli/formatter.js`
  - `src/services/taskService.js`

## 4. Error handling strategy

### Error types
- `VALIDATION_ERROR`
  - Thrown when any input fails schema or enum validation.
  - Thrown in `src/utils/validate.js` and surfaced through `src/services/taskService.js`.
- `TASK_NOT_FOUND`
  - Thrown when update/delete receives an id that does not exist.
  - Thrown in `src/services/taskService.js` after store lookup.
- `COMMAND_ERROR`
  - Thrown when command name or option shape is invalid.
  - Thrown in `src/cli/parser.js`.
- `INTERNAL_ERROR`
  - Thrown for unexpected runtime issues.
  - Thrown/rethrown in `src/index.js` catch-all path.

### Throwing and handling rules
- Validation and command errors are expected user errors.
  - Catch in `src/index.js`, print with `console.error`, exit code `1`.
- Unexpected runtime errors are internal failures.
  - Catch in `src/index.js`, print with `console.error`, exit code `2`.
- All thrown values must be `Error` objects with descriptive messages.
- Error output format should be consistent: `Error [CODE]: <message>`.
