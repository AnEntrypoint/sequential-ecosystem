# @sequentialos/validation

Comprehensive validation and sanitization utilities for Sequential OS.

## Installation

This package is part of the Sequential OS monorepo and is available as a workspace package.

```javascript
import { validateTaskName, sanitizeInput } from '@sequentialos/validation';
```

## Features

- Path validation (relative paths, traversal prevention)
- Task name validation (kebab-case enforcement)
- File name safety checks
- Required field validation
- Type checking
- Schema-based validation
- Metadata sanitization
- HTML escaping (XSS prevention)
- Input sanitization

## API Reference

All validation functions return a result object with the following structure:

```javascript
{
  valid: boolean,
  error?: string,      // Present when valid is false
  data?: any,          // Present for sanitization functions
  errors?: object      // Present for schema validation
}
```

### validatePathRelative(path)

Validates that a path is relative (not absolute) and doesn't contain traversal sequences.

```javascript
validatePathRelative('foo/bar.txt')
// => { valid: true }

validatePathRelative('../etc/passwd')
// => { valid: false, error: 'Path traversal sequences (..) are not allowed' }

validatePathRelative('/etc/passwd')
// => { valid: false, error: 'Path must be relative, not absolute' }
```

### validateTaskName(name)

Validates task names are in kebab-case format (lowercase, numbers, hyphens only).

```javascript
validateTaskName('my-task-name')
// => { valid: true }

validateTaskName('my task name')
// => { valid: false, error: 'Task name must not contain spaces (use kebab-case)' }

validateTaskName('MyTaskName')
// => { valid: false, error: 'Task name must be kebab-case (lowercase letters, numbers, and hyphens only)' }
```

### validateFileName(name)

Validates file names for safety (no path separators, no reserved names, no dangerous characters).

```javascript
validateFileName('document.txt')
// => { valid: true }

validateFileName('path/to/file.txt')
// => { valid: false, error: 'File name cannot contain path separators' }

validateFileName('CON.txt')
// => { valid: false, error: 'File name "CON.txt" is reserved by the system' }
```

### validateRequired(value, fieldName)

Checks if a required field is present and not empty.

```javascript
validateRequired('hello', 'username')
// => { valid: true }

validateRequired(null, 'username')
// => { valid: false, error: 'username is required' }

validateRequired('   ', 'username')
// => { valid: false, error: 'username cannot be empty' }
```

### validateType(value, expectedType, fieldName)

Validates that a value matches the expected type.

```javascript
validateType('hello', 'string', 'message')
// => { valid: true }

validateType(123, 'string', 'message')
// => { valid: false, error: 'message must be of type string, got number' }

validateType([1,2,3], 'array', 'items')
// => { valid: true }
```

Supported types: `string`, `number`, `boolean`, `object`, `array`, `function`

### validateInputSchema(input, schema)

Validates an input object against a schema definition.

```javascript
const schema = {
  email: {
    required: true,
    type: 'string',
    validator: (val) => val.includes('@'),
    message: 'Email must contain @'
  },
  age: {
    required: false,
    type: 'number',
    validator: (val) => val > 0 && val < 150,
    message: 'Age must be between 0 and 150'
  }
};

validateInputSchema({ email: 'user@example.com', age: 25 }, schema)
// => { valid: true }

validateInputSchema({ email: 'notanemail' }, schema)
// => { valid: false, error: 'Validation failed', errors: { email: 'Email must contain @' } }
```

Schema field options:
- `required`: boolean - Whether the field is required
- `type`: string - Expected type (string, number, boolean, object, array, function)
- `validator`: function - Custom validation function that returns boolean
- `message`: string - Custom error message for validator failures

### validateAndSanitizeMetadata(metadata)

Cleans and validates metadata objects, removing dangerous properties.

```javascript
validateAndSanitizeMetadata({ key: 'value', num: 42 })
// => { valid: true, data: { key: 'value', num: 42 } }

validateAndSanitizeMetadata({ constructor: 'bad' })
// => { valid: false, error: 'Metadata key "constructor" is not allowed' }

validateAndSanitizeMetadata({ key: () => {} })
// => { valid: false, error: 'Metadata value for "key" cannot be a function' }
```

Protection against:
- Prototype pollution (`__proto__`, `constructor`, `prototype`)
- Function injection
- Deep object nesting
- Non-primitive array values

### escapeHtml(text)

Escapes HTML entities to prevent XSS attacks.

```javascript
escapeHtml('<script>alert("XSS")</script>')
// => { valid: true, data: '&lt;script&gt;alert(&quot;XSS&quot;)&lt;&#x2F;script&gt;' }

escapeHtml('Hello & goodbye')
// => { valid: true, data: 'Hello &amp; goodbye' }
```

### sanitizeInput(input)

Removes dangerous characters from input strings.

```javascript
sanitizeInput('  hello world  ')
// => { valid: true, data: 'hello world' }

sanitizeInput('hello\x00world\x01')
// => { valid: true, data: 'helloworld' }
```

Removes:
- Null bytes
- Control characters (except newline, tab, carriage return)
- Leading/trailing whitespace

## Helper Functions

### throwValidationError(message, field)

Throws a validation error using `@sequentialos/error-handling`.

```javascript
throwValidationError('Invalid email format', 'email')
// throws AppError with code 'VALIDATION_ERROR' and statusCode 400
```

### validateOrThrow(validationResult, field)

Validates a result and throws if invalid.

```javascript
const result = validateTaskName('invalid name');
validateOrThrow(result, 'taskName');
// throws if validation failed
```

## Integration with Error Handling

This package integrates with `@sequentialos/error-handling` for consistent error responses:

```javascript
import { validateOrThrow, validateTaskName } from '@sequentialos/validation';

function createTask(name) {
  validateOrThrow(validateTaskName(name), 'taskName');
  // ... proceed with task creation
}
```

## Edge Cases Handled

- `null` and `undefined` values
- Empty strings (with and without whitespace)
- Empty arrays and objects
- Type coercion prevention
- Windows reserved file names
- Path traversal attempts
- Prototype pollution
- XSS injection
- Control characters

## License

MIT
