/**
 * command-executor.js
 *
 * Command execution with error handling and feedback
 */

export function createCommandExecutor(actionHandler) {
  return {
    execute(cmd) {
      try {
        actionHandler.invokeAction(cmd.action);
        if (window.showSuccess) {
          window.showSuccess(`✓ ${cmd.label}`);
        }
      } catch (err) {
        console.error('Command error:', err);
        if (window.showError) {
          window.showError(`Error executing: ${cmd.label}`);
        }
      }
    }
  };
}
