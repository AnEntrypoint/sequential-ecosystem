export async function use_calculator(input) {
  const { operation = 'add', a = 5, b = 3 } = input;
  
  try {
    const result = await __callHostTool__('calculator', {
      operation,
      a,
      b
    });
    
    return {
      success: true,
      tool: 'calculator',
      input: { operation, a, b },
      output: result,
      message: `Performed ${operation} on ${a} and ${b}`
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}
