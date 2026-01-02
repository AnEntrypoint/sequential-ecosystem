# oci-builder

Native JavaScript OCI (Docker) image builder with multi-platform manifest support. Build container images without Docker installed.

## Features

- Build OCI container images programmatically from Node.js
- Multi-platform manifest support (arm64, amd64)
- Registry client with authentication for Docker Hub, GCR, and custom registries
- Add layers, modify image config, push to registry
- No Docker daemon required
- Pure JavaScript/Node.js implementation

## Installation

```bash
npm install oci-builder
```

## Usage

### Building an Image

```javascript
import { Image, pack, CustomFile } from 'oci-builder';

// Create image from base
const image = new Image('node:18-alpine', 'docker.io/myuser/myimage:latest');

// Add files as layers
const layer = await image.addFiles({
  '/local/src': '/app/src',
  '/local/config.json': '/app/config.json'
});

// Modify image config
image.Env = ['NODE_ENV=production'];
image.Cmd = ['node', 'src/index.js'];
image.WorkingDir = '/app';

// Save to registry
const result = await image.save(['latest', 'v1.0.0']);
console.log('Image digest:', result.digest);
```

### Custom Files

Add in-memory files without creating physical files:

```javascript
import { CustomFile } from 'oci-builder';

const customFile = new CustomFile({
  data: Buffer.from('console.log("Hello");'),
  size: 20,
  mode: 0o644
});

await image.addFiles({
  '/app/custom': customFile
});
```

### Using Registry Client Directly

```javascript
import { RegistryClient } from 'oci-builder';

const client = new RegistryClient(
  'docker.io',
  'myuser/myrepo',
  { token: 'your-auth-token' }
);

const manifest = await client.manifest('latest');
const config = await client.blob(manifest.config.digest);
```

### Authentication

Supports multiple registry authentication methods:

```javascript
const image = new Image('ubuntu:22.04', 'gcr.io/my-project/image:latest', {
  auth: {
    'gcr.io': {
      keyFilename: '/path/to/service-account.json'
    },
    'docker.io': {
      Username: 'username',
      Secret: 'password'
    },
    'custom.registry.io': {
      token: 'bearer-token'
    }
  }
});
```

## API

### Image Class

#### Constructor

```javascript
new Image(sourceImage, targetImage?, options?)
```

- `sourceImage` (string): Base image specifier (e.g., 'ubuntu:22.04', 'gcr.io/project/image:tag')
- `targetImage` (string|object): Where to push the modified image. Defaults to sourceImage if omitted
- `options`: Configuration with `auth` property for registry authentication

#### Methods

- `getImageConfig()` -> Promise<ImageConfig>: Get mutable image configuration
- `addLayer(digest, uncompressedDigest, size)` -> Promise<Layer>: Add pre-computed layer
- `removeLayer(digest)` -> Promise<boolean>: Remove layer by digest
- `addFiles(dir, targetDir?, options?)` -> Promise<Layer>: Add files from filesystem or CustomFile objects
- `getImageData()` -> Promise<ImageData>: Get manifest and config
- `loadImageData(image?)` -> Promise<ImageData>: Fetch image metadata from registry
- `client(image?, write?)` -> Promise<RegistryClient>: Get authenticated registry client
- `save(tags?, options?)` -> Promise<ManifestResult>: Save modified image to registry
- `sync(options?)` -> Promise: Copy layers from source to target registry

#### Properties

- `WorkingDir` (string): Sets image working directory
- `Cmd` (string[]): Sets image command/entrypoint
- `Env` (string[]): Sets environment variables

### RegistryClient Class

HTTP client for OCI/Docker registries implementing distribution spec v2.

#### Methods

- `manifest(tag)` -> Promise<ManifestV2>: Get image manifest
- `blob(digest, stream?)` -> Promise<Buffer|Readable>: Download layer blob
- `upload(blob, contentLength?, digest?)` -> Promise<{digest, contentLength}>: Upload blob
- `blobExists(digest)` -> Promise<boolean>: Check if blob exists
- `manifestUpload(tag, manifest)` -> Promise<ManifestResult>: Push manifest
- `mount(digest, fromRepository)` -> Promise: Mount blob from another repository
- `tags()` -> Promise<TagResult>: List image tags

### CustomFile Class

Represents in-memory file for tar packing.

```javascript
new CustomFile({
  data: Buffer | Readable,    // File content (required for files)
  size: number,               // For streams (required if data is stream)
  mode: number,               // Unix permissions (0o644)
  type: 'File' | 'Directory' | 'SymbolicLink',
  linkPath: string            // For symlinks
})
```

## Dependencies

- `request` - HTTP client
- `tar` - TAR archive handling
- `walkdir` - Filesystem traversal
- `p-retry` - Retry logic
- `google-auth-library` - GCR authentication
- `micromatch` - Glob pattern matching

## License

Apache-2.0
