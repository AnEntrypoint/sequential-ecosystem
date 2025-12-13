import { registerKitHandlers } from './kit-handlers.js';
import { registerLayerHandlers } from './layer-handlers.js';
import { registerTerminalHandler } from './terminal-handler.js';
import { registerPackageHandlers } from './package-handlers.js';

export function registerSequentialOsRoutes(app, kit, STATEKIT_DIR) {
  console.log('[SequentialOS] Registering routes with STATEKIT_DIR:', STATEKIT_DIR);
  registerKitHandlers(app, kit, STATEKIT_DIR);
  registerLayerHandlers(app, kit, STATEKIT_DIR);
  registerTerminalHandler(app, kit);
  registerPackageHandlers(app, kit);
}
