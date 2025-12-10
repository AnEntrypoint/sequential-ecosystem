export function generateConfigManagementTemplate() {
  return `/**
 * Unified Configuration Management
 *
 * Centralized config loading with environment switching and validation.
 */

import { createConfigManager, registerDefaultSchemas } from '@sequentialos/config-management';

const configManager = createConfigManager();
registerDefaultSchemas(configManager);

// Load config for task with environment switching
export async function getTaskConfig(taskPath) {
  return await configManager.loadConfig('task', taskPath);
}

// Load app config with all environment variables
export async function getAppConfig(appPath) {
  const appConfig = await configManager.loadConfig('app', appPath);
  const envConfig = configManager.getEnvironmentConfig();

  return configManager.mergeConfig(appConfig, envConfig);
}

// Custom schema for specific tools
configManager.registerSchema('customTool', {
  type: 'object',
  required: ['apiKey'],
  properties: {
    apiKey: { type: 'string' },
    apiUrl: { type: 'string', pattern: '^https?://' },
    timeout: { type: 'number', minimum: 1000 }
  }
});

export async function getCustomToolConfig(toolPath) {
  return await configManager.loadConfig('customTool', toolPath);
}

// Validate before deployment
export async function validateConfig(resourceType, resourcePath) {
  const config = await configManager.loadConfig(resourceType, resourcePath);
  return configManager.validateConfig(resourceType, config);
}
`;
}
