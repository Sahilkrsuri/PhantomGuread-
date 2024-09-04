let mouseMotions = [];
let lastMouseTime = Date.now();

document.addEventListener('mousemove', event => {
    const now = Date.now();
    const duration = now - lastMouseTime;
    const length = Math.sqrt(Math.pow(event.movementX, 2) + Math.pow(event.movementY, 2));

    mouseMotions.push({
        length: length,
        duration: duration,
        timestamp: now
    });

    lastMouseTime = now;
});

const processMouseMovements = () => {
    if (mouseMotions.length > 0) {
        const numSegments = mouseMotions.length;
        const distinctMouseMotions = new Set(mouseMotions.map(m => `${m.length}-${m.duration}`)).size;
        const avgLength = mouseMotions.reduce((sum, m) => sum + m.length, 0) / numSegments;
        const avgTime = mouseMotions.reduce((sum, m) => sum + m.duration, 0) / numSegments;
        const avgSpeed = mouseMotions.reduce((sum, m) => sum + (m.length / m.duration), 0) / numSegments;
        const speedVariances = mouseMotions.map(m => (m.length / m.duration) - avgSpeed);
        const varSpeed = speedVariances.reduce((sum, v) => sum + (v ** 2), 0) / numSegments;
        const accVariances = mouseMotions.map(m => ((m.length / m.duration) - avgSpeed) / (m.duration / 1000));
        const varAcc = accVariances.reduce((sum, v) => sum + (v ** 2), 0) / numSegments;

        const data = {
            type: 'mouse_movements',
            numSegments: numSegments,
            distinctMouseMotions: distinctMouseMotions,
            avgLength: avgLength,
            avgTime: avgTime,
            avgSpeed: avgSpeed,
            varSpeed: varSpeed,
            varAcc: varAcc
        };

        fetch('/logMouseMovements', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        }).catch(error => console.error('Error sending data to server:', error));

        mouseMotions = [];
    }
};

// Periodically process and send data
setInterval(processMouseMovements, 2000);
