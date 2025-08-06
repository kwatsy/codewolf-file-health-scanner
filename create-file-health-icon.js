const { createCanvas } = require('canvas');
const fs = require('fs');

// Create a 128x128 canvas for the icon (same as original CodeWolf)
const canvas = createCanvas(128, 128);
const ctx = canvas.getContext('2d');

// Dark background like original
ctx.fillStyle = '#2d3748'; // Same dark background as original
ctx.fillRect(0, 0, 128, 128);

// Main wolf head (using original CodeWolf style)
ctx.fillStyle = '#e53e3e'; // Original CodeWolf red
ctx.beginPath();
// Wolf head - more angular like original
ctx.moveTo(64, 25);
ctx.lineTo(45, 35);
ctx.lineTo(40, 55);
ctx.lineTo(45, 70);
ctx.lineTo(64, 75);
ctx.lineTo(83, 70);
ctx.lineTo(88, 55);
ctx.lineTo(83, 35);
ctx.closePath();
ctx.fill();

// Wolf ears (sharp triangular like original)
ctx.fillStyle = '#c53030'; // Darker red for ears
ctx.beginPath();
ctx.moveTo(45, 35);
ctx.lineTo(35, 15);
ctx.lineTo(55, 25);
ctx.closePath();
ctx.fill();

ctx.beginPath();
ctx.moveTo(83, 35);
ctx.lineTo(93, 15);
ctx.lineTo(73, 25);
ctx.closePath();
ctx.fill();

// Wolf eyes (white like original)
ctx.fillStyle = '#ffffff';
ctx.beginPath();
ctx.arc(55, 50, 5, 0, Math.PI * 2);
ctx.fill();
ctx.beginPath();
ctx.arc(73, 50, 5, 0, Math.PI * 2);
ctx.fill();

// Wolf pupils (black)
ctx.fillStyle = '#000000';
ctx.beginPath();
ctx.arc(55, 50, 2, 0, Math.PI * 2);
ctx.fill();
ctx.beginPath();
ctx.arc(73, 50, 2, 0, Math.PI * 2);
ctx.fill();

// Wolf snout/nose area
ctx.fillStyle = '#c53030';
ctx.beginPath();
ctx.moveTo(64, 60);
ctx.lineTo(58, 65);
ctx.lineTo(70, 65);
ctx.closePath();
ctx.fill();

// File/Document icon (integrated with wolf design)
ctx.fillStyle = '#4299e1'; // Blue for file
ctx.fillRect(35, 85, 25, 35); // Main document body

// File corner fold
ctx.fillStyle = '#63b3ed';
ctx.beginPath();
ctx.moveTo(55, 85);
ctx.lineTo(60, 85);
ctx.lineTo(60, 90);
ctx.lineTo(55, 95);
ctx.closePath();
ctx.fill();

// Code lines in the file
ctx.strokeStyle = '#2d3748';
ctx.lineWidth = 1.5;
ctx.beginPath();
ctx.moveTo(38, 95);
ctx.lineTo(52, 95);
ctx.moveTo(38, 100);
ctx.lineTo(48, 100);
ctx.moveTo(38, 105);
ctx.lineTo(52, 105);
ctx.moveTo(38, 110);
ctx.lineTo(45, 110);
ctx.stroke();

// Health checkmark (green like original security theme)
ctx.strokeStyle = '#38a169';
ctx.lineWidth = 3;
ctx.beginPath();
ctx.moveTo(70, 95);
ctx.lineTo(75, 100);
ctx.lineTo(85, 85);
ctx.stroke();

// Health score
ctx.fillStyle = '#38a169';
ctx.font = 'bold 11px Arial';
ctx.fillText('✓', 90, 105);

// CodeWolf signature (bottom)
ctx.fillStyle = '#e53e3e';
ctx.font = 'bold 8px Arial';
ctx.fillText('CodeWolf', 5, 123);

// Save the icon
const buffer = canvas.toBuffer('image/png');
fs.writeFileSync('./images/icon.png', buffer);

console.log('🐺 CodeWolf File Health Scanner icon created successfully!');
console.log('Icon matches original CodeWolf style with file theme!');
console.log('Icon saved as: ./images/icon.png');
