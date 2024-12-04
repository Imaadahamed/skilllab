const events = []; // In-memory storage for events

// Add a new event
function addEvent({ title, description, time }) {
    const event = { id: Date.now(), title, description, time: new Date(time), completed: false };
    events.push(event);
    events.sort((a, b) => new Date(a.time) - new Date(b.time)); // Sort by time
    return event;
}

// Get all upcoming events
function getUpcomingEvents() {
    const now = new Date();
    return events.filter(event => event.time > now && !event.completed);
}

// Mark an event as completed
function markEventCompleted(eventId) {
    const event = events.find(e => e.id === eventId);
    if (event) event.completed = true;
    return event;
}

module.exports = { addEvent, getUpcomingEvents, markEventCompleted };
