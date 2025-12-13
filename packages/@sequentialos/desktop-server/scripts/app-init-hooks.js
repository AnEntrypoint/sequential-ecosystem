/**
 * app-init-hooks.js
 *
 * App-specific initialization hooks for localStorage state management
 */

export const INIT_HOOKS = {
  'app-code-editor': `
    const storage = createStorageManager('app-code-editor');
    const savedState = storage.load();
    if (savedState) {
      openFiles = { ...openFiles, ...savedState.openFiles };
      currentFile = savedState.currentFile || currentFile;
    }
    window.addEventListener('beforeunload', () => {
      storage.save({ openFiles, currentFile });
    });
  `,
  'app-terminal': `
    const storage = createStorageManager('app-terminal');
    const savedState = storage.load();
    if (savedState) {
      currentTab = savedState.currentTab || currentTab;
      sessions = { ...sessions, ...savedState.sessions };
    }
    setInterval(() => {
      storage.save({ currentTab, sessions });
    }, 5000);
  `,
  'app-flow-editor': `
    const storage = createStorageManager('app-flow-editor');
    const savedState = storage.load();
    if (savedState) {
      currentFlow = savedState.currentFlow || currentFlow;
      editingFlow = savedState.editingFlow || editingFlow;
    }
    window.addEventListener('beforeunload', () => {
      storage.save({ currentFlow, editingFlow });
    });
  `,
  'app-file-browser': `
    const storage = createStorageManager('app-file-browser');
    const savedState = storage.load();
    if (savedState) {
      currentDirectory = savedState.currentDirectory || currentDirectory;
      selectedFile = savedState.selectedFile || selectedFile;
    }
    window.addEventListener('beforeunload', () => {
      storage.save({ currentDirectory, selectedFile });
    });
  `,
  'app-task-editor': `
    const storage = createStorageManager('app-task-editor');
    const savedState = storage.load();
    if (savedState) {
      selectedTask = savedState.selectedTask || selectedTask;
      selectedRunner = savedState.selectedRunner || selectedRunner;
    }
    window.addEventListener('beforeunload', () => {
      storage.save({ selectedTask, selectedRunner });
    });
  `,
  'app-debugger': `
    const storage = createStorageManager('app-debugger');
    const savedState = storage.load();
    if (savedState) {
      selectedLayer = savedState.selectedLayer || selectedLayer;
      expandedLayers = savedState.expandedLayers || expandedLayers;
    }
    window.addEventListener('beforeunload', () => {
      storage.save({ selectedLayer, expandedLayers });
    });
  `,
  'app-flow-debugger': `
    const storage = createStorageManager('app-flow-debugger');
    const savedState = storage.load();
    if (savedState) {
      selectedFlow = savedState.selectedFlow || selectedFlow;
      stepPosition = savedState.stepPosition || stepPosition;
    }
    window.addEventListener('beforeunload', () => {
      storage.save({ selectedFlow, stepPosition });
    });
  `,
  'app-task-debugger': `
    const storage = createStorageManager('app-task-debugger');
    const savedState = storage.load();
    if (savedState) {
      selectedTask = savedState.selectedTask || selectedTask;
      selectedRun = savedState.selectedRun || selectedRun;
    }
    window.addEventListener('beforeunload', () => {
      storage.save({ selectedTask, selectedRun });
    });
  `,
  'app-run-observer': `
    const storage = createStorageManager('app-run-observer');
    const savedState = storage.load();
    if (savedState) {
      timeRange = savedState.timeRange || timeRange;
      sortOrder = savedState.sortOrder || sortOrder;
    }
    window.addEventListener('beforeunload', () => {
      storage.save({ timeRange, sortOrder });
    });
  `,
  'app-tool-editor': `
    const storage = createStorageManager('app-tool-editor');
    const savedState = storage.load();
    if (savedState) {
      selectedTool = savedState.selectedTool || selectedTool;
      editingTool = savedState.editingTool || editingTool;
    }
    window.addEventListener('beforeunload', () => {
      storage.save({ selectedTool, editingTool });
    });
  `
};
