function getToolDescription(name) {
  const descriptions = {
    writeFile: 'Write content to a file (params: path, content, scope?, encoding?, append?)',
    readFile: 'Read content from a file (params: path, scope?, encoding?)',
    listFiles: 'List files in a directory (params: path?, scope?, recursive?)',
    deleteFile: 'Delete a file or directory (params: path, scope?)',
    fileExists: 'Check if a file exists (params: path, scope?)',
    fileStat: 'Get file metadata (params: path, scope?)',
    mkdir: 'Create a directory (params: path, scope?)',
    watchFile: 'Watch a file for changes (params: path, scope?)',
    vfsTree: 'Get VFS directory tree (no params)'
  };
  return descriptions[name] || 'No description available';
}

function getAvailableTools(toolNames) {
  return toolNames.map(name => ({
    name,
    description: getToolDescription(name)
  }));
}

module.exports = { getToolDescription, getAvailableTools };
