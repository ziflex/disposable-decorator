/**
 * Error message thrown when trying to call methods on a disposed object
 * @constant {string}
 */
const TEMPLATE = 'Object is disposed';

/**
 * Creates a disposable decorator for object methods.
 *
 * The decorator wraps methods to check if the object has been disposed before
 * allowing method execution. If the object is disposed (isDisposed() returns true),
 * a TypeError is thrown.
 *
 * @param {string} name - The name of the method being decorated
 * @param {*} fn - The method or property to potentially decorate
 * @returns {*} The original function/property or a decorated version
 *
 * @example
 * // Decorate a single method
 * MyClass.prototype.myMethod = disposableDecorator('myMethod', MyClass.prototype.myMethod);
 *
 * @example
 * // Decorate all methods in a class
 * Object.getOwnPropertyNames(MyClass.prototype).forEach(name => {
 *   const descriptor = Object.getOwnPropertyDescriptor(MyClass.prototype, name);
 *   if (descriptor && typeof descriptor.value === 'function') {
 *     MyClass.prototype[name] = disposableDecorator(name, descriptor.value);
 *   }
 * });
 */
module.exports = function create(name, fn) {
    // Skip reserved methods that should never be decorated
    if (name === 'constructor' || name === 'isDisposed') {
        return fn;
    }

    // Only decorate functions, pass through other property types unchanged
    if (typeof fn !== 'function') {
        return fn;
    }

    // Return the decorated function that performs disposal checks
    return function disposableDecorator() {
        // Check if the object has been disposed
        if (this.isDisposed()) {
            throw new TypeError(TEMPLATE);
        }

        // Object is not disposed, call the original method
        return fn.apply(this, arguments);
    };
};
