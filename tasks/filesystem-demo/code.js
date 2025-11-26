export async function filesystemDemo(input) {
  const startTime = new Date().toISOString();
  const runId = `run-${Date.now()}`;
  
  console.log(`[VFS Demo] Starting at ${startTime}`);
  
  const log = async (message) => {
    console.log(`[VFS Demo] ${message}`);
    const result = await __callHostTool__('writeFile', {
      path: 'execution.log',
      content: `[${new Date().toISOString()}] ${message}\n`,
      scope: 'run',
      append: true
    });
    if (!result.success) {
      console.error('Failed to write log:', result.error);
    }
  };

  await log('Task started');
  await log(`Processing input: ${JSON.stringify(input)}`);

  const configResult = await __callHostTool__('fileExists', {
    path: 'config.json',
    scope: 'task'
  });

  let config = { 
    demo: true, 
    version: '1.0.0',
    features: ['logging', 'file-operations', 'multi-scope']
  };
  
  if (configResult.exists) {
    await log('Reading existing config from task scope');
    const readResult = await __callHostTool__('readFile', {
      path: 'config.json',
      scope: 'task'
    });
    
    if (readResult.success) {
      config = JSON.parse(readResult.content);
      await log(`Loaded config: version ${config.version}`);
    }
  } else {
    await log('Creating new config in task scope');
    await __callHostTool__('writeFile', {
      path: 'config.json',
      content: config,
      scope: 'task'
    });
  }

  await log('Creating output directory structure');
  await __callHostTool__('mkdir', {
    path: 'outputs',
    scope: 'run'
  });

  await __callHostTool__('mkdir', {
    path: 'logs',
    scope: 'run'
  });

  const result = {
    taskId: 'filesystem-demo',
    runId: runId,
    executedAt: startTime,
    input: input,
    config: config,
    filesCreated: [],
    operationsPerformed: 0
  };

  await log('Writing result to run scope');
  const resultWrite = await __callHostTool__('writeFile', {
    path: 'outputs/result.json',
    content: result,
    scope: 'run'
  });
  
  if (resultWrite.success) {
    result.filesCreated.push('outputs/result.json');
    result.operationsPerformed++;
  }

  await log('Creating summary in run scope');
  const summaryContent = `
# Task Execution Summary

- **Task**: filesystem-demo
- **Run ID**: ${runId}
- **Executed**: ${startTime}
- **Input Items**: ${input.items || 0}
- **Config Version**: ${config.version}
- **Features**: ${config.features.join(', ')}

## Files Created

${result.filesCreated.map(f => `- ${f}`).join('\n')}

## Operations

Total operations performed: ${result.operationsPerformed}
`;

  await __callHostTool__('writeFile', {
    path: 'outputs/summary.md',
    content: summaryContent,
    scope: 'run'
  });
  result.filesCreated.push('outputs/summary.md');
  result.operationsPerformed++;

  await log('Writing data samples');
  for (let i = 1; i <= (input.items || 3); i++) {
    const sampleData = {
      id: i,
      timestamp: new Date().toISOString(),
      value: Math.random() * 100,
      status: 'processed'
    };
    
    const writeResult = await __callHostTool__('writeFile', {
      path: `outputs/sample-${i}.json`,
      content: sampleData,
      scope: 'run'
    });
    
    if (writeResult.success) {
      result.filesCreated.push(`outputs/sample-${i}.json`);
      result.operationsPerformed++;
    }
  }

  await log('Updating global task registry');
  const globalSummary = {
    taskId: 'filesystem-demo',
    lastRun: startTime,
    runId: runId,
    status: 'success',
    filesCreated: result.filesCreated.length,
    operations: result.operationsPerformed
  };

  await __callHostTool__('writeFile', {
    path: 'task-registry/filesystem-demo.json',
    content: globalSummary,
    scope: 'global'
  });
  result.operationsPerformed++;

  await log('Listing all files created in run scope');
  const filesResult = await __callHostTool__('listFiles', {
    path: '/',
    scope: 'run',
    recursive: true
  });

  if (filesResult.success) {
    await log(`Found ${filesResult.total} items in run scope`);
  }

  await log('Getting VFS tree information');
  const treeResult = await __callHostTool__('vfsTree', {});
  
  if (treeResult.success) {
    result.vfsTree = treeResult.tree;
  }

  await log(`Task completed successfully. Created ${result.filesCreated.length} files.`);

  return {
    success: true,
    result: result,
    message: `Successfully completed filesystem demo with ${result.operationsPerformed} operations`,
    vfs: {
      runFiles: filesResult.success ? filesResult.total : 0,
      tree: treeResult.success ? treeResult.tree : null
    }
  };
}

export const config = {
  id: 'filesystem-demo',
  name: 'VFS Demo',
  description: 'Comprehensive demonstration of task filesystem with run/task/global scopes and all file operations',
  version: '2.0.0',
  inputs: [
    {
      name: 'items',
      type: 'number',
      description: 'Number of sample files to create (1-10)',
      default: 3,
      min: 1,
      max: 10
    }
  ],
  features: [
    'Multi-scope file operations (run/task/global)',
    'Directory creation',
    'JSON and Markdown file writing',
    'Append mode logging',
    'File existence checks',
    'Recursive file listing',
    'VFS tree inspection',
    'Error handling'
  ]
};
