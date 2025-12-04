# Sequential Ecosystem - Agent Guidelines

## Build Commands

```bash
# Root level
bun install                    # Install all dependencies
npm test                      # Run all tests
npm run lint                   # Lint all packages
npm run build                  # Build all packages

# Individual packages
cd packages/sequential-runner && npm test
cd packages/sequential-adaptor && npm run lint
```

## Code Style

- **No comments** in implementation files
- **CJS over ESM** for buildless tools
- **JS over TS** unless types required
- **No hardcoded/fake/estimated values** - ground truth only
- **No fallbacks/mocks/simulations** - explicit errors instead
- **Prefer buildless tools** over compiled solutions
- **Follow existing patterns** in each package
- **Use registry pattern** for plugins/adapters
- **Test with real implementations** - no mocks

## Testing

- Client-side: Playwright (close browser before tests)
- Server-side: MCP-glootie
- Use `/tmp/sandboxbox-vZWAzQ/tmp` for Playwright artifacts
- Support `file://` URLs in tests
- Use `browser_evaluate` for window globals debugging

## Git

- Identity inherits from `~/.gitconfig`
- For sandbox-to-host: set `receive.denyCurrentBranch=updateInstead`
- Clean working directory required for transfers