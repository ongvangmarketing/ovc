const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

function walkDir(dir, callback) {
  if (!fs.existsSync(dir)) return;
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(dirPath);
  });
}

console.log('Starting reversion to Route Groups...');

// 1. Delete Thin Router proxy folders in src/app
const proxyFolders = [
  'ongvang', 'ongvangai', 'ongvangcomvn', 'ongvangnew', 'sites', 'preview',
  'agent', 'customer', 'instructor', 'student',
  '[orgSlug]'
];

proxyFolders.forEach(folder => {
  const p = path.join('src/app', folder);
  if (fs.existsSync(p)) {
    fs.rmSync(p, { recursive: true, force: true });
    console.log(`Deleted proxy folder: ${p}`);
  }
});

// 2. Create Route Group directories
const groups = ['(frontend)', '(portals)', '(workspace)'];
groups.forEach(g => {
  const p = path.join('src/app', g);
  if (!fs.existsSync(p)) {
    fs.mkdirSync(p, { recursive: true });
    console.log(`Created Route Group: ${p}`);
  }
});

// 3. Move contents back
function moveContents(srcDir, destDir) {
  if (fs.existsSync(srcDir)) {
    fs.readdirSync(srcDir).forEach(item => {
      const srcPath = path.join(srcDir, item);
      const destPath = path.join(destDir, item);
      fs.renameSync(srcPath, destPath);
      console.log(`Moved ${srcPath} -> ${destPath}`);
    });
    fs.rmSync(srcDir, { recursive: true, force: true });
  }
}

moveContents('src/frontend', 'src/app/(frontend)');
moveContents('src/portals', 'src/app/(portals)');
moveContents('src/workspace', 'src/app/(workspace)');

// 4. Update internal absolute imports across the whole project
function replaceInFile(filePath, replacements) {
  if (filePath.endsWith('.tsx') || filePath.endsWith('.ts') || filePath.endsWith('.js')) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;
    
    for (const [from, to] of replacements) {
      content = content.replace(new RegExp(from, 'g'), to);
    }
    
    if (content !== original) {
      fs.writeFileSync(filePath, content);
    }
  }
}

const importReplacements = [
  ['@/frontend/', '@/app/(frontend)/'],
  ['@/portals/', '@/app/(portals)/'],
  ['@/workspace/', '@/app/(workspace)/']
];

walkDir('src', (f) => replaceInFile(f, importReplacements));

console.log('Reversion complete! Welcome back to Route Groups.');
