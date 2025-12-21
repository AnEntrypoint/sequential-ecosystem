/**
 * @sequentialos/timestamp-utilities
 *
 * Timestamp formatting and utility functions for Sequential OS
 */

/**
 * Returns the current timestamp in ISO 8601 format
 * @returns {string} Current timestamp (e.g., "2025-12-21T10:30:45.123Z")
 */
export function nowISO() {
  return new Date().toISOString();
}

/**
 * Formats a date to ISO 8601 format
 * @param {Date|string|number} date - Date to format
 * @returns {string} Formatted timestamp
 */
export function toISO(date) {
  return new Date(date).toISOString();
}

/**
 * Returns current Unix timestamp in milliseconds
 * @returns {number} Current timestamp in ms
 */
export function nowMillis() {
  return Date.now();
}

/**
 * Returns current Unix timestamp in seconds
 * @returns {number} Current timestamp in seconds
 */
export function nowSeconds() {
  return Math.floor(Date.now() / 1000);
}

/**
 * Formats a timestamp for human-readable display
 * @param {Date|string|number} date - Date to format
 * @returns {string} Formatted date string
 */
export function formatReadable(date) {
  return new Date(date).toLocaleString();
}
