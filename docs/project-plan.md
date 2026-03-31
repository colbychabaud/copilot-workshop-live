# Task Manager CLI Project Plan

## 1. Project Overview
The Task Manager CLI is a small Node.js 20+ command-line application for managing personal tasks entirely in memory during runtime. It supports full CRUD operations for tasks, optional task categories with a default of general, filtering by status/priority/category, and sorting by priority or creation date. The tool is designed for workshop learning, with clear command design, strict input validation, and simple modular architecture using only built-in Node.js modules.

## 2. User Stories
1. As a user, I want to create a task so I can track work I need to complete.
   Acceptance criteria:
   - I can run a command to create a task with title, description, status, priority, and an optional category.
   - The app assigns createdAt and updatedAt automatically.
   - If category is omitted, the app stores category as general.
   - The command returns the created task with a unique id.

2. As a user, I want to list tasks so I can see my current workload.
   Acceptance criteria:
   - I can run a command to show all tasks currently in memory.
   - The output includes id, title, status, priority, category, createdAt, and updatedAt.
   - If no tasks exist, the app displays a clear empty-state message.

3. As a user, I want to update a task so I can keep task details accurate over time.
   Acceptance criteria:
   - I can update title, description, status, and priority by task id.
   - I can update category by task id.
   - The app updates updatedAt on every successful update.
   - If the id does not exist, the app returns a clear error message.

4. As a user, I want to delete a task so I can remove items I no longer need.
   Acceptance criteria:
   - I can delete a task by id.
   - Deleted tasks no longer appear in list output.
   - If the id does not exist, the app returns a clear error message.

5. As a user, I want to filter tasks so I can focus on relevant items.
   Acceptance criteria:
   - I can filter listed tasks by status using values todo, in-progress, or done.
   - I can filter listed tasks by priority using values low, medium, or high.
   - I can filter listed tasks by category using an exact category value.
   - Invalid filter values are rejected with validation messages.

6. As a user, I want to sort tasks so I can review them in useful order.
   Acceptance criteria:
   - I can sort by priority and by creation date.
   - Priority sorting uses a defined order: high, medium, low.
   - Date sorting uses createdAt in ascending or descending order.

## 3. Data Model
- Task
  - id: number
  - title: string
  - description: string
  - status: 'todo' | 'in-progress' | 'done'
  - priority: 'low' | 'medium' | 'high'
  - category: string (defaults to 'general')
  - createdAt: string (ISO 8601 timestamp)
  - updatedAt: string (ISO 8601 timestamp)

- InMemoryTaskStore
  - tasks: Task[]
  - nextId: number

## 4. File Structure
Proposed layout under src/:

```text
src/
  index.js                # CLI entry point and command routing
  constants.js            # status and priority enums, sort orders
  types.js                # JSDoc typedefs for Task and command payloads
  store/
    inMemoryTaskStore.js  # task collection and id generation
  services/
    taskService.js        # CRUD, filter (status/priority/category), and sort business logic
  cli/
    parser.js             # argv parsing and option normalization
    formatter.js          # user-facing output formatting including category display
  utils/
    validate.js           # input and enum validation
    date.js               # timestamp helpers
```

## 5. Implementation Phases
1. Milestone 1: CLI Skeleton and Command Parsing
   - Build command dispatcher in src/index.js.
   - Implement basic command parsing (create, list, update, delete).
   - Add help and usage output.

2. Milestone 2: In-Memory Data Layer and Task Creation
   - Implement InMemoryTaskStore with task array and incremental ids.
   - Add createTask flow with default timestamps and validation.
   - Verify create and list baseline behavior manually.

3. Milestone 3: Update and Delete Operations
   - Implement updateTask by id with partial field updates.
   - Ensure updatedAt refreshes on updates.
   - Implement deleteTask by id and missing-id error handling.

4. Milestone 4: Filtering and Sorting
   - Add list filters for status, priority, and category.
   - Add sorting by priority and createdAt.
   - Define deterministic sorting behavior and tie-breakers.

5. Milestone 5: Category Defaults and Validation
   - Add category support to create and update flows.
   - Default missing category to general.
   - Reject invalid category input (non-string or empty-after-trim).

6. Milestone 6: Validation, Error Messages, and Polish
   - Centralize validation for enums and required fields.
   - Improve formatter output for readability.
   - Add lightweight smoke tests using Node.js built-in assert module.

7. Milestone 7: Workshop Readiness
   - Confirm app runs on Node.js 20+ with no external dependencies.
   - Document common commands and examples in inline help text.
   - Perform final manual verification for all user stories.

## 6. Error Handling Conventions and Input Validation Rules
### Error Handling Conventions
- Use a consistent error object shape in internal logic:
  - code: string
  - message: string
  - details: object (optional)
- Map expected user-caused errors to exit code 1 and unexpected runtime errors to exit code 2.
- Print user-facing errors to stderr using a consistent format:
  - Error [CODE]: message
- Keep messages actionable by including the invalid field, accepted values, and an example when relevant.
- Never print stack traces for expected validation errors; reserve stack output for unexpected failures when a debug flag is enabled.

### Input Validation Rules
- Global command validation:
  - Reject unknown commands and show usage help.
  - Reject unknown flags/options for each command.
- Task id validation:
  - id must be a positive integer.
  - update/delete operations must fail with TASK_NOT_FOUND when id does not exist.
- create validation:
  - title is required, must be a non-empty string after trim, and should have a reasonable max length (for example, 120 chars).
  - description is optional; if provided, it must be a string and capped to a max length (for example, 1000 chars).
  - status, if provided, must be one of todo, in-progress, done.
  - priority, if provided, must be one of low, medium, high.
  - category is optional; if omitted, set to general.
  - category, if provided, must be a non-empty string after trim.
- update validation:
  - At least one updatable field (title, description, status, priority, category) must be provided.
  - Apply the same field-level rules as create.
- list validation:
  - status filter must be one of todo, in-progress, done.
  - priority filter must be one of low, medium, high.
  - category filter must be a non-empty string after trim.
  - sort field must be priority or createdAt.
  - sort direction must be asc or desc (default to asc if omitted).
- Timestamp rules:
  - createdAt and updatedAt are system-managed only and cannot be set directly by user input.
  - updatedAt must always refresh on successful update operations.
