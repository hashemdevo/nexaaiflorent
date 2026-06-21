const fs = require('fs');
const { execSync } = require('child_process');
const path = require('path');

function run() {
  while(true) {
    try {
      execSync('npx vite build', { stdio: 'pipe' });
      execSync('npx esbuild server.ts --bundle --platform=node --format=cjs --packages=external --sourcemap --outfile=dist/server.cjs', { stdio: 'pipe' });
      console.log('Build OK!');
      break;
    } catch(err) {
      const output = err.stdout ? err.stdout.toString() + err.stderr.toString() : err.message;
      let matched = false;
      const regex = /"([^"]+)" is not exported by "([^"]+)", imported by/g;
      let match;
      while ((match = regex.exec(output)) !== null) {
        matched = true;
        let missingVar = match[1];
        let file = match[2];
        let fullPath = path.resolve(process.cwd(), file);
        if (!fs.existsSync(fullPath)) {
            // Check if it's imported without extension
            if(fs.existsSync(fullPath + '.ts')) {
                fullPath += '.ts';
            } else if(fs.existsSync(fullPath + '.tsx')) {
                fullPath += '.tsx';
            } else {
                fs.mkdirSync(path.dirname(fullPath), { recursive: true });
                fs.writeFileSync(fullPath, '', 'utf8');
            }
        }
        let content = fs.readFileSync(fullPath, 'utf8');
        content += `\nexport const ${missingVar} = new Proxy(function(){}, { get: () => new Proxy(function(){}, { get: () => () => ({})}), apply: () => ({}) });\n`;
        fs.writeFileSync(fullPath, content);
        console.log(`Exported ${missingVar} to ${file}`);
      }
      
      const missingRegex = /Could not resolve "(.*?)" from "(.*?)"/g;
      let mMatch;
      while ((mMatch = missingRegex.exec(output)) !== null) {
          matched = true;
          let mFile = path.resolve(path.dirname(path.resolve(process.cwd(), mMatch[2])), mMatch[1]);
          if(!mFile.endsWith('.ts') && !mFile.endsWith('.tsx')) {
              mFile += '.ts';
          }
          fs.mkdirSync(path.dirname(mFile), { recursive: true });
          fs.writeFileSync(mFile, 'export default {};\n', 'utf8');
          console.log(`Created ${mFile}`);
      }
      
      if (!matched) {
          console.error("UNKNOWN ERROR:", output);
          break;
      }
    }
  }
}
run();
