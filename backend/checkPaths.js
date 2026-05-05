const path = require('path');

console.log('__dirname (interviewRoutes.js location):', __dirname);
console.log('Process CWD:', process.cwd());

console.log('\nTesting paths from interviewRoutes.js:');
console.log('path.join(__dirname, "../assets/users_interview"):', 
  path.join(__dirname, '../assets/users_interview'));
  
console.log('path.join(__dirname, "../../frontend/src/assets/users_interview"):', 
  path.join(__dirname, '../../frontend/src/assets/users_interview'));