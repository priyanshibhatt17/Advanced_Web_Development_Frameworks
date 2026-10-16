// Re-export from dedicated events.js and listeners.js modules to ensure 100% compliance with lab manual steps
const { taskEvents, eventAuditLog } = require('../listeners');

module.exports = {
  taskEmitter: taskEvents,
  eventAuditLog
};
