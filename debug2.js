const fs = require('fs');
console.log('files:', fs.readdirSync(process.cwd()));
console.log('parent:', fs.readdirSync('/app'));
console.log('root:', fs.readdirSync('/'));
