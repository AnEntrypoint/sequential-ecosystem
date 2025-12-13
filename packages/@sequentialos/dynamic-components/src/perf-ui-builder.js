// Performance UI visualization
export class PerfUIBuilder {
  buildPerformanceReport(analyzer) {
    const metrics = analyzer.getMetrics();
    const bottlenecks = analyzer.identifyBottlenecks();
    const score = analyzer.getOptimizationScore();

    return {
      timestamp: new Date().toISOString(),
      score,
      metrics,
      bottlenecks,
      summary: {
        totalRenders: analyzer.renderMetrics.length,
        slowRenders: bottlenecks.length,
        averageTime: analyzer.renderMetrics.length > 0
          ? analyzer.renderMetrics.reduce((a, b) => a + b.duration, 0) / analyzer.renderMetrics.length
          : 0
      }
    };
  }

  buildPerformanceUI(analyzer) {
    const report = this.buildPerformanceReport(analyzer);
    const bottlenecks = analyzer.identifyBottlenecks();

    return {
      type: 'box',
      style: {
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        padding: '20px',
        backgroundColor: '#f9f9f9',
        borderRadius: '6px'
      },
      children: [
        {
          type: 'heading',
          content: `Performance Score: ${report.score.toFixed(0)}/100`,
          level: 3,
          style: { margin: 0, fontSize: '18px', fontWeight: 700 }
        },
        {
          type: 'box',
          style: {
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '12px'
          },
          children: [
            {
              type: 'box',
              style: {
                padding: '12px',
                backgroundColor: '#fff',
                borderRadius: '4px',
                border: '1px solid #ddd'
              },
              children: [
                { type: 'text', content: 'Total Renders', style: { fontSize: '12px', color: '#666' } },
                { type: 'heading', content: String(report.summary.totalRenders), level: 5, style: { margin: 0, fontSize: '20px', fontWeight: 600 } }
              ]
            },
            {
              type: 'box',
              style: {
                padding: '12px',
                backgroundColor: '#fff',
                borderRadius: '4px',
                border: '1px solid #ddd'
              },
              children: [
                { type: 'text', content: 'Avg Duration', style: { fontSize: '12px', color: '#666' } },
                { type: 'heading', content: `${report.summary.averageTime.toFixed(1)}ms`, level: 5, style: { margin: 0, fontSize: '20px', fontWeight: 600 } }
              ]
            },
            {
              type: 'box',
              style: {
                padding: '12px',
                backgroundColor: '#fff',
                borderRadius: '4px',
                border: '1px solid #ddd'
              },
              children: [
                { type: 'text', content: 'Bottlenecks', style: { fontSize: '12px', color: '#666' } },
                { type: 'heading', content: String(bottlenecks.length), level: 5, style: { margin: 0, fontSize: '20px', fontWeight: 600, color: bottlenecks.length > 0 ? '#dc3545' : '#28a745' } }
              ]
            }
          ]
        },
        {
          type: 'heading',
          content: 'Bottlenecks',
          level: 4,
          style: { margin: '12px 0 0 0', fontSize: '14px', fontWeight: 600 }
        },
        {
          type: 'box',
          style: {
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
          },
          children: bottlenecks.slice(0, 5).map(bottleneck => ({
            type: 'box',
            style: {
              padding: '12px',
              backgroundColor: '#fff',
              border: `1px solid ${bottleneck.severity === 'high' ? '#dc3545' : '#ffc107'}`,
              borderRadius: '4px'
            },
            children: [
              {
                type: 'text',
                content: bottleneck.message,
                style: { fontWeight: 500, fontSize: '12px' }
              },
              {
                type: 'text',
                content: bottleneck.suggestion,
                style: { fontSize: '11px', color: '#666', margin: '4px 0 0 0' }
              }
            ]
          }))
        }
      ]
    };
  }
}
