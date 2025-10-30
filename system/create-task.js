#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import chalk from 'chalk';

const taskTemplate = `/**
 * {{TASK_NAME}}
 * {{TASK_DESCRIPTION}}
 *
 * @param {Object} input
 * {{PARAMS}}
 * @returns {Object} Task execution results
 */
module.exports = async function({{{PARAM_NAMES}}}) {
  console.log('🚀 Starting {{TASK_NAME}}');
  
  try {
    // Task implementation goes here
    // Use HTTP calls to tools - they will automatically pause/resume
    
    const result = {
      success: true,
      message: '{{TASK_NAME}} completed successfully',
      data: {}
    };
    
    console.log('✅ Task completed successfully');
    return result;
    
  } catch (error) {
    console.error('❌ Task failed:', error);
    return {
      success: false,
      error: error.message,
      message: '{{TASK_NAME}} failed'
    };
  }
};`;

async function createTask(taskName, description = '') {
  console.log(chalk.blue('📝 Creating new task:'), chalk.cyan(taskName));
  
  const tasksDir = path.join(process.cwd(), 'packages', 'tasker-sequential', 'taskcode', 'endpoints');
  
  // Ensure directory exists
  if (!fs.existsSync(tasksDir)) {
    fs.mkdirSync(tasksDir, { recursive: true });
    console.log(chalk.yellow('📁 Created tasks directory:'), tasksDir);
  }
  
  const taskFile = path.join(tasksDir, `${taskName}.js`);
  
  if (fs.existsSync(taskFile)) {
    console.error(chalk.red('❌ Task already exists:'), taskFile);
    process.exit(1);
  }
  
  // Generate task content
  const taskContent = taskTemplate
    .replace(/{{TASK_NAME}}/g, taskName)
    .replace(/{{TASK_DESCRIPTION}}/g, description || `Automated task: ${taskName}`)
    .replace(/{{PARAMS}}/g, '* @param {string} input - Task input parameters')
    .replace(/{{PARAM_NAMES}}/g, 'input');
  
  fs.writeFileSync(taskFile, taskContent);
  console.log(chalk.green('✅ Task created:'), chalk.cyan(taskFile));
  
  console.log(chalk.blue('💡 Next steps:'));
  console.log(chalk.cyan('  1. Edit the task file:'), taskFile);
  console.log(chalk.cyan('  2. Add your task logic using HTTP calls to tools'));
  console.log(chalk.cyan('  3. Start the system: npx sequential-ecosystem start'));
}

export { createTask };