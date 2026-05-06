const fs = require('fs');
const path = require('path');

function replaceInFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');

    // Mappings from dark theme classes to light theme classes
    content = content
        // Borders
        .replace(/border-charcoal-700\/50/g, 'border-gray-200/50')
        .replace(/border-charcoal-700/g, 'border-gray-200')
        .replace(/border-charcoal-600/g, 'border-gray-300')
        // Backgrounds
        .replace(/bg-charcoal-950\/80/g, 'bg-gray-100/90')
        .replace(/bg-charcoal-900\/50/g, 'bg-white/50')
        .replace(/bg-charcoal-900\/30/g, 'bg-white/30')
        .replace(/bg-charcoal-900\/80/g, 'bg-white/80')
        .replace(/bg-[A-Za-z0-9_-]+-from-charcoal-[0-9]+/g, function(match){ return match.replace('charcoal', 'gray'); })
        .replace(/bg-charcoal-900/g, 'bg-white')
        .replace(/bg-charcoal-800\/50/g, 'bg-gray-50/50')
        .replace(/bg-charcoal-800\/30/g, 'bg-gray-50/30')
        .replace(/bg-charcoal-800\/80/g, 'bg-gray-50/80')
        .replace(/bg-charcoal-800\/90/g, 'bg-gray-50/90')
        .replace(/bg-charcoal-800/g, 'bg-gray-50')
        .replace(/bg-charcoal-700\/50/g, 'bg-gray-100/50')
        .replace(/bg-charcoal-700/g, 'bg-gray-100')
        .replace(/bg-charcoal-600/g, 'bg-gray-200')
        // Texts
        .replace(/text-charcoal-100/g, 'text-gray-900')
        .replace(/text-charcoal-200/g, 'text-gray-800')
        .replace(/text-charcoal-300/g, 'text-gray-700')
        .replace(/text-charcoal-400/g, 'text-gray-600')
        .replace(/text-charcoal-500/g, 'text-gray-500')
        .replace(/text-charcoal-600/g, 'text-gray-400')
        .replace(/text-charcoal-700/g, 'text-gray-400')
        
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
