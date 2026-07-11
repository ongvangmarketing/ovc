const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  if (!fs.existsSync(dir)) return;
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(dirPath);
  });
}

function moveFolder(src, dest) {
  if (fs.existsSync(src)) {
    fs.renameSync(src, dest);
    console.log(`Moved ${src} -> ${dest}`);
  }
}

// 1. Move actions out of app
moveFolder('src/app/actions', 'src/actions');

// 2. Create Route Groups
const groups = ['(tools)', '(admin)', '(frontend)', '(workspace)'];
groups.forEach(g => {
  const p = path.join('src/app', g);
  if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true });
});

// 3. Move into (tools)
const tools = ['builder', 'document', 'embed', 'share', 'shared', 'uploads'];
tools.forEach(t => moveFolder(path.join('src/app', t), path.join('src/app/(tools)', t)));

// 4. Move into (admin)
const admins = ['admin', 'super-admin'];
admins.forEach(a => moveFolder(path.join('src/app', a), path.join('src/app/(admin)', a)));

// 5. Move into (frontend)
const frontends = ['booking', 'tralist'];
frontends.forEach(f => moveFolder(path.join('src/app', f), path.join('src/app/(frontend)', f)));

// 6. Move into (workspace)
moveFolder('src/app/workspace', 'src/app/(workspace)/workspace');

// 7. Update imports globally
const replacements = [
  ['@/app/actions', '@/actions'],
  ...tools.map(t => [`@/app/${t}`, `@/app/(tools)/${t}`]),
  ...admins.map(a => [`@/app/${a}`, `@/app/(admin)/${a}`]),
  ...frontends.map(f => [`@/app/${f}`, `@/app/(frontend)/${f}`]),
  ['@/app/workspace', `@/app/(workspace)/workspace`]
];

function replaceInFile(filePath, replacements) {
  if (filePath.endsWith('.tsx') || filePath.endsWith('.ts') || filePath.endsWith('.js')) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;
    
    for (const [from, to] of replacements) {
      // Basic string replacement for imports. Using literal matching.
      content = content.replace(new RegExp(from.replace(/[/.]/g, '\\$&'), 'g'), to);
    }
    
    if (content !== original) {
      fs.writeFileSync(filePath, content);
      console.log(`Updated imports in ${filePath}`);
    }
  }
}

walkDir('src', (f) => replaceInFile(f, replacements));
console.log('Refactoring complete!');
