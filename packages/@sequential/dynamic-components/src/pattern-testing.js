// Pattern test suite facade - maintains 100% backward compatibility
import { PatternTestSuite } from './test-suite.js';
import { TestContext } from './test-context.js';
import { AssertionError } from './assertion-error.js';
import { Assertion } from './assertion.js';

function createPatternTestSuite(patternId) {
  return new PatternTestSuite(patternId);
}

export { PatternTestSuite, TestContext, AssertionError, Assertion, createPatternTestSuite };
