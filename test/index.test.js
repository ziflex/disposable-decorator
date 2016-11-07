/* eslint-disable global-require, no-unused-expressions, import/no-extraneous-dependencies */
import { expect } from 'chai';
import forEach from 'lodash.foreach';
import keys from 'lodash.keys';
import Decorator from '../src/index';

let Disposable = null;

beforeEach(() => {
    Disposable = function DisposableClass() {
        this._isDisposed = false;
    };

    Disposable.prototype.isDisposed = function isDisposed() {
        return this._isDisposed;
    };

    Disposable.prototype.dispose = function dispose() {
        this._isDisposed = true;
        return this;
    };
});

it('should create decorator for non-reserved methods', () => {
    Disposable.prototype.set = function set(key, value) {
        this[`_${key}`] = value;
    };

    Disposable.prototype.get = function set(key) {
        return this[`_${key}`];
    };

    forEach(keys(Disposable.prototype), (key) => {
        Disposable.prototype[key] = Decorator(key, Disposable.prototype[key]);
    });

    const instance = new Disposable();

    expect(() => {
        instance.set('foo', 'bar');
    }).to.not.throw(Error);

    expect(() => {
        instance.get('foo');
    }).to.not.throw(Error);

    instance.dispose();

    expect(() => {
        instance.set('foo', 'bar');
    }).to.throw(Error);

    expect(() => {
        instance.get('foo');
    }).to.throw(Error);
});

it('should not create decorator for reserved methods', () => {
    forEach(keys(Disposable.prototype), (key) => {
        Disposable.prototype[key] = Decorator(key, Disposable.prototype[key]);
    });

    const instance = new Disposable();

    instance.dispose();

    expect(() => {
        instance.isDisposed();
    }).to.not.throw(Error);
});

it('should not create decorator for non-function prototype properties', () => {
    Disposable.prototype.key = 'value';

    forEach(keys(Disposable.prototype), (key) => {
        Disposable.prototype[key] = Decorator(key, Disposable.prototype[key]);
    });

    const instance = new Disposable();

    expect(instance.key).to.eql('value');
});

it('should create decorator for "dispose"', () => {
    forEach(keys(Disposable.prototype), (key) => {
        Disposable.prototype[key] = Decorator(key, Disposable.prototype[key]);
    });

    const instance = new Disposable();

    instance.dispose();

    expect(() => {
        instance.dispose();
    }).to.throw(Error);
});

it('should be exported as "commonjs" module', () => {
    const decorator = require('../src/index');

    expect(typeof decorator === 'function').to.be.true;
});
