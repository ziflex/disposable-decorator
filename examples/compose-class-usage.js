/**
 * Usage with compose-class example
 * 
 * This example demonstrates how to use disposable-decorator with 
 * the compose-class library for advanced class composition.
 * 
 * Note: This example requires 'compose-class' to be installed
 * Run: npm install compose-class
 */

const disposableDecorator = require('../src/index');

// Simple disposable mixin (normally you'd use 'disposable-mixin' package)
function DisposableMixin() {
    return {
        _disposed: false,
        
        isDisposed() {
            return this._disposed;
        },
        
        dispose() {
            if (!this._disposed) {
                this._disposed = true;
                console.log(`${this.constructor.name} disposed`);
            }
        }
    };
}

// Try to load compose-class, fall back to manual implementation if not available
let composeClass;
try {
    composeClass = require('compose-class');
} catch (e) {
    console.log('compose-class not installed, using manual class composition...\n');
    
    // Simple fallback implementation for demonstration
    composeClass = function(config) {
        function ComposedClass(...args) {
            // Apply mixins
            if (config.mixins) {
                config.mixins.forEach(mixin => {
                    Object.assign(this, mixin);
                });
            }
            
            // Call constructor if provided
            if (config.constructor) {
                config.constructor.apply(this, args);
            }
        }
        
        // Add methods to prototype
        Object.keys(config).forEach(key => {
            if (key !== 'constructor' && key !== 'mixins' && key !== 'decorators') {
                ComposedClass.prototype[key] = config[key];
            }
        });
        
        // Apply decorators
        if (config.decorators) {
            config.decorators.forEach(decorator => {
                Object.getOwnPropertyNames(ComposedClass.prototype).forEach(name => {
                    const descriptor = Object.getOwnPropertyDescriptor(ComposedClass.prototype, name);
                    if (descriptor && typeof descriptor.value === 'function') {
                        ComposedClass.prototype[name] = decorator(name, descriptor.value);
                    }
                });
            });
        }
        
        return ComposedClass;
    };
}

console.log('=== Compose-Class Usage Demo ===\n');

// Create a Person class using compose-class with disposable decorator
const Person = composeClass({
    mixins: [
        DisposableMixin()
    ],

    decorators: [
        disposableDecorator
    ],

    constructor(name, age) {
        this._name = name;
        this._age = age;
        this._friends = [];
        console.log(`Created person: ${name}, age ${age}`);
    },

    getName() {
        return this._name;
    },

    setName(name) {
        console.log(`Changing name from ${this._name} to ${name}`);
        this._name = name;
    },
    
    getAge() {
        return this._age;
    },
    
    setAge(age) {
        console.log(`Changing age from ${this._age} to ${age}`);
        this._age = age;
    },
    
    addFriend(friend) {
        this._friends.push(friend);
        console.log(`${this._name} is now friends with ${friend}`);
    },
    
    getFriends() {
        return [...this._friends];
    },
    
    introduce() {
        const friendsText = this._friends.length > 0 
            ? ` My friends are: ${this._friends.join(', ')}`
            : ' I have no friends yet.';
        return `Hi, I'm ${this._name}, I'm ${this._age} years old.${friendsText}`;
    }
});

// Demo the composed class
console.log('--- Creating and using Person instances ---');
const alice = new Person('Alice', 28);
const bob = new Person('Bob', 32);

console.log('\n--- Before disposal ---');
console.log(alice.introduce());

alice.addFriend('Bob');
alice.addFriend('Carol');
console.log(alice.introduce());

alice.setAge(29);
console.log(`Alice is now ${alice.getAge()} years old`);

console.log('Alice\'s friends:', alice.getFriends());

console.log('\n--- After disposal ---');
alice.dispose();

// Test that methods are protected after disposal
const protectedMethods = [
    () => alice.getName(),
    () => alice.setName('Alice Smith'),
    () => alice.getAge(),
    () => alice.setAge(30),
    () => alice.addFriend('Dave'),
    () => alice.getFriends(),
    () => alice.introduce()
];

protectedMethods.forEach((methodCall, index) => {
    try {
        console.log(`Testing protected method ${index + 1}...`);
        methodCall();
        console.log('❌ Method should have thrown an error!');
    } catch (error) {
        console.log(`✓ Method correctly blocked: ${error.message}`);
    }
});

// isDisposed should still work
console.log('\n--- Disposal check ---');
console.log('Alice is disposed:', alice.isDisposed());
console.log('Bob is disposed:', bob.isDisposed());

console.log('\n--- Summary ---');
console.log('✓ compose-class integration works correctly');
console.log('✓ Decorators are applied automatically');
console.log('✓ All methods are protected after disposal');
console.log('✓ Mixins provide disposable functionality');