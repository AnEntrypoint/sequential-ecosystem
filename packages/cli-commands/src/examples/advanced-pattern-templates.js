/**
 * Advanced Pattern Example Templates
 * Code templates for retry, error handling, parallelization, and state management examples
 */

export const ADVANCED_PATTERN_TEMPLATES = [
  {
    name: 'example-retry-pattern',
    description: 'Demonstrates retry with exponential backoff',
    code: 'export const config = {\n  name: \'example-retry-pattern\',\n  description: \'Task with automatic retry and backoff\',\n  runner: \'sequential-flow\',\n  inputs: [{ name: \'url\', type: \'string\', default: \'https://api.example.com/data\' }]\n};\n\nasync function fetchWithRetry(url, maxRetries = 3, delay = 1000) {\n  for (let attempt = 0; attempt <= maxRetries; attempt++) {\n    try {\n      const response = await fetch(url);\n      if (!response.ok) throw new Error(`HTTP ${response.status}`);\n      return await response.json();\n    } catch (error) {\n      if (attempt === maxRetries) throw error;\n      const backoffDelay = delay * Math.pow(2, attempt);\n      await new Promise(r => setTimeout(r, backoffDelay));\n    }\n  }\n}\n\nexport async function main(input) {\n  const { url } = input;\n  try {\n    const data = await fetchWithRetry(url);\n    return { success: true, data };\n  } catch (error) {\n    return { success: false, error: error.message };\n  }\n}'
  },
  {
    name: 'example-error-boundary',
    description: 'Demonstrates error handling and recovery',
    code: 'export const config = {\n  name: \'example-error-boundary\',\n  description: \'Task with error handling and fallback strategy\',\n  runner: \'sequential-flow\',\n  inputs: [{ name: \'source\', type: \'string\', default: \'primary\' }]\n};\n\nasync function fetchFromSource(source) {\n  const sources = {\n    primary: \'https://api.example.com/primary\',\n    secondary: \'https://api.example.com/secondary\',\n    fallback: \'https://api.example.com/fallback\'\n  };\n\n  const url = sources[source] || sources.primary;\n  const response = await fetch(url);\n  if (!response.ok) throw new Error(`Source ${source} failed`);\n  return await response.json();\n}\n\nexport async function main(input) {\n  const { source } = input;\n  const sourceOrder = [\'primary\', \'secondary\', \'fallback\'];\n\n  for (const src of sourceOrder) {\n    try {\n      const data = await fetchFromSource(src);\n      return {\n        success: true,\n        data,\n        source: src,\n        timestamp: new Date().toISOString()\n      };\n    } catch (error) {\n      if (src === sourceOrder[sourceOrder.length - 1]) {\n        return {\n          success: false,\n          error: \'All sources exhausted\',\n          lastError: error.message\n        };\n      }\n    }\n  }\n}'
  },
  {
    name: 'example-parallel-execution',
    description: 'Demonstrates parallel task execution',
    code: 'export const config = {\n  name: \'example-parallel-execution\',\n  description: \'Execute multiple operations in parallel\',\n  runner: \'sequential-flow\',\n  inputs: [\n    { name: \'userIds\', type: \'string\', default: \'1,2,3\' }\n  ]\n};\n\nasync function fetchUser(userId) {\n  const response = await fetch(`https://api.example.com/users/${userId}`);\n  if (!response.ok) throw new Error(`User ${userId} not found`);\n  return await response.json();\n}\n\nexport async function main(input) {\n  const { userIds } = input;\n  const ids = userIds.split(\',\').map(id => id.trim());\n\n  try {\n    const results = await Promise.all(\n      ids.map(id => fetchUser(id))\n    );\n\n    return {\n      success: true,\n      count: results.length,\n      users: results,\n      timestamp: new Date().toISOString()\n    };\n  } catch (error) {\n    return {\n      success: false,\n      error: error.message\n    };\n  }\n}'
  },
  {
    name: 'example-state-management',
    description: 'Demonstrates state tracking across steps',
    code: 'export const config = {\n  name: \'example-state-management\',\n  description: \'Track and manage state throughout execution\',\n  runner: \'sequential-flow\',\n  inputs: [\n    { name: \'items\', type: \'string\', default: \'a,b,c\' }\n  ]\n};\n\nexport async function main(input) {\n  const { items } = input;\n  const state = {\n    processed: [],\n    failed: [],\n    startTime: new Date(),\n    steps: []\n  };\n\n  const itemList = items.split(\',\').map(i => i.trim());\n\n  for (const item of itemList) {\n    state.steps.push({\n      item,\n      status: \'processing\',\n      timestamp: new Date().toISOString()\n    });\n\n    try {\n      const result = await fetch(`https://api.example.com/process?item=${item}`);\n      state.processed.push(item);\n      state.steps[state.steps.length - 1].status = \'completed\';\n    } catch (error) {\n      state.failed.push(item);\n      state.steps[state.steps.length - 1].status = \'failed\';\n    }\n  }\n\n  return {\n    success: state.failed.length === 0,\n    state: {\n      processedCount: state.processed.length,\n      failedCount: state.failed.length,\n      duration: new Date() - state.startTime,\n      items: state.processed,\n      failed: state.failed,\n      steps: state.steps\n    }\n  };\n}'
  }
];
