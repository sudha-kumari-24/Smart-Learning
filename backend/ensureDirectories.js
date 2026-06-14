const fs = require('fs');
const path = require('path');

const baseDir = process.cwd();
console.log('Base directory:', baseDir);

const directories = [
 
  path.join(baseDir, 'frontend', 'src', 'assets', 'users_interview'),
  
 
  path.join(baseDir, 'backend', 'assets', 'users_interview'),
  
 
  path.join(baseDir, 'backend', 'posture_logs'),
  path.join(baseDir, 'backend', 'videos')
];

directories.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`✅ Created directory: ${dir}`);
  } else {
    console.log(`📁 Directory exists: ${dir}`);
  }
});

console.log('\n🎯 All directories are ready!');