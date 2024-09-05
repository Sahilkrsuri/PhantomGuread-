let mouseMotions = [];
let lastMouseTime = Date.now();
const COLLECTION_DURATION = 12000; // 12 seconds
let isCollecting = false;
let hasLoggedOnce = false; // New flag to ensure logging happens only once
let collectionTimeout = null;

// Function to start collecting mouse movements
const startCollection = () => {
    if (isCollecting || hasLoggedOnce) {
        console.log('Collection already in progress or has been completed for this session');
        return;
    }

    mouseMotions = [];
    lastMouseTime = Date.now();
    isCollecting = true;
    document.addEventListener('mousemove', onMouseMove);
    console.log('Mouse collection started');

    // Stop the collection after COLLECTION_DURATION
    collectionTimeout = setTimeout(stopCollection, COLLECTION_DURATION);
};

// Function to handle mouse movement events
const onMouseMove = (event) => {
    if (!isCollecting) return; // Ensure we're still collecting data

    const now = Date.now();
    const duration = now - lastMouseTime;
    const length = Math.sqrt(Math.pow(event.movementX, 2) + Math.pow(event.movementY, 2));

    mouseMotions.push({
        length: length,
        duration: duration,
        timestamp: now
    });

    lastMouseTime = now;
};

// Function to stop data collection
const stopCollection = () => {
    document.removeEventListener('mousemove', onMouseMove);
    isCollecting = false;
    hasLoggedOnce = true; // Set the flag to true after the first log
    clearTimeout(collectionTimeout); // Clear any remaining timeout
    console.log('Mouse collection stopped');

    if (mouseMotions.length > 0) {
        console.log('Processing mouse movements:', mouseMotions);
        processMouseMovements();
    } else {
        console.log('No mouse movements to process');
    }
};

// Function to process mouse movements and send data to server
const processMouseMovements = () => {
    const numSegments = mouseMotions.length;
    const distinctMouseMotions = new Set(mouseMotions.map(m => `${m.length}-${m.duration}`)).size;
    const avgLength = numSegments > 0 ? mouseMotions.reduce((sum, m) => sum + m.length, 0) / numSegments : 0;
    const avgTime = numSegments > 0 ? mouseMotions.reduce((sum, m) => sum + m.duration, 0) / numSegments : 0;
    const avgSpeed = numSegments > 0 ? mouseMotions.reduce((sum, m) => sum + (m.length / m.duration), 0) / numSegments : 0;
    const speedVariances = mouseMotions.map(m => (m.length / m.duration) - avgSpeed);
    const varSpeed = numSegments > 0 ? speedVariances.reduce((sum, v) => sum + (v ** 2), 0) / numSegments : 0;
    const accVariations = mouseMotions.map(m => ((m.length / m.duration) - avgSpeed) / (m.duration / 1000));
    const varAcc = numSegments > 0 ? accVariations.reduce((sum, v) => sum + (v ** 2), 0) / numSegments : 0;

    const data = {
        humanInteraction: 0, // Add new header with value 0
        numSegments: numSegments,
        distinctMouseMotions: distinctMouseMotions,
        avgLength: avgLength,
        avgTime: avgTime,
        avgSpeed: avgSpeed,
        varSpeed: varSpeed,
        varAcc: varAcc
    };

    console.log('Sending data to server:', data);

    fetch('/logMouseMovements', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
    .then(response => response.text())
    .then(text => console.log('Server response:', text))
    .catch(error => console.error('Error sending data to server:', error));
};

// Start collection only when the user first interacts (e.g., mouse movement)
document.addEventListener('mousemove', (event) => {
    if (!hasLoggedOnce) {
        startCollection();
    }
}, { once: true }); // Ensure this event listener only fires once
