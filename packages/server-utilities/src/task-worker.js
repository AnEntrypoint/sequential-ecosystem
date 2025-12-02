import { parentPort } from 'worker_threads';

function extractFunctionBody(code) {
  const openBraceIndex = code.indexOf('{');
  if (openBraceIndex === -1) {
    return code;
  }

  let braceCount = 0;
  let closeBraceIndex = -1;

  for (let i = openBraceIndex; i < code.length; i++) {
    if (code[i] === '{') braceCount++;
    if (code[i] === '}') {
      braceCount--;
      if (braceCount === 0) {
        closeBraceIndex = i;
        break;
      }
    }
  }

  if (closeBraceIndex !== -1) {
    return code.substring(openBraceIndex + 1, closeBraceIndex);
  }

  return code;
}

parentPort.on('message', async (message) => {
  const { taskCode, input, taskName } = message;

  try {
    const body = extractFunctionBody(taskCode);
    const fn = new Function('input', '__callHostTool__', `return (async (input) => { ${body} })(input)`);
    const result = await fn(input || {}, async () => {});
    parentPort.postMessage({ success: true, result });
  } catch (error) {
    parentPort.postMessage({
      success: false,
      error: error.message,
      stack: error.stack
    });
  }
});
