const fs = require('fs');
const path = require('path');

function replaceInFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');

    content = content.replace(/Karlien Muller/g, 'MarcaJá');
    content = content.replace(/Hair Studio/g, 'Agendamentos');
    content = content.replace(/Hair/g, 'Appointments');
    
    // Also change some primary UI text:
    
    // Check if the file is index.html
    if (filePath.endsWith('index.html')) {
        content = content.replace(/Karlien Muller Hair/g, 'MarcaJá');
        content = content.replace(/Karlien Muller/g, 'MarcaJá');
    }

    fs.writeFileSync(filePath, content, 'utf8');
}

const walkDirectories = (dir) => {
    fs.readdirSync(dir).forEach(file => {
        let fullPath = path.join(dir, file);
        if (fs.lstatSync(fullPath).isDirectory()) {
            walkDirectories(fullPath);
        } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts') || fullPath.endsWith('.json') || fullPath.endsWith('.html')) {
            replaceInFile(fullPath);
        }
    });
};

walkDirectories('./src');
if (fs.existsSync('./index.html')) replaceInFile('./index.html');
