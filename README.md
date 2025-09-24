# disposable-decorator

A lightweight JavaScript decorator that automatically wraps object methods to check whether an instance has been disposed before allowing method execution. Perfect for implementing the dispose pattern in JavaScript classes.

[![npm version](https://badge.fury.io/js/disposable-decorator.svg)](https://www.npmjs.com/package/disposable-decorator)
[![Build Status](https://secure.travis-ci.org/ziflex/disposable-decorator.svg?branch=master)](http://travis-ci.org/ziflex/disposable-decorator)
[![Coverage Status](https://coveralls.io/repos/github/ziflex/disposable-decorator/badge.svg?branch=master)](https://coveralls.io/github/ziflex/disposable-decorator)

## Features

- 🛡️ **Automatic disposal checks**: Prevents method calls on disposed objects
- 🎯 **Smart method filtering**: Only decorates custom methods, preserves `constructor` and `isDisposed`
- 📦 **Lightweight**: Zero dependencies, minimal footprint
- 🔧 **Flexible**: Works with any class that implements `isDisposed()` method
- ⚡ **Fast**: Minimal runtime overhead

## Installation

```bash
npm install --save disposable-decorator
```

## Quick Start

The decorator requires your class to implement an `isDisposed()` method that returns `true` when the object is disposed.

```javascript
const disposableDecorator = require('disposable-decorator');

// Your disposable class
class DatabaseConnection {
    constructor(connectionString) {
        this.connectionString = connectionString;
        this.isConnected = true;
        this._disposed = false;
    }
    
    isDisposed() {
        return this._disposed;
    }
    
    dispose() {
        this.isConnected = false;
        this._disposed = true;
    }
    
    query(sql) {
        // This method will be protected after decoration
        console.log(`Executing: ${sql}`);
        return { results: [] };
    }
    
    close() {
        this.dispose();
    }
}

// Apply the decorator to all methods
Object.getOwnPropertyNames(DatabaseConnection.prototype).forEach(name => {
    const descriptor = Object.getOwnPropertyDescriptor(DatabaseConnection.prototype, name);
    if (descriptor && typeof descriptor.value === 'function') {
        DatabaseConnection.prototype[name] = disposableDecorator(name, descriptor.value);
    }
});

// Usage
const db = new DatabaseConnection('mongodb://localhost');
db.query('SELECT * FROM users'); // Works fine

db.dispose();
db.query('SELECT * FROM users'); // Throws: TypeError: Object is disposed
```

## Usage with compose-class

```javascript
import composeClass from 'compose-class';
import DisposableMixin from 'disposable-mixin';
import disposableDecorator from 'disposable-decorator';

const Person = composeClass({
    mixins: [
        DisposableMixin()
    ],

    decorators: [
        disposableDecorator
    ],

    constructor(name) {
        this._name = name;
    },

    getName() {
        return this._name;
    },

    setName(name) {
        this._name = name;
    }
});

const instance = new Person('Mike Wazowski');

console.log(instance.getName()); // 'Mike Wazowski'

instance.dispose();

console.log(instance.getName()); // throws TypeError: 'Object is disposed'
```

## API Reference

### disposableDecorator(methodName, originalMethod)

Creates a decorated version of the provided method that checks for disposal before execution.

**Parameters:**
- `methodName` (string): The name of the method being decorated
- `originalMethod` (function): The original method to wrap

**Returns:**
- (function): The decorated method that performs disposal checks

**Behavior:**
- If `methodName` is `'constructor'` or `'isDisposed'`, returns the original method unchanged
- If `originalMethod` is not a function, returns it unchanged  
- Otherwise, returns a wrapper function that:
  1. Calls `this.isDisposed()` 
  2. Throws `TypeError('Object is disposed')` if disposed
  3. Otherwise calls the original method with original arguments

## Advanced Usage

### Manual Method Decoration

```javascript
const disposableDecorator = require('disposable-decorator');

class FileHandler {
    constructor(filename) {
        this.filename = filename;
        this._disposed = false;
    }
    
    isDisposed() {
        return this._disposed;
    }
    
    dispose() {
        this._disposed = true;
    }
    
    read() {
        return `Reading ${this.filename}`;
    }
    
    write(data) {
        return `Writing to ${this.filename}: ${data}`;
    }
}

// Manually decorate specific methods
FileHandler.prototype.read = disposableDecorator('read', FileHandler.prototype.read);
FileHandler.prototype.write = disposableDecorator('write', FileHandler.prototype.write);

const file = new FileHandler('config.json');
console.log(file.read()); // Works

file.dispose();
console.log(file.read()); // Throws: Object is disposed
```

### Using with ES6 Classes and Decorators

```javascript
const disposableDecorator = require('disposable-decorator');

function disposable(target) {
    Object.getOwnPropertyNames(target.prototype).forEach(name => {
        const descriptor = Object.getOwnPropertyDescriptor(target.prototype, name);
        if (descriptor && typeof descriptor.value === 'function') {
            target.prototype[name] = disposableDecorator(name, descriptor.value);
        }
    });
    return target;
}

@disposable
class Service {
    constructor() {
        this._disposed = false;
    }
    
    isDisposed() {
        return this._disposed;
    }
    
    dispose() {
        this._disposed = true;
    }
    
    doWork() {
        return 'Working...';
    }
}
```

## How It Works

The decorator works by:

1. **Method Inspection**: Examines the method name and type
2. **Selective Wrapping**: Only wraps functions, ignoring properties and reserved methods
3. **Runtime Checks**: Each decorated method calls `isDisposed()` before execution
4. **Error Handling**: Throws `TypeError` with message "Object is disposed" when accessed after disposal

### Reserved Methods

The following methods are never decorated:
- `constructor` - Class constructor
- `isDisposed` - Required method for disposal checking

### Method Filtering

The decorator only wraps:
- Properties that are functions
- Methods that are not in the reserved list

Non-function properties and reserved methods pass through unchanged.

## Error Handling

When a disposed object's method is called, a `TypeError` is thrown:

```javascript
try {
    disposedObject.someMethod();
} catch (error) {
    console.log(error instanceof TypeError); // true
    console.log(error.message); // "Object is disposed"
}
```

## Requirements

Your class must implement:
- `isDisposed()` method that returns a boolean indicating disposal state

## Troubleshooting

### Common Issues

**Q: Methods are not being decorated**
A: Ensure you're applying the decorator to function properties. The decorator ignores non-function properties.

**Q: `isDisposed()` throws an error after disposal**
A: The `isDisposed` method is never decorated and should always be callable, even after disposal.

**Q: Constructor is being decorated**
A: The `constructor` method is automatically excluded from decoration.

**Q: Getting "this.isDisposed is not a function"**
A: Your class must implement an `isDisposed()` method for the decorator to work.

### Debugging

Enable verbose error reporting:

```javascript
const originalDecorator = require('disposable-decorator');

function debuggingDecorator(name, fn) {
    const decorated = originalDecorator(name, fn);
    
    if (decorated === fn) {
        console.log(`Skipped decorating: ${name}`);
        return fn;
    }
    
    return function(...args) {
        console.log(`Calling decorated method: ${name}`);
        return decorated.apply(this, args);
    };
}
```

## License

MIT © [Tim Voronov](https://github.com/ziflex)
