const { createCanvas, loadImage } = require('canvas');
const fs = require('fs');

async function createIcon() {
    // Load the original CodeWolf icon
    const originalIcon = await loadImage('./original-icon.png');
    
    // Create canvas same size
    const canvas = createCanvas(128, 128);
    const ctx = canvas.getContext('2d');
    
    // Draw the original CodeWolf icon but mask out the green shield
    ctx.drawImage(originalIcon, 0, 0, 128, 128);
    
    // Remove the green shield by drawing over it with background color
    ctx.fillStyle = '#2d3748'; // Same as background
    ctx.beginPath();
    ctx.arc(112, 16, 12, 0, Math.PI * 2); // Cover the green shield area
    ctx.fill();
    
    // Add a nice green health checkmark in bottom right corner
    ctx.strokeStyle = '#38a169'; // Nice green color
    ctx.lineWidth = 4; // Bold tick
    ctx.lineCap = 'round'; // Rounded ends
    ctx.lineJoin = 'round';
    
    ctx.beginPath();
    ctx.moveTo(92, 100); // Start of tick
    ctx.lineTo(98, 106); // Middle of tick
    ctx.lineTo(110, 90); // End of tick
    ctx.stroke();
    
    // Save the icon
    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync('./images/icon.png', buffer);
    
    console.log('🐺 EXACT CodeWolf icon with file element created!');
    console.log('Original design preserved, just added small file icon');
}

createIcon().catch(console.error);
