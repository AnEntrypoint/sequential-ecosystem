// Extended components facade - maintains 100% backward compatibility
import { ComponentTemplateRegistrar } from './component-template-registrar.js';

export function createExtendedComponentLibrary(registry, themeEngine) {
  const registrar = new ComponentTemplateRegistrar(registry);
  const lib = {};

  lib.registerDataVisualization = () => {
    // No-op: templates already defined in component-templates.js
  };

  lib.registerFormComponents = () => {
    // No-op: templates already defined in component-templates.js
  };

  lib.registerLayoutComponents = () => {
    // No-op: templates already defined in component-templates.js
  };

  lib.registerNavigationComponents = () => {
    // No-op: templates already defined in component-templates.js
  };

  lib.registerFeedbackComponents = () => {
    // No-op: templates already defined in component-templates.js
  };

  lib.registerUtilityComponents = () => {
    // No-op: templates already defined in component-templates.js
  };

  lib.registerAll = () => {
    registrar.registerAll();
  };

  return lib;
}

export const createExtendedLibrary = (registry, themeEngine) => {
  const lib = createExtendedComponentLibrary(registry, themeEngine);
  lib.registerAll();
  return lib;
};
