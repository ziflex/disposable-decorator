# disposable-decorator

Wraps all custom type methods for checking whether an instance of the type is disposed.

[![npm version](https://badge.fury.io/js/disposable-decorator.svg)](https://www.npmjs.com/package/disposable-decorator)
[![Build Status](https://secure.travis-ci.org/ziflex/disposable-decorator.svg?branch=master)](http://travis-ci.org/ziflex/disposable-decorator)
[![Coverage Status](https://coveralls.io/repos/github/ziflex/disposable-decorator/badge.svg?branch=master)](https://coveralls.io/github/ziflex/disposable-decorator)

````sh
    npm install --save disposable-decorator
````

## Usage

````javascript

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

    console.log(instance.getName()); // error 'Object is disposed'

````
