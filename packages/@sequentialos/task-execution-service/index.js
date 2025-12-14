export class TaskExecutionService {
  constructor() { this.tasks = new Map(); }
  async execute(taskId, fn) {
    this.tasks.set(taskId, { status: 'running', startTime: Date.now() });
    try {
      const result = await fn();
      this.tasks.set(taskId, { status: 'completed', result, endTime: Date.now() });
      return result;
    } catch (error) {
      this.tasks.set(taskId, { status: 'failed', error: error.message, endTime: Date.now() });
      throw error;
    }
  }
  getStatus(taskId) { return this.tasks.get(taskId); }
}
export default { TaskExecutionService };
