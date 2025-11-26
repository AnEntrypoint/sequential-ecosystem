export async function filesystemDemo(input) {
  const startTime = new Date().toISOString();
  
  await __callHostTool__('writeFile', {
    path: 'execution.log',
    content: `[${startTime}] Task started\n`,
    scope: 'run'
  });

  await __callHostTool__('writeFile', {
    path: 'execution.log',
    content: `[${startTime}] Processing input: ${JSON.stringify(input)}\n`,
    scope: 'run',
    append: true
  });

  const configExists = await __callHostTool__('fileExists', {
    path: 'config.json',
    scope: 'task'
  });

  let config = { defaultValue: 'demo' };
  if (configExists) {
    const configData = await __callHostTool__('readFile', {
      path: 'config.json',
      scope: 'task'
    });
    config = JSON.parse(configData.content);
  } else {
    await __callHostTool__('writeFile', {
      path: 'config.json',
      content: JSON.stringify(config, null, 2),
      scope: 'task'
    });
  }

  const result = {
    taskId: 'filesystem-demo',
    executedAt: startTime,
    input: input,
    config: config,
    filesCreated: []
  };

  await __callHostTool__('writeFile', {
    path: 'outputs/result.json',
    content: JSON.stringify(result, null, 2),
    scope: 'run'
  });
  result.filesCreated.push('outputs/result.json');

  await __callHostTool__('writeFile', {
    path: 'outputs/summary.txt',
    content: `Task completed successfully at ${startTime}\nInput items: ${input.items || 0}\n`,
    scope: 'run'
  });
  result.filesCreated.push('outputs/summary.txt');

  const globalSummary = {
    taskId: 'filesystem-demo',
    lastRun: startTime,
    status: 'success'
  };

  await __callHostTool__('writeFile', {
    path: 'task-summaries/filesystem-demo.json',
    content: JSON.stringify(globalSummary, null, 2),
    scope: 'global'
  });

  const runFiles = await __callHostTool__('listFiles', {
    path: '/',
    scope: 'run'
  });

  await __callHostTool__('writeFile', {
    path: 'execution.log',
    content: `[${new Date().toISOString()}] Task completed. Files created: ${result.filesCreated.length}\n`,
    scope: 'run',
    append: true
  });

  return {
    success: true,
    result: result,
    runFilesCount: runFiles.files.length + runFiles.directories.length
  };
}

export const config = {
  id: 'filesystem-demo',
  name: 'Filesystem Demo',
  description: 'Demonstrates task filesystem with run/task/global scopes',
  inputs: [
    {
      name: 'items',
      type: 'number',
      description: 'Number of items to process',
      default: 10
    }
  ]
};
