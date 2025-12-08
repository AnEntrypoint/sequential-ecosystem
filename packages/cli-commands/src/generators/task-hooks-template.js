export const graph = {
  initial: 'start',
  states: {
    start: { onDone: 'process' },
    process: { onDone: 'end', onError: 'handleError' },
    handleError: { type: 'final' },
    end: { type: 'final' }
  }
};
`;
}
