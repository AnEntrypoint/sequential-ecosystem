export async function terminalSession(input) {
  const { instructions = [] } = input;

  if (!Array.isArray(instructions) || instructions.length === 0) {
    return {
      success: false,
      message: 'No instructions provided',
      outputs: [],
      instructions: []
    };
  }

  const outputs = [];

  for (const instruction of instructions) {
    try {
      const result = await __callHostTool__('os', 'execute', { instruction });
      outputs.push({
        instruction,
        output: result.output || '',
        exitCode: result.exitCode || 0,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      outputs.push({
        instruction,
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }

  return {
    success: true,
    outputs,
    instructions,
    totalInstructions: instructions.length,
    timestamp: new Date().toISOString()
  };
}
