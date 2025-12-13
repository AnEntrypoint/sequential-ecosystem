export const graph = {
  initial: 'fetchData',
  states: {
    fetchData: { onDone: 'processData' },
    processData: { onDone: 'complete' },
    complete: { type: 'final' }
  }
};
