/**
 * Flow Parallel Core - Template Module
 * Code template generation for parallel flows
 */

export function generateParallelFlowTemplate() {
  return `/**
 * Parallel Flow
 *
 * Execute multiple independent branches in parallel.
 */

export const graph = {
  initial: 'fetchData',
  states: {
    fetchData: {
      type: 'parallel',
      branches: [
        { name: 'fetchUser', startState: 'getUserData', endState: 'userDataReady' },
        { name: 'fetchOrders', startState: 'getOrderData', endState: 'ordersDataReady' }
      ],
      joinCondition: 'all',
      onDone: 'combineResults'
    },

    getUserData: {
      onDone: 'userDataReady'
    },
    userDataReady: {
      type: 'join'
    },

    getOrderData: {
      onDone: 'ordersDataReady'
    },
    ordersDataReady: {
      type: 'join'
    },

    combineResults: {
      onDone: 'final'
    },

    final: {
      type: 'final'
    }
  }
};

export async function getUserData(input) {
  return {
    ...input,
    user: await __callHostTool__('task', 'fetch-user', { id: input.userId })
  };
}

export async function getOrderData(input) {
  return {
    ...input,
    orders: await __callHostTool__('task', 'fetch-orders', { userId: input.userId })
  };
}

export async function combineResults(input) {
  return {
    success: true,
    user: input.user,
    orders: input.orders,
    totalOrders: input.orders?.length || 0
  };
}

// Join conditions:
// - 'all': All branches must succeed
// - 'any': At least one branch must succeed
// - 'count': Specified number of branches must succeed
`;
}
