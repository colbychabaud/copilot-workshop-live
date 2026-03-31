import {
  createTask,
  deleteTask,
  listTasks,
  updateTask
} from './services/taskService.js';

function runDemo() {
  console.log('Task Manager CLI demo start');

  const taskA = createTask({
    title: 'Plan sprint backlog',
    description: 'Prepare tasks for the next sprint planning meeting.',
    priority: 'high'
  });
  const taskB = createTask({
    title: 'Refine API documentation',
    description: 'Update endpoint examples and response codes.',
    status: 'in-progress',
    priority: 'medium'
  });
  const taskC = createTask({
    title: 'Clean up old notes',
    description: 'Archive outdated project notes.',
    status: 'done',
    priority: 'low'
  });

  console.log('\nCreated tasks:');
  console.log(taskA);
  console.log(taskB);
  console.log(taskC);

  console.log('\nAll tasks sorted by createdAt asc:');
  console.log(listTasks({ sortBy: 'createdAt', sortOrder: 'asc' }));

  console.log('\nFilter by status=todo:');
  console.log(listTasks({ status: 'todo' }));

  console.log('\nFilter by priority=high:');
  console.log(listTasks({ priority: 'high' }));

  console.log('\nSorted by priority desc:');
  console.log(listTasks({ sortBy: 'priority', sortOrder: 'desc' }));

  const updatedTask = updateTask(taskA.id, {
    status: 'in-progress',
    description: 'Backlog drafted and ready for review.'
  });
  console.log('\nUpdated first task:');
  console.log(updatedTask);

  const deletedTask = deleteTask(taskC.id);
  console.log('\nDeleted one task:');
  console.log(deletedTask);

  console.log('\nRemaining tasks:');
  console.log(listTasks({ sortBy: 'createdAt', sortOrder: 'asc' }));

  console.log('\nTask Manager CLI demo complete');
}

try {
  runDemo();
} catch (error) {
  console.error(error);
  process.exitCode = 1;
}
