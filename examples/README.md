# Examples

This directory contains practical examples demonstrating different ways to use `disposable-decorator`.

## Running the Examples

From the root directory of the project:

```bash
# Run basic usage example
node examples/basic-usage.js

# Run manual decoration example  
node examples/manual-decoration.js

# Run compose-class example (requires compose-class to be installed)
npm install compose-class  # optional
node examples/compose-class-usage.js
```

## Example Files

### `basic-usage.js`
Demonstrates the most common usage pattern:
- Creating a disposable class with `isDisposed()` and `dispose()` methods
- Applying the decorator to all methods at once
- How methods behave before and after disposal

### `manual-decoration.js`
Shows how to selectively decorate specific methods:
- Manually choosing which methods to protect
- Leaving some methods undecorated (internal helpers, utilities)
- Understanding method filtering behavior

### `compose-class-usage.js`
Demonstrates integration with the `compose-class` library:
- Using mixins for disposable functionality
- Automatic decorator application through class composition
- Advanced class construction patterns

## Key Concepts Demonstrated

1. **Required Interface**: Your class must implement `isDisposed()` method
2. **Method Filtering**: Constructor and `isDisposed` are never decorated
3. **Selective Decoration**: You can choose which methods to protect
4. **Error Handling**: Disposed objects throw `TypeError` when methods are called
5. **Integration**: Works with various class construction patterns

## Tips for Your Own Code

- Always implement `isDisposed()` method
- Consider which methods should be protected vs. utility methods
- Use the full decoration approach for most cases
- Use manual decoration when you need fine-grained control
- Remember that `dispose()` itself can be decorated (and usually should be)