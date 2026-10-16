const EventEmitter = require('events');

class TaskEventEmitter extends EventEmitter {}

const taskEmitter = new TaskEventEmitter();
taskEmitter.setMaxListeners(20);

// In-memory audit log of background events for verification
const eventAuditLog = [];

// ==========================================
// 1. EVENT LISTENER: 'task-created'
// Asynchronous background notification handler
// ==========================================
taskEmitter.on('task-created', async (data) => {
  const handlerStartTime = new Date();
  console.log(`\n[EVENT EMITTER]: 'task-created' event triggered!`);
  console.log(`   [Listener Started At]: ${handlerStartTime.toISOString()}`);

  try {
    // Supplementary Problem 2: Simulate error inside handler if requested
    if (data.simulateError) {
      throw new Error('Simulated Background Notification Delivery Failure (Webhook Timeout)');
    }

    // Supplementary Problem 3: Simulate slow notification handler (e.g. 2000ms delay)
    const delayMs = data.simulateSlow ? 2000 : 500;
    console.log(`   [Notification Worker]: Simulating async dispatch (${delayMs}ms delay)...`);
    
    await new Promise(resolve => setTimeout(resolve, delayMs));

    const handlerFinishTime = new Date();

    const notification = {
      event: 'task-created',
      taskTitle: data.task.title,
      taskId: data.task._id,
      assignedUser: data.user ? (data.user.email || data.user.id) : 'demo_user@taskmanager.com',
      apiRespondedAt: data.apiRespondedAt,
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
    // Supplementary Problem 2: Forward error to 'error' listener without crashing server
    taskEmitter.emit('error', err);
  }
});

// ==========================================
// 2. EVENT LISTENER: 'task-deleted' (Supplementary Problem 1)
// ==========================================
taskEmitter.on('task-deleted', async (data) => {
  const deletedTime = new Date().toISOString();
  const deletedNotification = {
    event: 'task-deleted',
    taskTitle: data.taskTitle || 'Unknown Task',
    taskId: data.taskId,
    deletedByUser: data.user ? (data.user.email || data.user.id) : 'demo_user@taskmanager.com',
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

// ==========================================
// 3. EVENT LISTENER: 'error' (Supplementary Problem 2)
// Catches and logs errors without crashing the Node process
// ==========================================
taskEmitter.on('error', (err) => {
  const errorTime = new Date().toISOString();
  console.error(`----------------------------------------------------------------`);
  console.error(`  [EVENT EMITTER ERROR HANDLER CAUGHT EXCEPTION]`);
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
  taskEmitter,
  eventAuditLog
};
