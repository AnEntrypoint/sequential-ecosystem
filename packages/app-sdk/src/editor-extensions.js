import { TaskEditorUI } from './task-editor-ui.js';
import { FlowEditorUI } from './flow-editor-ui.js';

export class TaskEditorExtension {
  constructor(appSDK) {
    this.appSDK = appSDK;
    this.ui = new TaskEditorUI(appSDK);
  }

  initializeUI() {
    this.ui.attachPureLogicValidator();
    this.ui.attachInputOutputSchema();
  }

  attachPureLogicValidator() {
    return this.ui.attachPureLogicValidator();
  }

  attachInputOutputSchema() {
    return this.ui.attachInputOutputSchema();
  }
}

export class FlowEditorExtension {
  constructor(appSDK) {
    this.appSDK = appSDK;
    this.ui = new FlowEditorUI(appSDK);
  }

  initializeUI() {
    this.ui.createNodeToolbox();
    this.ui.attachNodeValidation();
  }

  createNodeToolbox() {
    return this.ui.createNodeToolbox();
  }

  addNode(nodeType) {
    return this.ui.addNode(nodeType);
  }

  attachNodeValidation() {
    return this.ui.attachNodeValidation();
  }

  validateFlow() {
    return this.ui.validateFlow();
  }

  get nodeToolbox() {
    return this.ui.nodeToolbox;
  }
}

export function initializeTaskEditorExtension(appSDK) {
  const extension = new TaskEditorExtension(appSDK);
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => extension.initializeUI());
  } else {
    extension.initializeUI();
  }
  return extension;
}

export function initializeFlowEditorExtension(appSDK) {
  const extension = new FlowEditorExtension(appSDK);
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => extension.initializeUI());
  } else {
    extension.initializeUI();
  }
  return extension;
}
