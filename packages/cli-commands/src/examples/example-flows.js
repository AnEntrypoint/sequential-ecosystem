import path from 'path';
import { ensureDirectory, writeFileAtomicString } from '@sequential/file-operations';
import logger from '@sequential/sequential-logging';

export async function createExampleFlows(tasksDir) {
  const flowsDir = path.join(tasksDir, 'flows');
  await ensureDirectory(flowsDir);

  const flows = [
    {
      name: 'user-authentication.json',
      content: {
        id: 'user-authentication',
        name: 'User Authentication Flow',
        description: 'Complete user authentication workflow with validation',
        states: {
          start: { type: 'initial', on: { NEXT: 'validateInput' } },
          validateInput: {
            type: 'normal',
            on: { SUCCESS: 'checkDatabase', ERROR: 'validationError' }
          },
          checkDatabase: {
            type: 'normal',
            on: { FOUND: 'verifyPassword', NOT_FOUND: 'userNotFound' }
          },
          verifyPassword: {
            type: 'normal',
            on: { VALID: 'generateToken', INVALID: 'invalidPassword' }
          },
          generateToken: {
            type: 'normal',
            on: { SUCCESS: 'complete' }
          },
          validationError: { type: 'final', error: true },
          userNotFound: { type: 'final', error: true },
          invalidPassword: { type: 'final', error: true },
          complete: { type: 'final', success: true }
        }
      }
    },
    {
      name: 'data-pipeline.json',
      content: {
        id: 'data-pipeline',
        name: 'ETL Data Pipeline',
        description: 'Extract, transform, load data processing workflow',
        states: {
          start: { type: 'initial', on: { NEXT: 'extract' } },
          extract: {
            type: 'normal',
            on: { SUCCESS: 'validate', ERROR: 'extractError' }
          },
          validate: {
            type: 'normal',
            on: { VALID: 'transform', INVALID: 'validationError' }
          },
          transform: {
            type: 'normal',
            on: { SUCCESS: 'load', ERROR: 'transformError' }
          },
          load: {
            type: 'normal',
            on: { SUCCESS: 'complete', ERROR: 'loadError' }
          },
          extractError: { type: 'final', error: true },
          validationError: { type: 'final', error: true },
          transformError: { type: 'final', error: true },
          loadError: { type: 'final', error: true },
          complete: { type: 'final', success: true }
        }
      }
    },
    {
      name: 'order-processing.json',
      content: {
        id: 'order-processing',
        name: 'E-commerce Order Processing',
        description: 'Handle order from creation to fulfillment',
        states: {
          start: { type: 'initial', on: { NEXT: 'validateOrder' } },
          validateOrder: {
            type: 'normal',
            on: { VALID: 'checkInventory', INVALID: 'orderError' }
          },
          checkInventory: {
            type: 'normal',
            on: { AVAILABLE: 'processPayment', OUT_OF_STOCK: 'inventoryError' }
          },
          processPayment: {
            type: 'normal',
            on: { SUCCESS: 'createShipment', FAILED: 'paymentError' }
          },
          createShipment: {
            type: 'normal',
            on: { SUCCESS: 'sendNotification' }
          },
          sendNotification: {
            type: 'normal',
            on: { SUCCESS: 'complete' }
          },
          orderError: { type: 'final', error: true },
          inventoryError: { type: 'final', error: true },
          paymentError: { type: 'final', error: true },
          complete: { type: 'final', success: true }
        }
      }
    }
  ];

  for (const flow of flows) {
    const filePath = path.join(flowsDir, flow.name);
    await writeFileAtomicString(filePath, JSON.stringify(flow.content, null, 2));
    logger.info(`  ✓ Created example flow: ${flow.name}`);
  }

  return flowsDir;
}
