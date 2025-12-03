export async function nested_task_demo(input) {
  try {
    const step1 = await __callHostTool__('calculator', {
      operation: 'add',
      a: 10,
      b: 5
    });
    
    const step2 = await __callHostTool__('transformer', {
      data: step1.result.toString(),
      type: 'reverse'
    });
    
    return {
      success: true,
      message: 'Nested orchestration complete',
      steps: [
        { name: 'calculator', result: step1.result },
        { name: 'transformer', result: step2.transformed }
      ]
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}
