/**
 * Manual method decoration example
 * 
 * This example shows how to selectively decorate specific methods
 * rather than decorating all methods at once.
 */

const disposableDecorator = require('../src/index');

class FileManager {
    constructor(basePath) {
        this.basePath = basePath;
        this._disposed = false;
        this.openFiles = new Set();
    }
    
    isDisposed() {
        return this._disposed;
    }
    
    dispose() {
        if (!this._disposed) {
            // Close all open files before disposing
            this.openFiles.forEach(file => {
                console.log(`Force closing file: ${file}`);
            });
            this.openFiles.clear();
            this._disposed = true;
            console.log('FileManager disposed');
        }
    }
    
    // Public API methods that should be protected
    openFile(filename) {
        const fullPath = `${this.basePath}/${filename}`;
        this.openFiles.add(filename);
        console.log(`Opened file: ${fullPath}`);
        return { handle: fullPath, size: 1024 };
    }
    
    readFile(filename) {
        if (!this.openFiles.has(filename)) {
            throw new Error(`File not open: ${filename}`);
        }
        console.log(`Reading file: ${filename}`);
        return `Content of ${filename}`;
    }
    
    writeFile(filename, content) {
        if (!this.openFiles.has(filename)) {
            throw new Error(`File not open: ${filename}`);
        }
        console.log(`Writing to file: ${filename}`);
        return content.length;
    }
    
    closeFile(filename) {
        if (this.openFiles.has(filename)) {
            this.openFiles.delete(filename);
            console.log(`Closed file: ${filename}`);
        }
    }
    
    // Internal helper method that we don't want to decorate
    _validatePath(path) {
        return path && typeof path === 'string';
    }
    
    // Utility method that should work even after disposal
    getBasePath() {
        return this.basePath;
    }
}

// Manually decorate only the methods we want to protect
console.log('=== Manual Method Decoration Demo ===\n');

console.log('Decorating specific methods...');
const methodsToDecorate = ['openFile', 'readFile', 'writeFile', 'closeFile'];

methodsToDecorate.forEach(methodName => {
    const originalMethod = FileManager.prototype[methodName];
    FileManager.prototype[methodName] = disposableDecorator(methodName, originalMethod);
    console.log(`✓ Decorated method: ${methodName}`);
});

console.log('\n--- Testing decorated FileManager ---');

const fileManager = new FileManager('/tmp/documents');

console.log('\n--- Before disposal ---');
try {
    fileManager.openFile('config.json');
    fileManager.writeFile('config.json', '{"theme": "dark"}');
    const content = fileManager.readFile('config.json');
    console.log('File content:', content);
    
    // These methods should still work (not decorated)
    console.log('Base path:', fileManager.getBasePath());
    console.log('Path validation:', fileManager._validatePath('/some/path'));
    
} catch (error) {
    console.error('Error:', error.message);
}

console.log('\n--- After disposal ---');
fileManager.dispose();

// Test decorated methods (should throw)
const protectedMethods = ['openFile', 'readFile', 'writeFile', 'closeFile'];
protectedMethods.forEach(methodName => {
    try {
        console.log(`Attempting to call ${methodName}...`);
        fileManager[methodName]('test.txt', 'test content');
    } catch (error) {
        console.error(`✓ ${methodName} correctly blocked:`, error.message);
    }
});

// Test non-decorated methods (should still work)
console.log('\n--- Non-decorated methods after disposal ---');
try {
    console.log('Base path (not decorated):', fileManager.getBasePath());
    console.log('Path validation (not decorated):', fileManager._validatePath('test'));
    console.log('Is disposed?', fileManager.isDisposed());
} catch (error) {
    console.error('Unexpected error:', error.message);
}

console.log('\n--- Summary ---');
console.log('✓ Decorated methods are protected after disposal');
console.log('✓ Non-decorated methods continue to work');
console.log('✓ isDisposed() always works (automatically excluded)');