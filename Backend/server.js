const express = require('express');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');
const moment = require('moment-timezone');
const app = express();
const port = 3000;

// Serve static files from 'public' directory
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, 'logs');
if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir);
}

// Endpoint to handle mouse movement data from the client-side script
app.post('/logMouseMovements', (req, res) => {
    const data = req.body;
    const timestamp = moment().tz('Asia/Kolkata').format('YYYY-MM-DD HH:mm:ss.SSS');

    // Append timestamp to the data
    data.timestamp = timestamp;

    // Determine log file
    const logFile = path.join(logsDir, 'mouse_movements.csv');

    // If file does not exist, create and add header
    if (!fs.existsSync(logFile)) {
        fs.writeFileSync(logFile, 'timestamp,numSegments,distinctMouseMotions,avgLength,avgTime,avgSpeed,varSpeed,varAcc,humanInteraction\n');
    }

    // Log the data
    const logData = `${data.timestamp},${data.numSegments},${data.distinctMouseMotions},${data.avgLength},${data.avgTime},${data.avgSpeed},${data.varSpeed},${data.varAcc},${data.humanInteraction}\n`;
    fs.appendFile(logFile, logData, (err) => {
        if (err) {
            console.error('Failed to log data', err);
            res.status(500).send('Error logging data');
        } else {
            res.status(200).send('Data logged successfully');
        }
    });
});

// Routes to serve HTML files
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
