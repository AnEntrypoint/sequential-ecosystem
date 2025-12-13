// Accessibility issue checkers facade - maintains 100% backward compatibility
import { LandmarkChecks } from './a11y-checks-landmark.js';
import { ContentChecks } from './a11y-checks-content.js';
import { InteractionChecks } from './a11y-checks-interaction.js';

export class A11yChecker {
  checkLandmarks(component) {
    return LandmarkChecks.checkLandmarks(component);
  }

  checkAriaAttributes(component) {
    return ContentChecks.checkAriaAttributes(component);
  }

  checkColorContrast(component, calculateContrast) {
    return ContentChecks.checkColorContrast(component, calculateContrast);
  }

  checkInteractiveElements(component) {
    return InteractionChecks.checkInteractiveElements(component);
  }

  checkFormElements(component) {
    return InteractionChecks.checkFormElements(component);
  }

  checkHeadingStructure(component, depth) {
    return LandmarkChecks.checkHeadingStructure(component, depth);
  }

  checkAltText(component) {
    return ContentChecks.checkAltText(component);
  }

  checkFocusManagement(component) {
    return InteractionChecks.checkFocusManagement(component);
  }

  checkLanguage(component) {
    return LandmarkChecks.checkLanguage(component);
  }

  checkMotion(component) {
    return InteractionChecks.checkMotion(component);
  }
}
