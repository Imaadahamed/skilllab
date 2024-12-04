const express = require('express');
const { addEvent, getUpcomingEvents, markEventCompleted } = require('./events');
const { logCompletedEvent } = require('./logger');
const cron = require('node-cron');
const WebSocket = require('ws');

const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());
 
// Add a new event
app.post('/events', (req, res) => {
    const { title, description, time } = req.body;
    if (!title || !time) {
        return res.status(400).json({ error: 'Title and time are required.' });
    }
    const event = addEvent({ title, description, time });
    res.status(201).json(event);
});

// Get all upcoming events
app.get('/events', (req, res) => {
    res.json(getUpcomingEvents());
});

// WebSocket for real-time notifications
const wss = new WebSocket.Server({ noServer: true });
let clients = [];

wss.on('connection', (ws) => {
    clients.push(ws);
    ws.on('close', () => {
        clients = clients.filter(client => client !== ws);
    });
});

// Notify users via WebSocket
function notifyClients(message) {
    clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(message));
        }
    });
}

// Schedule notifications with cron
cron.schedule('* * * * *', () => {
    const now = new Date();
    const upcoming = getUpcomingEvents();

    upcoming.forEach(event => {
        const timeDiff = (new Date(event.time) - now) / (1000 * 60);
        if (timeDiff <= 5 && timeDiff > 0) {
            notifyClients({ type: 'event-start', event });
        } else if (timeDiff <= 0) {
            markEventCompleted(event.id);
            logCompletedEvent(event);
        }
    });
});

// Handle HTTP and WebSocket connections
const server = app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
server.on('upgrade', (request, socket, head) => {
    wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit('connection', ws, request);
    });
});
