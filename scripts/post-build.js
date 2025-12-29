/**
 * Post-build script to ensure global exports are properly set
 */

const fs = require('fs');
const path = require('path');

const mainJsPath = path.join(__dirname, '../build/0_main.js');

// Read the bundled file
let content = fs.readFileSync(mainJsPath, 'utf-8');

// Check if initialization code already exists
if (!content.includes('// POST-BUILD INITIALIZATION')) {
    // Append initialization code at the end (before the closing IIFE paren if any)
    const initCode = `

// POST-BUILD INITIALIZATION
// Ensure initializeGasAppFramework is called if not already done
if (typeof initializeGasAppFramework === 'function') {
    initializeGasAppFramework();
}
`;

    content += initCode;

    fs.writeFileSync(mainJsPath, content, 'utf-8');
    console.log('✅ Post-build: Added global initialization to 0_main.js');
} else {
    console.log('ℹ️  Post-build: Initialization code already present');
}
