import fs from 'fs';
import path from 'path';
import { taskTemplate } from './templates.js';

/**
 * Create a new task
 * @param {string} name - Task name
 * @param {string} description - Task description
 */
export async function createTask(name, description = '') {
  console.log(`📝 Creating new task: ${name}`);
  
  const tasksDir = './packages/tasker-sequential/taskcode/endpoints';
  
  if (!fs.existsSync(tasksDir)) {
    fs.mkdirSync(tasksDir, { recursive: true });
    console.log('📁 Created tasks directory:', tasksDir);
  }
  
  const taskFile = path.join(tasksDir, `${name}.js`);
  
  if (fs.existsSync(taskFile)) {
    console.error('❌ Task already exists:', taskFile);
    return;
  }
  
  const content = taskTemplate(name, description);
  fs.writeFileSync(taskFile, content);
  console.log('✅ Task created:', taskFile);
}

/**
 * Setup GAPI task and configuration
 */
export async function setupGapi() {
  console.log('🔧 Setting up GAPI task...');
  
  const serviceAccountDir = '/mnt/c/dev/smtp';
  if (!fs.existsSync(serviceAccountDir)) {
    fs.mkdirSync(serviceAccountDir, { recursive: true });
  }
  
  const serviceAccountKeyPath = path.join(serviceAccountDir, 'service-account-key.json');
  
  if (!fs.existsSync(serviceAccountKeyPath)) {
    const placeholderKey = {
      "type": "service_account",
      "project_id": "your-project-id"
    };
    
    fs.writeFileSync(serviceAccountKeyPath, JSON.stringify(placeholderKey, null, 2));
    console.log('⚠️  Created placeholder service account key:', serviceAccountKeyPath);
  }
  
  await createTask('comprehensive-gmail-search', 'Search Gmail across all Workspace domains');
  console.log('✅ GAPI setup completed');
}
