const fs = require('fs');
const path = require('path');

function walk(dir) {
    let results = [];
    if (!fs.existsSync(dir)) return results;
    const list = fs.readdirSync(dir);
    list.forEach(function(file) {
        file = dir + '/' + file;
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) { 
            results = results.concat(walk(file));
        } else if (file.endsWith('.ts') || file.endsWith('.tsx')) { 
            results.push(file);
        }
    });
    return results;
}

const files = [...walk('src/app'), ...walk('src/lib/automation')];

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let original = content;
    
    // Replace aliases
    content = content.replace(/@\/modules\/workflow\/services/g, '@/lib/automation');
    content = content.replace(/@\/modules\/workflow\/types/g, '@/lib/automation/types');
    content = content.replace(/@\/modules\/workflow\/actions/g, '@/app/(workspace)/workspace/automations/reminders/_actions');
    content = content.replace(/@\/modules\/workflow\/components/g, '@/app/(workspace)/workspace/automations/reminders/_components');
    
    // Fix relative paths that broke after moving components
    content = content.replace(/\.\.\/types\/workflow\.types/g, '@/lib/automation/types/workflow.types');
    
    if (content !== original) {
        fs.writeFileSync(file, content, 'utf8');
        console.log('Fixed', file);
    }
});
