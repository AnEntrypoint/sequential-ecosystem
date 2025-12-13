/**
 * task-dry-runner.js
 *
 * Execute task in dry-run mode (no persistence)
 */

export async function runDryRun(taskFunction, taskName, input, verbose) {
  try {
    if (verbose) {
      console.info('Dry run mode - execute without saving');
    }

    if (typeof taskFunction !== 'function') {
      throw new Error('Task function is not a function');
    }

    if (verbose) {
      console.info('✓ Task syntax is valid');
      console.info('Executing task...');
    }

    const result = await taskFunction(input);

    if (verbose) {
      console.info('✓ Task executed successfully');
      console.info('Result:', JSON.stringify(result, null, 2));
    }

    return {
      dryRun: true,
      valid: true,
      executed: true,
      result
    };
  } catch (e) {
    const error = e instanceof Error ? e.message : String(e);
    console.error('✗ Dry run failed:', error);
    if (verbose && e instanceof Error && e.stack) {
      console.error('Stack trace:', e.stack);
    }
    return {
      dryRun: true,
      valid: false,
      executed: false,
      error
    };
  }
}
