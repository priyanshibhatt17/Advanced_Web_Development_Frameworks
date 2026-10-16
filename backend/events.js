const EventEmitter = require('events');

// Step 1: Create a dedicated events.js module
class TaskEvents extends EventEmitter {}

module.exports = new TaskEvents();
