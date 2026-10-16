// Step 2: Register listeners in a separate listeners.js file
const taskEvents = require('./events');

// In-memory audit log of background events for verification
const eventAuditLog = [];

// Listener for 'task-created' event
taskEvents.on('task-created', async (data) => {
  const handlerStartTime = new Date();
  const task = data.task || data;
  const taskTitle = task.title || 'Untitled Task';

  // Exact console log format from lab manual Step 2:
  console.log(`\n[Notification] Task "${taskTitle}" created at ${handlerStartTime.toISOString()}`);

  try {
    // Supplementary Problem 2: Error handling simulation
    if (data.simulateError) {
      throw new Error('Simulated Background Notification Delivery Failure (Webhook Timeout)');
    }

    // Step 5: Artificial delay inside listener (e.g., setTimeout) to make async behavior visible
    const delayMs = data.simulateSlow ? 2000 : 500;
    console.log(`   [Notification Worker]: Simulating async dispatch (${delayMs}ms delay)...`);

    await new Promise(resolve => setTimeout(resolve, delayMs));

    const handlerFinishTime = new Date();
    const notification = {
      event: 'task-created',
      taskTitle: taskTitle,
      taskId: task._id,
      assignedUser: data.user ? (data.user.email || data.user.id) : 'student@test.com',
      apiRespondedAt: data.apiRespondedAt || handlerStartTime.toISOString(),
      handlerExecutedAt: handlerFinishTime.toISOString(),
      delayMs
    };

    eventAuditLog.push(notification);

    console.log(`----------------------------------------------------------------`);
    console.log(`🔔 [BACKGROUND NOTIFICATION DISPATCHED]`);
    console.log(`   Task Title:        "${notification.taskTitle}"`);
    console.log(`   Assigned User:     ${notification.assignedUser}`);
    console.log(`   API Responded At:  ${notification.apiRespondedAt}`);
    console.log(`   Handler Executed:  ${notification.handlerExecutedAt}`);
    console.log(`   Background Delay:  ${delayMs}ms (API response was NOT blocked!)`);
    console.log(`----------------------------------------------------------------\n`);
  } catch (err) {
    taskEvents.emit('error', err);
  }
});

// Supplementary Problem 1: Listener for 'task-deleted' event
taskEvents.on('task-deleted', async (data) => {
  const deletedTime = new Date().toISOString();
  const deletedNotification = {
    event: 'task-deleted',
    taskTitle: data.taskTitle || 'Unknown Task',
    taskId: data.taskId,
    deletedByUser: data.user ? (data.user.email || data.user.id) : 'student@test.com',
    timestamp: deletedTime
  };

  eventAuditLog.push(deletedNotification);

  console.log(`----------------------------------------------------------------`);
  console.log(`🗑️  [BACKGROUND AUDIT EVENT]: 'task-deleted'`);
  console.log(`   Task Title:        "${deletedNotification.taskTitle}" (ID: ${deletedNotification.taskId})`);
  console.log(`   Deleted By User:   ${deletedNotification.deletedByUser}`);
  console.log(`   Timestamp:         ${deletedTime}`);
  console.log(`   Audit Status:      Security audit log recorded asynchronously`);
  console.log(`----------------------------------------------------------------\n`);
});

// Supplementary Problem 2: Listener for 'error' event
taskEvents.on('error', (err) => {
  const errorTime = new Date().toISOString();
  console.error(`----------------------------------------------------------------`);
  console.error(`⚠️  [EVENT EMITTER ERROR HANDLER CAUGHT EXCEPTION]`);
  console.error(`   Error Message:     ${err.message}`);
  console.error(`   Timestamp:         ${errorTime}`);
  console.error(`   Safety Resolution: Handled safely in background; Server continues running!`);
  console.error(`----------------------------------------------------------------\n`);

  eventAuditLog.push({
    event: 'error',
    errorMessage: err.message,
    timestamp: errorTime
  });
});

module.exports = {
  taskEvents,
  eventAuditLog
};
