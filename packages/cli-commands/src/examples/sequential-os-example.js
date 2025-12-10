import path from 'path';
import { writeFileAtomicString } from '@sequentialos/file-operations';
import logger from '@sequentialos/sequential-logging';
import { nowISO, createTimestamps, updateTimestamp } from '@sequentialos/timestamp-utilities';

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

  logger.info(\`Setting up project: \${projectName}\`);

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
    logger.info(\`Executing: \${cmd}\`);
    results.push({
      command: cmd,
      timestamp: nowISO(),
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

  await writeFileAtomicString(taskPath, content);
  logger.info(`  ✓ Created Sequential-OS example: ${taskName}.js`);
}
