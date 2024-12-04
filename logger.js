const fs = require('fs');
const path = require('path');

const logFilePath = path.join(__dirname, 'completed_events.log');

function logCompletedEvent(event) {
    const logEntry = `${new Date().toISOString()} - Completed: ${JSON.stringify(event)}\n`;
    fs.appendFile(logFilePath, logEntry, (err) => {
        if (err) console.error('Error logging event:', err);
    });
}

module.exports = { logCompletedEvent };
