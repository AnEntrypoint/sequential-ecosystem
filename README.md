# Sequential Ecosystem Monorepo

A comprehensive monorepo containing sequential-fetch, sequential-flow, and tasker-sequential - a complete ecosystem for cross-runtime JavaScript execution with automatic pause/resume on fetch calls.

## 📦 Packages

### 1. sequential-fetch
Pure JavaScript VM that pauses on every fetch() call. Works in Node.js, Bun, Deno, and Google Apps Script.

- **Location**: `packages/sequential-fetch`
- **GitHub**: https://github.com/AnEntrypoint/sequential-fetch
- **NPM**: https://www.npmjs.com/package/sequential-fetch
- **Size**: 197 lines, 5.2 KB
- **Dependencies**: 0

### 2. sequential-flow
Production-grade execution library with task management and pluggable storage (In-Memory, Redis, SQL, Firestore).

- **Location**: `packages/sequential-flow`
- **GitHub**: https://github.com/AnEntrypoint/sequential-flow
- **NPM**: https://www.npmjs.com/package/sequential-flow
- **Size**: 5.9 KB
- **Dependencies**: sequential-fetch

### 3. tasker-sequential
Gmail search tasker with automatic pause/resume execution using sequential-flow instead of flowstate.

- **Location**: `packages/tasker-sequential`
- **GitHub**: https://github.com/AnEntrypoint/tasker-sequential
- **Built with**: sequential-flow

## 🚀 Getting Started

### Clone the monorepo
```bash
git clone --recursive https://github.com/AnEntrypoint/sequential-ecosystem.git
cd sequential-ecosystem
```

### Install dependencies
```bash
npm install
```

### Use in your project

#### Option 1: Use published NPM packages
```bash
npm install sequential-fetch sequential-flow
```

#### Option 2: Use local monorepo packages
```javascript
// Import from local monorepo
const { SequentialFetchVM } = require('./packages/sequential-fetch/lib/sequential-fetch-vm-lib.cjs');
const { SequentialFlow } = require('./packages/sequential-flow/lib/edge-functions.cjs');
```

## 📋 Architecture

```
sequential-ecosystem (monorepo)
├── packages/
│   ├── sequential-fetch
│   │   └── Pure JavaScript VM with pause/resume
│   ├── sequential-flow
│   │   └── Task management + storage (uses sequential-fetch)
│   └── tasker-sequential
│       └── Gmail search tasker (uses sequential-flow)
└── docs/
```

## 🔄 Package Dependencies

```
sequential-fetch (zero deps)
        ↓
sequential-flow (depends on sequential-fetch)
        ↓
tasker-sequential (depends on sequential-flow)
```

## 🔗 Git Submodules

This monorepo uses git submodules to link the main packages:

- `sequential-fetch` → https://github.com/AnEntrypoint/sequential-fetch
- `sequential-flow` → https://github.com/AnEntrypoint/sequential-flow
- `tasker-sequential` → https://github.com/AnEntrypoint/tasker-sequential

Changes made in any package folder automatically reflect in the linked repository.

## 📦 Quick Install All Packages Locally

```bash
npm install sequential-fetch sequential-flow
```

Or use from this monorepo:
```bash
npm install ./packages/sequential-fetch ./packages/sequential-flow
```

## 🧪 Testing

Each package has its own tests:

```bash
# Test sequential-fetch
npm --prefix packages/sequential-fetch test

# Test sequential-flow
npm --prefix packages/sequential-flow test

# Test tasker-sequential
npm --prefix packages/tasker-sequential test
```

## 📚 Documentation

- **sequential-fetch**: [packages/sequential-fetch/README.md](packages/sequential-fetch/README.md)
- **sequential-flow**: [packages/sequential-flow/README.md](packages/sequential-flow/README.md)
- **tasker-sequential**: [packages/tasker-sequential/README.md](packages/tasker-sequential/README.md)

## 🤝 Contributing

All packages are open source under MIT license. Contributions welcome!

1. Clone the monorepo with submodules
2. Make changes in the appropriate package folder
3. Submit PRs to individual package repositories

## 📄 License

MIT - See LICENSE files in each package

## 🔗 Links

- **Monorepo**: https://github.com/AnEntrypoint/sequential-ecosystem
- **sequential-fetch**: https://github.com/AnEntrypoint/sequential-fetch
- **sequential-flow**: https://github.com/AnEntrypoint/sequential-flow
- **tasker-sequential**: https://github.com/AnEntrypoint/tasker-sequential

## ✨ Features

### Cross-Runtime Compatibility
- ✅ Node.js (v18+)
- ✅ Bun
- ✅ Deno
- ✅ Google Apps Script

### Zero Dependencies
Core library uses only JavaScript built-ins (no external npm packages required)

### Production Ready
- Full test coverage
- Complete documentation
- Storage integrations included
- Edge function ready

## 📞 Support

For issues with specific packages, file issues in their respective repositories:
- sequential-fetch: https://github.com/AnEntrypoint/sequential-fetch/issues
- sequential-flow: https://github.com/AnEntrypoint/sequential-flow/issues
- tasker-sequential: https://github.com/AnEntrypoint/tasker-sequential/issues
