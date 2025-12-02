import path from 'path';
import { randomUUID } from 'crypto';
import { writeFileAtomicString } from '@sequential/file-operations';

export async function createPaymentFlowExample(tasksDir) {
  const taskName = 'example-payment-flow';
  const taskFile = path.join(tasksDir, `${taskName}.js`);
  const taskId = randomUUID();
  const timestamp = new Date().toISOString();

  const code = `export const config = {
  name: '${taskName}',
  description: 'Payment processing with external API and email confirmation',
  id: '${taskId}',
  created: '${timestamp}',
  runner: 'sequential-flow',
  timeout: 30000,
  retryCount: 3,
  inputs: [
    {
      name: 'orderId',
      type: 'string',
      description: 'Order identifier',
      required: true
    },
    {
      name: 'amount',
      type: 'number',
      description: 'Payment amount',
      required: true
    },
    {
      name: 'currency',
      type: 'string',
      description: 'Currency code',
      default: 'USD'
    }
  ]
};

export async function example_payment_flow(input) {
  const { orderId, amount, currency = 'USD' } = input;

  if (!orderId || !amount) {
    throw new Error('Missing required fields: orderId, amount');
  }

  if (amount <= 0) {
    throw new Error('Amount must be positive');
  }

  const paymentRequest = await fetch('https://api.payment.example.com/charge', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ orderId, amount, currency })
  }).then(r => r.json());

  if (!paymentRequest.success) {
    throw new Error(\`Payment failed: \${paymentRequest.error}\`);
  }

  const transactionId = paymentRequest.transaction_id;

  const confirmationEmail = await fetch('https://api.mail.example.com/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      to: paymentRequest.customer_email,
      subject: 'Payment Confirmation',
      template: 'payment-receipt',
      data: { orderId, amount, transactionId }
    })
  }).then(r => r.json());

  return {
    success: true,
    transactionId,
    amount,
    currency,
    status: 'completed',
    emailSent: confirmationEmail.success,
    timestamp: new Date().toISOString()
  };
}`;

  await writeFileAtomicString(taskFile, code);
  console.log(`  ✓ example-payment-flow (payment processing with email)`);
}
