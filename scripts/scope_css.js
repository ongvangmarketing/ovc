const fs = require('fs');
let css = fs.readFileSync('src/modules/finance/components/document-a4.css', 'utf8');

// Replace body with .document-a4-wrapper
css = css.replace(/body\s*\{/g, '.document-a4-wrapper {');
// Remove * { box-sizing: border-box; }
css = css.replace(/\*\s*\{\s*box-sizing:\s*border-box;\s*\}/g, '');
// Scope global selectors like .sheet, .topbar, etc.
// A simple way is just replacing newline followed by a class or tag selector
// Let's just use less or sass if it was available, but we can do a simple regex for top level classes
css = css.replace(/^(?!\s*\@|\s*\.document-a4-wrapper)(.*?)\{/gm, '.document-a4-wrapper $1 {');

// Wait, the regex might be tricky. Let's use a simpler approach:
// We just prefix every line that doesn't start with space, tab, @, }, or .document-a4-wrapper with .document-a4-wrapper
let lines = css.split('\n');
for (let i = 0; i < lines.length; i++) {
    let line = lines[i];
    if (line.match(/^[a-zA-Z\.]/) && !line.startsWith('.document-a4-wrapper')) {
        lines[i] = '.document-a4-wrapper ' + line;
    }
}
fs.writeFileSync('src/modules/finance/components/document-a4.css', lines.join('\n'));
