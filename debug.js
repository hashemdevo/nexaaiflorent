const fs = require('fs');
console.log('cwd:', process.cwd());
console.log('files:', fs.readdirSync(process.cwd()));
