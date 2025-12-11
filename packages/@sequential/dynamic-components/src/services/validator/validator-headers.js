// Header builders - compliance header and level selector
export function buildComplianceHeader(core, results) {
  const score = core.getComplianceScore(results);

  return {
    type: 'box',
    style: {
      padding: '12px',
      backgroundColor: '#fff',
      borderRadius: '4px',
      border: `2px solid ${score >= 80 ? '#28a745' : score >= 60 ? '#ffc107' : '#dc3545'}`
    },
    children: [
      {
        type: 'heading',
        content: `WCAG ${results.level} Compliance: ${score}%`,
        level: 4,
        style: {
          margin: 0,
          fontSize: '14px',
          fontWeight: 700,
          color: score >= 80 ? '#28a745' : score >= 60 ? '#ffc107' : '#dc3545'
        }
      }
    ]
  };
}

export function buildLevelSelector(core) {
  return {
    type: 'box',
    style: {
      display: 'flex',
      gap: '8px'
    },
    children: [
      {
        type: 'text',
        content: 'Level:',
        style: { fontSize: '12px', fontWeight: 600, alignSelf: 'center' }
      },
      ...['A', 'AA', 'AAA'].map(level => ({
        type: 'button',
        content: level,
        style: {
          padding: '6px 12px',
          backgroundColor: core.selectedLevel === level ? '#667eea' : '#e0e0e0',
          color: core.selectedLevel === level ? '#fff' : '#333',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          fontSize: '12px',
          fontWeight: core.selectedLevel === level ? 600 : 400
        }
      }))
    ]
  };
}
