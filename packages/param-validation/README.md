# @sequential/param-validation

Parameter and input validation middleware with reusable validation chains and error reporting.

## Installation

```bash
npm install @sequential/param-validation
```

## Usage

```javascript
import {{ middleware }} from '@sequential/param-validation';
import express from 'express';

const app = express();
app.use(middleware());
```

## Configuration

```javascript
const config = {{
  // options
}};
app.use(middleware(config));
```

## API

### middleware(config)

Express middleware factory.

**Parameters:**
- `config` (object) - Configuration options

**Returns:** Express middleware function

## Express Integration

Works with Express.js and compatible frameworks:

```javascript
app.use(middleware(config));

app.get('/api/endpoint', (req, res, next) => {{
  // Middleware available in req
}});
```

## Related Packages

- [@sequential/server-utilities](../server-utilities) - Server utilities
- [@sequential/response-formatting](../response-formatting) - Response formatting

## License

MIT
