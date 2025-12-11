/**
 * template-scaffolder.js
 *
 * Generate flow documentation templates and examples
 */

export function generateFlowDocsTemplate() {
  return `/**
 * Flow Documentation
 *
 * Self-documenting flows with state descriptions and error handling strategies.
 */

import { createFlowDocumenter } from '@sequentialos/flow-docs';

const documenter = createFlowDocumenter();

export const paymentProcessingGraph = {
  initial: 'validatePayment',
  states: {
    validatePayment: { onDone: 'chargeCard', onError: 'handleValidationError' },
    chargeCard: { onDone: 'confirmCharge', onError: 'handleChargeError' },
    confirmCharge: { onDone: 'sendReceipt', onError: 'handleConfirmationError' },
    sendReceipt: { onDone: 'complete', onError: 'handleNotificationError' },
    handleValidationError: { onDone: 'complete' },
    handleChargeError: { onDone: 'complete' },
    handleConfirmationError: { onDone: 'complete' },
    handleNotificationError: { onDone: 'complete' },
    complete: { type: 'final' }
  }
};

// Document the flow
documenter.documentFlow('paymentProcessing', paymentProcessingGraph, {
  purpose: 'Process credit card payments with validation and error recovery',
  description: 'Validates payment details, charges the card, confirms the charge, and sends receipt to customer.',
  version: '1.0.0',
  tags: ['payment', 'critical'],
  states: {
    validatePayment: {
      description: 'Validate card details and amount',
      errorCodes: ['INVALID_CARD', 'INVALID_AMOUNT'],
      recoveryStrategy: 'User re-enters card details'
    },
    chargeCard: {
      description: 'Charge the card via payment processor',
      errorCodes: ['INSUFFICIENT_FUNDS', 'CARD_DECLINED', 'TIMEOUT'],
      recoveryStrategy: 'Retry up to 3 times with exponential backoff',
      timeout: 30000
    },
    confirmCharge: {
      description: 'Confirm charge was successful',
      errorCodes: ['CONFIRMATION_TIMEOUT', 'CONFIRMATION_FAILED'],
      recoveryStrategy: 'Query payment processor for status'
    },
    sendReceipt: {
      description: 'Send email receipt to customer',
      errorCodes: ['EMAIL_INVALID', 'EMAIL_TIMEOUT'],
      recoveryStrategy: 'Queue for retry, user can request receipt later'
    }
  },
  examples: [
    {
      name: 'Successful payment',
      input: { amount: 100, cardToken: 'tok_123' },
      output: { transactionId: 'tx_123', status: 'complete' }
    }
  ]
});

// Get documentation
export function getPaymentFlowDocs() {
  return documenter.getFlowDocumentation('paymentProcessing');
}

// Generate markdown
export function getPaymentFlowMarkdown() {
  return documenter.generateFlowMarkdown('paymentProcessing');
}

// Get summary
export function getPaymentFlowSummary() {
  return documenter.getFlowSummary('paymentProcessing');
}

// Search flows
export function findFlows(query) {
  return documenter.searchFlows(query);
}

// Example: Find all payment-related flows
export function findPaymentFlows() {
  return documenter.searchFlows('payment');
}
`;
}
