import path from 'path';
import { randomUUID } from 'crypto';
import { writeFileAtomicString } from '@sequentialos/file-operations';
import logger from '@sequentialos/sequential-logging';
import { nowISO } from '@sequentialos/timestamp-utilities';

export async function createExampleFlowsCode(tasksDir) {
  const examples = [
    {
      name: 'example-flow-calls-task',
      description: 'Flow that calls other tasks in sequence',
      code: `export const config = {
  name: 'example-flow-calls-task',
  description: 'Demonstrates flow calling multiple tasks',
  runner: 'sequential-flow',
  inputs: [{ name: 'email', type: 'string', default: 'user@example.com' }]
};

export const graph = {
  initial: 'validateEmail',
  states: {
    validateEmail: {
      onDone: 'checkIfExists',
      onError: 'handleValidationError'
    },
    checkIfExists: {
      onDone: 'fetchData',
      onError: 'handleCheckError'
    },
    fetchData: {
      onDone: 'complete',
      onError: 'handleFetchError'
    },
    handleValidationError: { type: 'final' },
    handleCheckError: { type: 'final' },
    handleFetchError: { type: 'final' },
    complete: { type: 'final' }
  }
};

export async function validateEmail(input) {
  const { email } = input;
  const result = await __callHostTool__('task', 'example-validate-input', {
    email,
    field: 'email'
  });
  if (!result.success) throw new Error(result.error);
  return { validated: true, email };
}

export async function checkIfExists(result) {
  const existsResult = await __callHostTool__('task', 'example-check-existing', {
    email: result.email
  });
  return {
    email: result.email,
    exists: existsResult.exists
  };
}

export async function fetchData(result) {
  const profileResult = await __callHostTool__('task', 'example-fetch-profile', {
    email: result.email
  });
  return {
    email: result.email,
    exists: result.exists,
    profile: profileResult.data
  };
}

export async function handleValidationError(error) {
  return { success: false, error: 'Validation failed', details: error.message };
}

export async function handleCheckError(error) {
  return { success: false, error: 'Check failed', details: error.message };
}

export async function handleFetchError(error) {
  return { success: false, error: 'Fetch failed', details: error.message };
}
`
    },
    {
      name: 'example-flow-calls-tool',
      description: 'Flow that calls tools and processes results',
      code: `export const config = {
  name: 'example-flow-calls-tool',
  description: 'Demonstrates flow calling tools and coordinating results',
  runner: 'sequential-flow',
  inputs: [
    { name: 'userId', type: 'string', default: '123' },
    { name: 'action', type: 'string', default: 'read' }
  ]
};

export const graph = {
  initial: 'fetchUser',
  states: {
    fetchUser: {
      onDone: 'processUser',
      onError: 'handleError'
    },
    processUser: {
      onDone: 'logOperation',
      onError: 'handleError'
    },
    logOperation: {
      onDone: 'complete',
      onError: 'handleError'
    },
    handleError: { type: 'final' },
    complete: { type: 'final' }
  }
};

export async function fetchUser(input) {
  const { userId } = input;
  const user = await __callHostTool__('database', 'query', {
    sql: 'SELECT * FROM users WHERE id = ?',
    params: [userId]
  });
  if (!user) throw new Error('User not found');
  return { user, userId };
}

export async function processUser(result) {
  const { user } = result;
  const enriched = {
    ...user,
    processed: true,
    processedAt: new Date().toISOString(),
    status: user.active ? 'active' : 'inactive'
  };
  return enriched;
}

export async function logOperation(result) {
  const logged = await __callHostTool__('database', 'log', {
    userId: result.id,
    action: 'flow_execution',
    metadata: result
  });
  return {
    success: true,
    user: result,
    logId: logged.id
  };
}

export async function handleError(error) {
  return {
    success: false,
    error: error.message,
    timestamp: new Date().toISOString()
  };
}
`
    },
    {
      name: 'example-flow-orchestration',
      description: 'Complex flow demonstrating error handling and branching',
      code: `export const config = {
  name: 'example-flow-orchestration',
  description: 'Advanced flow with error paths and conditional branching',
  runner: 'sequential-flow',
  inputs: [
    { name: 'orderId', type: 'string', default: 'ORD-001' },
    { name: 'amount', type: 'number', default: 100 }
  ]
};

export const graph = {
  initial: 'validateOrder',
  states: {
    validateOrder: {
      onDone: 'checkInventory',
      onError: 'orderError'
    },
    checkInventory: {
      onDone: 'processPayment',
      onError: 'inventoryError'
    },
    processPayment: {
      onDone: 'createShipment',
      onError: 'paymentError'
    },
    createShipment: {
      onDone: 'sendConfirmation',
      onError: 'shipmentError'
    },
    sendConfirmation: {
      onDone: 'complete',
      onError: 'notificationError'
    },
    orderError: { type: 'final' },
    inventoryError: { type: 'final' },
    paymentError: { type: 'final' },
    shipmentError: { type: 'final' },
    notificationError: { type: 'final' },
    complete: { type: 'final' }
  }
};

export async function validateOrder(input) {
  const { orderId, amount } = input;
  if (!orderId) throw new Error('Order ID required');
  if (amount <= 0) throw new Error('Invalid amount');
  return { orderId, amount, validated: true };
}

export async function checkInventory(result) {
  const inventory = await __callHostTool__('database', 'query', {
    sql: 'SELECT quantity FROM inventory WHERE order_id = ?',
    params: [result.orderId]
  });
  if (!inventory || inventory.quantity < 1) {
    throw new Error('Out of stock');
  }
  return { ...result, inventory: inventory.quantity };
}

export async function processPayment(result) {
  const payment = await __callHostTool__('database', 'execute', {
    sql: 'INSERT INTO payments (order_id, amount, status) VALUES (?, ?, ?)',
    params: [result.orderId, result.amount, 'completed']
  });
  return { ...result, paymentId: payment.insertId };
}

export async function createShipment(result) {
  const shipment = await __callHostTool__('database', 'execute', {
    sql: 'INSERT INTO shipments (order_id, status) VALUES (?, ?)',
    params: [result.orderId, 'processing']
  });
  return { ...result, shipmentId: shipment.insertId };
}

export async function sendConfirmation(result) {
  const sent = await __callHostTool__('database', 'execute', {
    sql: 'UPDATE orders SET status = ? WHERE id = ?',
    params: ['shipped', result.orderId]
  });
  return {
    success: true,
    order: result.orderId,
    payment: result.paymentId,
    shipment: result.shipmentId,
    timestamp: new Date().toISOString()
  };
}

export async function orderError(error) {
  return { success: false, error: 'Order validation failed', details: error.message };
}

export async function inventoryError(error) {
  return { success: false, error: 'Inventory check failed', details: error.message };
}

export async function paymentError(error) {
  return { success: false, error: 'Payment processing failed', details: error.message };
}

export async function shipmentError(error) {
  return { success: false, error: 'Shipment creation failed', details: error.message };
}

export async function notificationError(error) {
  return { success: false, error: 'Notification sending failed', details: error.message };
}
`
    }
  ];

  for (const example of examples) {
    const taskFile = path.join(tasksDir, example.name, 'code.js');
    const configFile = path.join(tasksDir, example.name, 'config.json');

    await writeFileAtomicString(taskFile, example.code);
    logger.info(`  ✓ Created ${example.name}/code.js`);

    const config = {
      id: randomUUID(),
      name: example.name,
      description: example.description,
      runner: 'sequential-flow',
      created: nowISO()
    };
    await writeFileAtomicString(configFile, JSON.stringify(config, null, 2));
  }
}
