/**
 * migration-reporting.js - Migration Reporting Facade
 *
 * Delegates to report generation and UI building modules
 */

import { MigrationReportGenerator } from './migration-report-generator.js';
import { MigrationUIBuilder } from './migration-ui-builder.js';

export class MigrationReporting {
  constructor(registry, versionEngine) {
    this.registry = registry;
    this.versionEngine = versionEngine;
    this.reportGenerator = new MigrationReportGenerator(registry, versionEngine);
    this.uiBuilder = new MigrationUIBuilder(registry, versionEngine);
  }

  getMigrationReport() {
    return this.reportGenerator.getMigrationReport();
  }

  buildMigrationUI() {
    return this.uiBuilder.buildMigrationUI();
  }

  exportMigrations() {
    return this.reportGenerator.exportMigrations();
  }
}
