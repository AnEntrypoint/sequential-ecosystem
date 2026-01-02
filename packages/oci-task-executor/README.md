# oci-task-executor

Execute tasks inside OCI containers. Build container images and run code with full isolation.

## Features

- Build container images from source code
- Run containerized tasks with input/output handling
- Push images to registries
- Get image metadata and configuration
- Built on native JavaScript OCI builder (no Docker required)

## Installation

```bash
npm install oci-task-executor
```

## Usage

### Building an Image

```javascript
import { buildImage } from 'oci-task-executor';

const result = await buildImage('console.log("Hello from container");', {
  baseImage: 'node:18-alpine',
  imageName: 'my-task',
  tag: 'latest',
  registry: 'docker.io',
  namespace: 'myuser'
});

console.log('Image built:', result.imageHash);
console.log('Image specifier:', result.imageSpecifier);
```

### Running a Container

```javascript
import { runContainer } from 'oci-task-executor';

const result = await runContainer(
  'sha256abc...',
  { inputData: 'some input' },
  {
    imageName: 'my-task',
    tag: 'latest',
    timeout: 30000
  }
);

console.log('Exit code:', result.exitCode);
console.log('Result:', result.result);
```

### Pushing to Registry

```javascript
import { pushImage } from 'oci-task-executor';

const result = await pushImage('sha256abc...', 'my.registry.io', {
  imageName: 'my-task',
  baseRegistry: 'docker.io'
});

console.log('Pushed to:', result.targetImage);
```

### Getting Image Metadata

```javascript
import { getImageMetadata } from 'oci-task-executor';

const metadata = await getImageMetadata('sha256abc...', {
  imageName: 'my-task',
  tag: 'latest'
});

console.log('Layers:', metadata.layers);
console.log('Size:', metadata.size);
```

## API

### buildImage(sourceCode, config)

Build a container image from source code.

**Parameters:**
- `sourceCode` (string): Task code to run in container
- `config` (object):
  - `baseImage` (string, default: 'node:18-alpine'): Base image to build from
  - `imageName` (string, default: 'sequential-task'): Image name
  - `tag` (string, default: 'latest'): Image tag
  - `registry` (string, default: 'docker.io'): Registry host
  - `namespace` (string, default: 'library'): Registry namespace
  - `authConfig` (object): Registry authentication

**Returns:** Promise<{imageHash, imageSpecifier, digest, manifest, config}>

### runContainer(imageHash, input, config)

Execute a task inside a container image.

**Parameters:**
- `imageHash` (string): Hash/ID of the built image
- `input` (object): Input data for the task
- `config` (object):
  - `imageName` (string): Image name
  - `tag` (string): Image tag
  - `timeout` (number, default: 30000): Execution timeout in ms
  - `authConfig` (object): Registry authentication

**Returns:** Promise<{imageHash, imageSpecifier, result, config, exitCode}>

### pushImage(imageHash, registry, config)

Push a built image to a registry.

**Parameters:**
- `imageHash` (string): Hash/ID of the built image
- `registry` (string): Target registry host
- `config` (object):
  - `imageName` (string): Image name
  - `baseRegistry` (string): Source registry (default: 'docker.io')
  - `baseNamespace` (string): Source namespace
  - `authConfig` (object): Registry authentication

**Returns:** Promise<{imageHash, sourceImage, targetImage, digest, pushed, registry}>

### getImageMetadata(imageHash, config)

Get metadata for a container image.

**Parameters:**
- `imageHash` (string): Hash/ID of the image
- `config` (object):
  - `imageName` (string): Image name
  - `tag` (string): Image tag
  - `registry` (string): Registry host
  - `namespace` (string): Registry namespace
  - `authConfig` (object): Registry authentication

**Returns:** Promise<{imageHash, imageSpecifier, manifest, config, layers, size}>

## Configuration

### Registry Authentication

Provide authentication credentials for private registries:

```javascript
const config = {
  authConfig: {
    'docker.io': {
      Username: 'username',
      Secret: 'password'
    },
    'gcr.io': {
      keyFilename: '/path/to/service-account.json'
    }
  }
};
```

### Environment & Build Options

Customize image build parameters:

```javascript
const config = {
  baseImage: 'python:3.11-slim',
  imageName: 'data-processor',
  tag: 'v1.0.0',
  registry: 'my.registry.io',
  namespace: 'ml-team'
};
```

## Dependencies

- `oci-builder` - Native OCI image building
- `sequential-logging` - Logging utilities

## License

MIT
