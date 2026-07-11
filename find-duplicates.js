const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

function walkDir(dir, callback) {
  if (!fs.existsSync(dir)) return;
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    if (fs.statSync(dirPath).isDirectory()) {
      walkDir(dirPath, callback);
    } else {
      if (dirPath.endsWith('.tsx') || dirPath.endsWith('.ts')) {
        callback(dirPath);
      }
    }
  });
}

const hashes = {};
const duplicates = [];

walkDir('src', (filePath) => {
  // Normalize whitespace to find logical duplicates
  const content = fs.readFileSync(filePath, 'utf8').replace(/\s+/g, '');
  if (content.length < 50) return; // ignore very small files like empty types
  
  const hash = crypto.createHash('sha256').update(content).digest('hex');
  if (hashes[hash]) {
    hashes[hash].push(filePath);
  } else {
    hashes[hash] = [filePath];
  }
});

for (const [hash, files] of Object.entries(hashes)) {
  if (files.length > 1) {
    duplicates.push(files);
  }
}

console.log(JSON.stringify(duplicates, null, 2));
