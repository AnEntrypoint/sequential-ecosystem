export function fuzzyMatch(tools, query) {
  if (!query) return tools.slice(0, 10);

  const scored = tools.map(tool => ({
    tool,
    score: calculateScore(query, tool.name)
  })).filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 10);

  return scored.map(item => item.tool);
}

export function calculateScore(query, name) {
  if (!query) return 1;

  const lowerName = name.toLowerCase();
  const lowerQuery = query.toLowerCase();

  if (lowerName === lowerQuery) return 100;
  if (lowerName.startsWith(lowerQuery)) return 50;
  if (lowerName.includes(lowerQuery)) return 25;

  let score = 0;
  let queryIdx = 0;
  for (let i = 0; i < lowerName.length && queryIdx < lowerQuery.length; i++) {
    if (lowerName[i] === lowerQuery[queryIdx]) {
      score += 1;
      queryIdx++;
    }
  }

  return queryIdx === lowerQuery.length ? score : 0;
}

export function highlightMatch(text, query) {
  if (!query) return text;
  const regex = new RegExp(`(${query})`, 'gi');
  return text.replace(regex, '<span style="background: #4ade80; color: #1a1a1a; font-weight: 700;">$1</span>');
}
