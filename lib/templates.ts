/**
 * Template definitions for task creation
 */

export const taskTemplate = (name: string, description: string = ''): string => `/**
 * ${name}
 * ${description || 'Automated task: ' + name}
 *
 * @param {Object} input
 * @returns {Object} Task execution results
 */
module.exports = async function(input: any) {
  console.log('🚀 Starting ${name}');
  try {
    // Task implementation goes here
    // Use HTTP calls to tools - they will automatically pause/resume
    const result = {
      success: true,
      message: '${name} completed successfully',
      data: input
    };
    console.log('✅ Task completed successfully');
    return result;
  } catch (error) {
    console.error('❌ Task failed:', error);
    return {
      success: false,
      error: error.message,
      message: '${name} failed'
    };
  };
};`;

export const serviceAccountTemplate = {
  "type": "service_account",
  "project_id": "your-project-id",
  "private_key_id": "your-private-key-id",
  "private_key": "-----BEGIN PRIVATE KEY-----\\nYOUR_PRIVATE_KEY_HERE\\n-----END PRIVATE KEY-----\\n",
  "client_email": "your-service-account@your-project-id.iam.gserviceaccount.com",
  "client_id": "your-client-id",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token"
};
