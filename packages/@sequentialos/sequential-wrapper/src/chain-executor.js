export async function executeMethodChain(instance, chain) {
  let current = instance;

  for (const step of chain) {
    if (step.type === 'get') {
      current = current[step.property];
    } else if (step.type === 'call') {
      if (typeof current[step.property] !== 'function') {
        throw new Error(`Method '${step.property}' not found`);
      }
      current = current[step.property](...(step.args || []));
    } else {
      throw new Error(`Unknown chain step type: ${step.type}`);
    }

    if (current instanceof Promise) {
      current = await current;
    }
  }

  return current;
}

export function formatResponse(result) {
  if (result === undefined || result === null) {
    return { data: null };
  }

  if (result.data !== undefined) {
    return result;
  }

  if (result.object === 'list' && Array.isArray(result.data)) {
    return { data: result.data };
  }

  return { data: result };
}
