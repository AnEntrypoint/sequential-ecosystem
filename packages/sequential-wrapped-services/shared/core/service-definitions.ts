import { createStorageServiceDefs } from './storage-service-defs.ts';
import { createApiServiceDefs } from './api-service-defs.ts';
import type { ServiceDefinition } from './service-registry-types.ts';

export function createServiceDefinitions(): ServiceDefinition[] {
  return [
    ...createStorageServiceDefs(),
    ...createApiServiceDefs()
  ];
}
