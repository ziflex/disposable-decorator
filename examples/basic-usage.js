/**
 * Basic usage example of disposable-decorator
 * 
 * This example shows how to use the decorator with a simple class
 * that manages a database connection.
 */

const disposableDecorator = require('../src/index');

// Example class that implements the disposable pattern
class DatabaseConnection {
    constructor(connectionString) {
        this.connectionString = connectionString;
        this.isConnected = true;
        this._disposed = false;
        console.log(`Connected to: ${connectionString}`);
    }
    
    // Required method for disposable decorator
    isDisposed() {
        return this._disposed;
    }
    
    // Disposal method
    dispose() {
        if (!this._disposed) {
            this.isConnected = false;
            this._disposed = true;
            console.log('Database connection disposed');
        }
    }
    
    // Methods that will be decorated
    query(sql) {
        console.log(`Executing query: ${sql}`);
        return { results: [{ id: 1, name: 'John' }] };
    }
    
    insert(table, data) {
        console.log(`Inserting into ${table}:`, data);
        return { insertId: Math.floor(Math.random() * 1000) };
    }
    
    close() {
        console.log('Closing connection...');
        this.dispose();
    }
}

// Apply the disposable decorator to all methods
function applyDisposableDecorator(targetClass) {
    Object.getOwnPropertyNames(targetClass.prototype).forEach(name => {
        const descriptor = Object.getOwnPropertyDescriptor(targetClass.prototype, name);
        if (descriptor && typeof descriptor.value === 'function') {
            targetClass.prototype[name] = disposableDecorator(name, descriptor.value);
        }
    });
}

// Decorate the class
applyDisposableDecorator(DatabaseConnection);

// Demo usage
console.log('=== Disposable Decorator Basic Usage Demo ===\n');

const db = new DatabaseConnection('postgresql://localhost:5432/mydb');

console.log('\n--- Before disposal ---');
try {
    const result = db.query('SELECT * FROM users');
    console.log('Query result:', result);
    
    const insertResult = db.insert('users', { name: 'Alice', email: 'alice@example.com' });
    console.log('Insert result:', insertResult);
} catch (error) {
    console.error('Error:', error.message);
}

console.log('\n--- After disposal ---');
db.dispose();

try {
    console.log('Attempting to query after disposal...');
    db.query('SELECT * FROM users');
} catch (error) {
    console.error('✓ Expected error:', error.message);
}

try {
    console.log('Attempting to insert after disposal...');
    db.insert('users', { name: 'Bob' });
} catch (error) {
    console.error('✓ Expected error:', error.message);
}

// Note: isDisposed() should still work after disposal
console.log('\n--- isDisposed() check ---');
console.log('Is disposed?', db.isDisposed()); // Should return true without throwing