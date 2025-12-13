export class EditorRenderer {
  constructor(universalRenderer, core) {
    this.renderer = universalRenderer;
    this.core = core;
    this.previewElement = null;
  }

  initializePreview(containerId) {
    this.previewElement = document.getElementById(containerId);
    if (!this.previewElement) {
      return false;
    }
    this.renderPreview();
    return true;
  }

  renderPreview() {
    if (!this.previewElement || !this.core.currentPattern) return;
    try {
      this.renderer.render(this.core.currentPattern.definition, this.previewElement);
      this.core.notifyListeners('previewRendered', { patternId: this.core.currentPattern.id });
    } catch (e) {
      this.renderPreviewError(e);
    }
  }

  renderPreviewError(error) {
    if (!this.previewElement) return;
    this.previewElement.innerHTML = `
      <div style="padding: 20px; background: #fee; color: #c00; border-radius: 4px;">
        <strong>Preview Error:</strong> ${error.message}
      </div>
    `;
  }
}
