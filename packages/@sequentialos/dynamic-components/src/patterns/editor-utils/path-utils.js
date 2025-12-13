export function getElementByPath(definition, path) {
  if (!path) return definition;

  const parts = path.split('.');
  let current = definition;

  for (const part of parts) {
    if (part.startsWith('children[')) {
      const match = part.match(/children\[(\d+)\]/);
      if (match) {
        const index = parseInt(match[1], 10);
        current = current.children?.[index];
      }
    } else {
      current = current[part];
    }

    if (!current) return null;
  }

  return current;
}

export function setElementByPath(definition, path, value) {
  if (!path) {
    return value;
  }

  const parts = path.split('.');
  let current = definition;

  for (let i = 0; i < parts.length - 1; i++) {
    const part = parts[i];
    if (part.startsWith('children[')) {
      const match = part.match(/children\[(\d+)\]/);
      if (match) {
        const index = parseInt(match[1], 10);
        if (!current.children) current.children = [];
        if (!current.children[index]) current.children[index] = {};
        current = current.children[index];
      }
    } else {
      if (!current[part]) current[part] = {};
      current = current[part];
    }
  }

  const lastPart = parts[parts.length - 1];
  if (lastPart.startsWith('children[')) {
    const match = lastPart.match(/children\[(\d+)\]/);
    if (match) {
      const index = parseInt(match[1], 10);
      if (!current.children) current.children = [];
      current.children[index] = value;
    }
  } else {
    current[lastPart] = value;
  }

  return definition;
}

export function deleteElementByPath(definition, path) {
  if (!path) return definition;

  const parts = path.split('.');
  let current = definition;

  for (let i = 0; i < parts.length - 1; i++) {
    const part = parts[i];
    if (part.startsWith('children[')) {
      const match = part.match(/children\[(\d+)\]/);
      if (match) {
        const index = parseInt(match[1], 10);
        current = current.children?.[index];
      }
    } else {
      current = current[part];
    }

    if (!current) return definition;
  }

  const lastPart = parts[parts.length - 1];
  if (lastPart.startsWith('children[')) {
    const match = lastPart.match(/children\[(\d+)\]/);
    if (match) {
      const index = parseInt(match[1], 10);
      if (current.children) current.children.splice(index, 1);
    }
  } else {
    delete current[lastPart];
  }

  return definition;
}

export function clonePath(value) {
  return JSON.parse(JSON.stringify(value));
}
