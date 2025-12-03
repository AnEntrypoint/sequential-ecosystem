export async function use_transformer(input) {
  const { data = 'hello world', type = 'uppercase' } = input;
  
  try {
    const result = await __callHostTool__('transformer', {
      data,
      type
    });
    
    return {
      success: true,
      tool: 'transformer',
      input: { data, type },
      output: result,
      message: `Applied ${type} transformation`
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}
