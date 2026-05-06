const fs = require('fs');
const path = require('path');

function replaceInFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');

    // Mappings from text-white to text-gray-900 where appropriate
    // We will do a generic regex replace, but we only want to change it on standard elements:
    
    content = content.replace(/className="([^"]*?)"/g, (match, classNames) => {
        // If the class contains button backgrounds, keep text-white
        if (classNames.includes('bg-primary') || 
            classNames.includes('bg-secondary') || 
            classNames.includes('bg-rose') || 
            classNames.includes('from-secondary-500') ||
            classNames.includes('bg-gray-900') ) {
            
            // If it already has text-white, leave it
            return match;
        } else {
            // Replace text-white with text-gray-900
            return `className="${classNames.replace(/\btext-white\b/g, 'text-gray-900').replace(/\btext-white\/([0-9]+)\b/g, 'text-gray-900/$1')}"`;
        }
    });

    fs.writeFileSync(filePath, content, 'utf8');
}

const walkDirectories = (dir) => {
    fs.readdirSync(dir).forEach(file => {
        let fullPath = path.join(dir, file);
        if (fs.lstatSync(fullPath).isDirectory()) {
            walkDirectories(fullPath);
        } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
            replaceInFile(fullPath);
        }
    });
};

walkDirectories('./src');
