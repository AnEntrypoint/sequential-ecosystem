/**
 * conditional-template.js
 *
 * Generate conditional flow templates
 */

export function generateConditionalFlowTemplate() {
  return `/**
 * Conditional Flow
 *
 * Implement if/switch logic within flows.
 */

export const graph = {
  initial: 'checkStatus',
  states: {
    checkStatus: {
      type: 'conditional',
      condition: (context) => context.status === 'pending',
      onTrue: 'processPending',
      onFalse: 'skipProcessing'
    },
    processPending: {
      onDone: 'final'
    },
    skipProcessing: {
      onDone: 'final'
    },
    final: {
      type: 'final'
    }
  }
};

export async function checkStatus(input) {
  return {
    status: input.status || 'pending',
    message: 'Status checked'
  };
}

export async function processPending(data) {
  return { ...data, processed: true };
}

export async function skipProcessing(data) {
  return { ...data, skipped: true };
}

// Usage with switch:
// export const switchGraph = {
//   initial: 'routeByType',
//   states: {
//     routeByType: {
//       type: 'switch',
//       selector: (context) => context.type,
//       cases: {
//         'user': 'handleUser',
//         'admin': 'handleAdmin',
//         'guest': 'handleGuest'
//       },
//       default: 'handleUnknown'
//     },
//     handleUser: { onDone: 'final' },
//     handleAdmin: { onDone: 'final' },
//     handleGuest: { onDone: 'final' },
//     handleUnknown: { onDone: 'final' },
//     final: { type: 'final' }
//   }
// };
`;
}
