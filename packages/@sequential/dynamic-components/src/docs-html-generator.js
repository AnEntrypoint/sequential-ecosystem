// Facade maintaining 100% backward compatibility with HTML documentation generators
import { escapeHtml as escape } from '@sequentialos/text-encoding';
import { generatePatternHTML } from './docs-pattern-generator.js';
import { generateLibraryHTML } from './docs-library-generator.js';

export class DocsHtmlGenerator {
  escapeHtml(text) {
    return escape(text);
  }

  generateHTMLDoc(pattern) {
    return generatePatternHTML(pattern);
  }

  generateLibraryHTML(patterns, categories) {
    return generateLibraryHTML(patterns, categories);
  }
}
