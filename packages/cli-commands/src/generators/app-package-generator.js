export function generateAppPackageJson(appId, appName, description = '') {
  return {
    name: `app-${appId}`,
    version: '1.0.0',
    description: description || `Sequential Ecosystem App: ${appName}`,
    type: 'module',
    main: 'dist/index.html',
    scripts: {
      dev: 'sequential-ecosystem gui',
      test: 'npm run lint',
      lint: 'eslint dist/ src/ --ext .js,.jsx || true',
      build: 'echo "Apps are buildless; use hot reload for development"'
    },
    dependencies: {
      '@sequential/app-sdk': '^1.0.0'
    },
    devDependencies: {
      eslint: '^8.0.0'
    },
    keywords: [
      'sequential',
      'app',
      'sequential-ecosystem',
      appId
    ],
    author: 'user',
    license: 'MIT',
    repository: {
      type: 'git',
      url: 'file://'
    },
    sequential: {
      appId,
      template: 'custom',
      capabilities: [
        'sequential-os',
        'realtime',
        'storage'
      ]
    }
  };
}
