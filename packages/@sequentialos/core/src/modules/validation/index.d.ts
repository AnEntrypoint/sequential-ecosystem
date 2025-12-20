/**
 * Validate a file path and ensure it doesn't traverse outside allowed directory
 * @param filePath The file path to validate
 * @returns The resolved real path
 * @throws If path is invalid or traversal is detected
 */
export declare function validateFilePath(filePath: string): string;

/**
 * Validate task name for valid characters and length
 * @param taskName The task name to validate
 * @returns The validated task name
 * @throws If task name is invalid
 */
export declare function validateTaskName(taskName: string): string;

/**
 * Validate file name for valid characters and length
 * @param fileName The file name to validate
 * @returns The validated file name
 * @throws If file name is invalid
 */
export declare function validateFileName(fileName: string): string;

/**
 * Validate a single parameter value
 * @param value The value to validate
 * @param name The parameter name for error messages
 * @param type Expected type (optional)
 * @returns The validated value
 * @throws If validation fails
 */
export declare function validateParam(value: any, name: string, type?: string): any;

/**
 * Validate multiple required parameters
 * @param params Parameter objects with name and value
 * @throws If any parameter is missing
 */
export declare function validateRequired(...params: Array<{ name: string; value: any }>): void;

/**
 * Validate parameter type matches expected type
 * @param value The value to validate
 * @param name The parameter name for error messages
 * @param expectedType Expected type (string, number, boolean, etc.)
 * @returns The validated value
 * @throws If type doesn't match
 */
export declare function validateType(value: any, name: string, expectedType: string): any;

/**
 * Schema field definition for input validation
 */
export interface SchemaField {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'array' | 'object';
  required?: boolean;
}

/**
 * Validate input object against a schema
 * @param input Input object to validate
 * @param schema Schema definition array
 * @returns Array of error messages or null if valid
 */
export declare function validateInputSchema(
  input: Record<string, any>,
  schema: SchemaField[]
): string[] | null;

/**
 * Validate and sanitize metadata object
 * Ensures metadata is JSON-serializable and doesn't exceed size limit
 * @param metadata Metadata object to validate
 * @param maxSize Maximum size in bytes (default 10MB)
 * @returns Validated metadata
 * @throws If metadata is invalid or exceeds max size
 */
export declare function validateAndSanitizeMetadata(
  metadata: Record<string, any>,
  maxSize?: number
): Record<string, any>;
