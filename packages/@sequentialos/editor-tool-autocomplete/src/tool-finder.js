/**
 * tool-finder.js - Tool parsing and discovery in code
 *
 * Identifies tool calls in code and extracts tool names for matching
 */

export class ToolFinder {
  constructor(tools = []) {
    this.tools = tools;
  }

  findToolCall(code, cursorPos) {
    const beforeCursor = code.substring(0, cursorPos);
    const callPattern = /__callHostTool__\s*\(\s*['"]([^'"]+)['"]\s*,\s*['"]([^'"]*)/;
    const match = beforeCursor.match(callPattern);

    if (match) {
      return {
        appId: match[1],
        partial: match[2],
        start: beforeCursor.lastIndexOf(match[0]) + match[0].length - match[2].length,
        end: cursorPos
      };
    }

    return null;
  }

  setTools(tools) {
    this.tools = tools;
  }

  getTools() {
    return this.tools;
  }
}
