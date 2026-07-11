const fs = require('fs');
let content = fs.readFileSync('src/lib/modules/registry.tsx', 'utf8');

// Replace all href: "/..." with href: "/workspace/..."
// Except if it already has /workspace/
content = content.replace(/href:\s*["']\/([^"']+)["']/g, (match, p1) => {
  if (p1.startsWith('workspace/')) return match;
  return `href: "/workspace/${p1}"`;
});

fs.writeFileSync('src/lib/modules/registry.tsx', content);
console.log("Fixed registry.tsx");
