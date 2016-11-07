const TEMPLATE = 'Object is disposed';

module.exports = function create(name, fn) {
    if (name === 'constructor' || name === 'isDisposed') {
        return fn;
    }

    if (typeof fn !== 'function') {
        return fn;
    }

    return function disposableDecorator() {
        if (this.isDisposed()) {
            throw new TypeError(TEMPLATE);
        }

        return fn.apply(this, arguments);
    };
};
