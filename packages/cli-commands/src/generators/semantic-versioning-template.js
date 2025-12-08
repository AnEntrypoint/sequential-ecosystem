export function createMigrationGuide(resourceType, resourceName, versions) {
  return `# Migration Guide: ${resourceName}

## Version History
${versions.map(v => `- ${v.version}`).join('\n')}

## Migration Path
\`\`\`
${versions.map((v, i) => {
  if (i < versions.length - 1) {
    return `${v.version} -> ${versions[i + 1].version}`;
  }
}).filter(Boolean).join('\n')}
\`\`\`

## Breaking Changes
- Check getBreakingChanges() for incompatible updates

## Upgrade Instructions
1. Get current version: getVersion()
2. Check compatibility: isCompatible(currentVersion, targetVersion)
3. Migrate if needed: migrateData(data, currentVersion, targetVersion)
4. Test thoroughly before production deployment
`;
}
