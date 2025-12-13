import { coreConceptsSection } from './doc-core-concepts.js';
import { patternsGuideSection } from './doc-patterns-guide.js';
import { operationsSection } from './doc-operations.js';
import { apiReferenceSection } from './doc-api-reference.js';

export function generateTechnicalDocumentation() {
  const toc = `# Sequential Ecosystem - Complete Technical Reference

## Table of Contents
1. Core Concepts & Philosophy
2. Architecture & Design Patterns
3. Writing Tasks (Implicit & Explicit)
4. Dynamic React Component System
5. Advanced Patterns & Recipes
6. Storage Backends
7. Visual Component Builder
8. API Reference
9. CLI Commands
10. Deployment & Scaling
11. Troubleshooting
12. Best Practices
13. Examples

---
`;

  return toc +
    coreConceptsSection() +
    patternsGuideSection() +
    operationsSection() +
    apiReferenceSection();
}
