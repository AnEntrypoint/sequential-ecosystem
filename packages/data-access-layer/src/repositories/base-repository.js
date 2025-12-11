import { createPathValidator } from './repository-path-validator.js';
import { createJsonIO } from './repository-json-io.js';
import { createDirectoryListing } from './repository-directory-listing.js';
import { createErrorFactory } from './repository-error-factory.js';

/**
 * BaseRepository - Abstract base class for all repositories
 *
 * Facade delegating to focused modules:
 * - repository-path-validator: Path validation with symlink protection
 * - repository-json-io: JSON file I/O with error handling
 * - repository-directory-listing: Directory and file enumeration
 * - repository-error-factory: Error creation with status codes
 */
export class BaseRepository {
  constructor(baseDir, entityName = 'Entity') {
    this.baseDir = baseDir;
    this.entityName = entityName;

    const pathValidator = createPathValidator(entityName);
    const jsonIO = createJsonIO(entityName);
    const dirListing = createDirectoryListing(entityName);
    const errorFactory = createErrorFactory(entityName);

    this.validatePath = id => pathValidator.validatePath(id, baseDir);
    this.readJsonFile = (filePath, context) => jsonIO.readJsonFile(filePath, context);
    this.readJsonFileOptional = filePath => jsonIO.readJsonFileOptional(filePath);
    this.writeJsonFile = (filePath, data) => jsonIO.writeJsonFile(filePath, data);
    this.writeJsonFileAsync = (filePath, data) => jsonIO.writeJsonFileAsync(filePath, data);
    this.getAll = () => dirListing.getAll(baseDir);
    this.getAllFiles = () => dirListing.getAllFiles(baseDir);
    this.createError = (message, status, code) => errorFactory.createError(message, status, code);
  }
}
