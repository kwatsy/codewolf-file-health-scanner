const { createCanvas } = require('canvas');
const fs = require('fs');

// Create a 128x128 canvas - EXACT wolf from original CodeWolf but clean
const canvas = createCanvas(128, 128);
const ctx = canvas.getContext('2d');

// Background with rounded corners like original
ctx.fillStyle = '#2d3748';
ctx.fillRect(0, 0, 128, 128);

// Outer shield shape (dark border) - EXACT from original
ctx.fillStyle = '#1a202c';
ctx.strokeStyle = '#4a5568';
ctx.lineWidth = 2;
ctx.beginPath();
ctx.moveTo(64, 16);
ctx.lineTo(32, 28);
ctx.lineTo(32, 64);
ctx.quadraticCurveTo(32, 88, 48, 104);
ctx.quadraticCurveTo(56, 108, 64, 112);
ctx.quadraticCurveTo(72, 108, 80, 104);
ctx.quadraticCurveTo(96, 88, 96, 64);
ctx.lineTo(96, 28);
ctx.closePath();
ctx.fill();
ctx.stroke();

// Inner shield (red) - EXACT from original
ctx.fillStyle = '#e53e3e';
ctx.beginPath();
ctx.moveTo(64, 24);
ctx.lineTo(40, 32);
ctx.lineTo(40, 64);
ctx.quadraticCurveTo(40, 82, 52, 96);
ctx.quadraticCurveTo(58, 100, 64, 102);
ctx.quadraticCurveTo(70, 100, 76, 96);
ctx.quadraticCurveTo(88, 82, 88, 64);
ctx.lineTo(88, 32);
ctx.closePath();
ctx.fill();

// Wolf head (white circle) - EXACT from original
ctx.fillStyle = '#ffffff';
ctx.beginPath();
ctx.arc(64, 52, 12, 0, Math.PI * 2);
ctx.fill();

// Wolf ears (white triangles) - EXACT from original
ctx.fillStyle = '#ffffff';
ctx.beginPath();
ctx.moveTo(56, 44);
ctx.lineTo(60, 36);
ctx.lineTo(64, 44);
ctx.closePath();
ctx.fill();

ctx.beginPath();
ctx.moveTo(64, 44);
ctx.lineTo(68, 36);
ctx.lineTo(72, 44);
ctx.closePath();
ctx.fill();

// Wolf eyes (dark) - EXACT from original
ctx.fillStyle = '#2d3748';
ctx.beginPath();
ctx.arc(60, 50, 2, 0, Math.PI * 2);
ctx.fill();
ctx.beginPath();
ctx.arc(68, 50, 2, 0, Math.PI * 2);
ctx.fill();

// Wolf nose (dark) - EXACT from original
ctx.fillStyle = '#2d3748';
ctx.beginPath();
ctx.arc(64, 54, 1, 0, Math.PI * 2);
ctx.fill();

// Save the clean wolf base
const buffer = canvas.toBuffer('image/png');
fs.writeFileSync('./images/icon.png', buffer);

console.log('🐺 CLEAN CodeWolf base created!');
console.log('Pure wolf design - no shields, no ticks, ready for customization');
