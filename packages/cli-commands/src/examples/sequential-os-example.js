import fs from 'fs';
import path from 'path';

export async function createSequentialOSExample(tasksDir) {
  const taskName = 'example-sequential-os';
  const taskPath = path.join(tasksDir, `${taskName}.js`);

  const content = `/**
 * Task: ${taskName}
 * @description Sequential-OS containerized task with layer management
 * @runner sequential-machine
 */

export const config = {
  name: '${taskName}',
  description: 'Sequential-OS task demonstrating container-based execution',
  runner: 'sequential-machine',
  inputs: [
    { name: 'projectName', type: 'string', required: true },
    { name: 'setupCommands', type: 'array', default: [] }
  ]
};

/**
 * Sequential-OS task - each command creates a new layer
 * Commands run in isolated containers with layer-based state
 */
export async function ${taskName.replace(/-/g, '_')}(input) {
  const { projectName, setupCommands = [] } = input;

  console.log(\`Setting up project: \${projectName}\`);

  const commands = [
    \`mkdir -p \${projectName}/src \${projectName}/tests\`,
    \`echo "# \${projectName}" > \${projectName}/README.md\`,
    \`echo '{"name": "\${projectName}", "version": "1.0.0"}' > \${projectName}/package.json\`,
    ...setupCommands,
    \`ls -la \${projectName}\`,
    \`tree \${projectName} || find \${projectName} -type f\`
  ];

  const results = [];

  for (const cmd of commands) {
    console.log(\`Executing: \${cmd}\`);
    results.push({
      command: cmd,
      timestamp: new Date().toISOString(),
      note: 'Creates new layer in Sequential-OS'
    });
  }

  return {
    success: true,
    projectName,
    commandsExecuted: commands.length,
    layersCreated: commands.length,
    results,
    note: 'Each command creates an immutable layer. Use checkout/tags to navigate state.'
  };
}
`;

  fs.writeFileSync(taskPath, content);
  console.log(`  ✓ Created Sequential-OS example: ${taskName}.js`);
}
