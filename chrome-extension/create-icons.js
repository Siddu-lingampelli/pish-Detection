const fs = require('fs');
const path = require('path');

// Create a simple SVG icon for the extension
const createSVGIcon = (size) => {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <!-- Black background -->
  <rect width="${size}" height="${size}" fill="#000000"/>
  
  <!-- Shield outline -->
  <path d="M ${size/2} ${size*0.15} L ${size*0.8} ${size*0.3} L ${size*0.8} ${size*0.6} Q ${size*0.8} ${size*0.75} ${size/2} ${size*0.85} Q ${size*0.2} ${size*0.75} ${size*0.2} ${size*0.6} L ${size*0.2} ${size*0.3} Z" 
        fill="none" stroke="#FFFFFF" stroke-width="${size*0.08}"/>
  
  <!-- Checkmark inside shield -->
  <path d="M ${size*0.35} ${size*0.5} L ${size*0.45} ${size*0.6} L ${size*0.65} ${size*0.35}" 
        fill="none" stroke="#FFFFFF" stroke-width="${size*0.06}" stroke-linecap="round"/>
</svg>`;
};

// Create icons directory if it doesn't exist
const iconsDir = path.join(__dirname, 'icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// Create SVG icons
const sizes = [16, 48, 128];
sizes.forEach(size => {
  const svgContent = createSVGIcon(size);
  fs.writeFileSync(path.join(iconsDir, `icon${size}.svg`), svgContent);
  console.log(`✅ Created icon${size}.svg`);
});

console.log('\n📝 Note: SVG files created. For best results, convert to PNG using:');
console.log('   - Online tool: https://cloudconvert.com/svg-to-png');
console.log('   - Or use the SVG files directly (Chrome supports SVG icons)');
console.log('\n🎯 Chrome Extension icons are ready!');
