function simulateMouseMove(x, y, isBot = false) {
	const event = new MouseEvent('mousemove', {
	    clientX: x,
	    clientY: y,
	    bubbles: true
	});
	
	document.dispatchEvent(event);
      
	if (isBot) {
	    console.log(`Log is generating from the bot. Mouse moved to coordinates: (${x}, ${y})`);
	} else {
	    console.log(`Mouse moved to coordinates: (${x}, ${y})`);
	}
      }
      
      
      
      // Example: Simulate mouse moving to (400, 500) coordinates by a user
      simulateMouseMove(100, 1000, false);