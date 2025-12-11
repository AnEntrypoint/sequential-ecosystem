import { CompositionCore } from './composition-core.js';
import { CompositionLayout } from './composition-layout.js';
import { CompositionUI } from './composition-ui.js';

export class PatternCompositionBuilder {
  constructor(patternLibraries = {}) {
    this.core = new CompositionCore(patternLibraries);
    this.layout = new CompositionLayout(this.core);
    this.ui = new CompositionUI(this.core);
  }

  addPattern(patternId, patternDef, position = null) {
    return this.core.addPattern(patternId, patternDef, position);
  }

  removePattern(patternId) {
    return this.core.removePattern(patternId);
  }

  reorderPatterns(fromIndex, toIndex) {
    return this.core.reorderPatterns(fromIndex, toIndex);
  }

  setLayoutMode(mode) {
    return this.core.setLayoutMode(mode);
  }

  updateLayoutConfig(config) {
    return this.core.updateLayoutConfig(config);
  }

  updateGridConfig(config) {
    return this.core.updateGridConfig(config);
  }

  customizePattern(patternId, customizations) {
    return this.core.customizePattern(patternId, customizations);
  }

  applyPatternVariant(patternId, variantName) {
    return this.core.applyPatternVariant(patternId, variantName);
  }

  buildComposition() {
    return this.layout.buildComposition();
  }

  buildLayoutContainer() {
    return this.layout.buildLayoutContainer();
  }

  buildGridLayout() {
    return this.layout.buildGridLayout();
  }

  buildFlexLayout() {
    return this.layout.buildFlexLayout();
  }

  buildStackLayout() {
    return this.layout.buildStackLayout();
  }

  buildCarouselLayout() {
    return this.layout.buildCarouselLayout();
  }

  buildPatternElement(pattern) {
    return this.layout.buildPatternElement(pattern);
  }

  applyCustomizations(element, customizations) {
    return this.layout.applyCustomizations(element, customizations);
  }

  buildCompositionUI() {
    return this.ui.buildCompositionUI();
  }

  buildLayoutSelector() {
    return this.ui.buildLayoutSelector();
  }

  buildPatternList() {
    return this.ui.buildPatternList();
  }

  buildLayoutControls() {
    return this.ui.buildLayoutControls();
  }

  buildGridControls() {
    return this.ui.buildGridControls();
  }

  buildFlexControls() {
    return this.ui.buildFlexControls();
  }

  saveComposition(name) {
    return this.core.saveComposition(name);
  }

  loadComposition(id) {
    return this.core.loadComposition(id);
  }

  deleteComposition(id) {
    return this.core.deleteComposition(id);
  }

  listCompositions() {
    return this.core.listCompositions();
  }

  exportComposition() {
    return this.core.exportComposition();
  }

  importComposition(data) {
    return this.core.importComposition(data);
  }

  getState() {
    return this.core.getState();
  }

  on(event, callback) {
    return this.core.on(event, callback);
  }

  off(event, callback) {
    return this.core.off(event, callback);
  }

  notifyListeners(event, data) {
    return this.core.notifyListeners(event, data);
  }

  clear() {
    return this.core.clear();
  }

  get selectedPatterns() {
    return this.core.selectedPatterns;
  }

  get layoutMode() {
    return this.core.layoutMode;
  }

  get layoutConfig() {
    return this.core.layoutConfig;
  }

  get gridConfig() {
    return this.core.gridConfig;
  }

  get compositions() {
    return this.core.compositions;
  }

  get compositionId() {
    return this.core.compositionId;
  }

  get listeners() {
    return this.core.listeners;
  }
}

export const createPatternCompositionBuilder = (patternLibraries = {}) => new PatternCompositionBuilder(patternLibraries);
