// Pattern optimization suggestions
export class AISuggestionOptimizer {
  suggestOptimizations(patternId, definition) {
    const suggestions = [];

    if (definition.style) {
      if (definition.style.width === '100%' && definition.style.height === '100%') {
        suggestions.push({
          type: 'layout',
          message: 'Consider using viewport units or flex layout instead of fixed 100%.',
          impact: 'medium'
        });
      }

      if (definition.style.padding && definition.style.margin) {
        suggestions.push({
          type: 'spacing',
          message: 'Both padding and margin applied. Ensure intentional stacking context.',
          impact: 'low'
        });
      }
    }

    if (definition.children?.length > 10) {
      suggestions.push({
        type: 'structure',
        message: 'Consider virtualizing long lists or pagination for better performance.',
        impact: 'high'
      });
    }

    return suggestions;
  }
}
