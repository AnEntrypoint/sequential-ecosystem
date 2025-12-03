import path from 'path';
import { randomUUID } from 'crypto';
import { writeFileAtomicString } from '@sequential/file-operations';
import logger from '@sequential/sequential-logging';

export async function createPaymentFlowExample(tasksDir) {
  const taskName = 'example-payment-flow';
  const taskFile = path.join(tasksDir, `${taskName}.js`);
  const taskId = randomUUID();
  const timestamp = new Date().toISOString();

  const code = `export const config = {
  name: '${taskName}',
  description: 'Order processing with validation and confirmation',
  id: '${taskId}',
  created: '${timestamp}',
  runner: 'sequential-flow',
  inputs: [
    {
      name: 'orderId',
      type: 'string',
      description: 'Order identifier',
      default: 'ORDER-' + Date.now()
    },
    {
      name: 'items',
      type: 'array',
      description: 'Items in order',
      default: [{name: 'Item A', price: 19.99}, {name: 'Item B', price: 29.99}]
    },
    {
      name: 'customerEmail',
      type: 'string',
      description: 'Customer email',
      default: 'customer@example.com'
    }
  ]
};

export async function example_payment_flow(input) {
  const { orderId, items = [], customerEmail } = input;

  logger.info(\`Processing order \${orderId}\`);

  const validation = {
    orderId: !!orderId && orderId.length > 0,
    items: Array.isArray(items) && items.length > 0,
    email: !!customerEmail && customerEmail.includes('@')
  };

  if (!Object.values(validation).every(v => v)) {
    throw new Error('Invalid order data: ' + JSON.stringify(validation));
  }

  const totalAmount = items.reduce((sum, item) => sum + (item.price || 0), 0);
  logger.info(\`Order total: \$\${totalAmount.toFixed(2)}\`);

  const transactionId = 'TXN-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);

  return {
    success: true,
    orderId,
    transactionId,
    totalAmount: totalAmount.toFixed(2),
    itemCount: items.length,
    customerEmail,
    status: 'confirmed',
    timestamp: new Date().toISOString(),
    items: items.map((item, idx) => ({
      ...item,
      index: idx,
      processed: true
    }))
  };
}`;

  await writeFileAtomicString(taskFile, code);
  logger.info(`  ✓ example-payment-flow (order processing)`);
}
