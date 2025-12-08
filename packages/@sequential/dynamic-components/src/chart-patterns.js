class ChartPatternLibrary {
  constructor() {
    this.patterns = new Map();
    this.registerAllPatterns();
  }

  registerAllPatterns() {
    this.registerLineChart();
    this.registerBarChart();
    this.registerPieChart();
    this.registerAreaChart();
    this.registerSparklineChart();
    this.registerScatterChart();
    this.registerGaugeChart();
    this.registerHeatmapChart();
  }

  registerLineChart() {
    this.patterns.set('line-chart', {
      id: 'line-chart',
      name: 'Line Chart',
      icon: '📈',
      category: 'charts',
      codeReduction: '86%',
      description: 'Time-series data visualization with trend lines',
      definition: {
        type: 'flex',
        direction: 'column',
        gap: '16px',
        style: { padding: '20px', background: '#fff', borderRadius: '8px', border: '1px solid #e0e0e0' },
        children: [
          {
            type: 'flex',
            direction: 'row',
            justifyContent: 'space-between',
            style: { alignItems: 'center' },
            children: [
              { type: 'heading', content: 'Monthly Revenue', level: 3, style: { margin: 0 } },
              { type: 'paragraph', content: 'Last 12 months', style: { margin: 0, fontSize: '12px', color: '#666' } }
            ]
          },
          {
            type: 'box',
            style: {
              width: '100%',
              height: '300px',
              background: '#f9f9f9',
              borderRadius: '6px',
              padding: '20px',
              position: 'relative',
              border: '1px solid #e0e0e0'
            },
            children: [
              {
                type: 'flex',
                direction: 'row',
                justifyContent: 'space-around',
                style: { height: '100%', alignItems: 'flex-end', gap: '8px' },
                children: [
                  { type: 'box', style: { width: '3px', height: '30%', background: '#0078d4', borderRadius: '2px', position: 'relative' } },
                  { type: 'box', style: { width: '3px', height: '45%', background: '#0078d4', borderRadius: '2px', position: 'relative' } },
                  { type: 'box', style: { width: '3px', height: '35%', background: '#0078d4', borderRadius: '2px', position: 'relative' } },
                  { type: 'box', style: { width: '3px', height: '55%', background: '#0078d4', borderRadius: '2px', position: 'relative' } },
                  { type: 'box', style: { width: '3px', height: '65%', background: '#0078d4', borderRadius: '2px', position: 'relative' } },
                  { type: 'box', style: { width: '3px', height: '75%', background: '#0078d4', borderRadius: '2px', position: 'relative' } },
                  { type: 'box', style: { width: '3px', height: '70%', background: '#0078d4', borderRadius: '2px', position: 'relative' } },
                  { type: 'box', style: { width: '3px', height: '60%', background: '#0078d4', borderRadius: '2px', position: 'relative' } },
                  { type: 'box', style: { width: '3px', height: '80%', background: '#0078d4', borderRadius: '2px', position: 'relative' } },
                  { type: 'box', style: { width: '3px', height: '85%', background: '#0078d4', borderRadius: '2px', position: 'relative' } },
                  { type: 'box', style: { width: '3px', height: '90%', background: '#0078d4', borderRadius: '2px', position: 'relative' } },
                  { type: 'box', style: { width: '3px', height: '95%', background: '#0078d4', borderRadius: '2px', position: 'relative' } }
                ]
              }
            ]
          },
          {
            type: 'flex',
            direction: 'row',
            justifyContent: 'space-between',
            style: { padding: '12px', background: '#f5f5f5', borderRadius: '6px' },
            children: [
              { type: 'paragraph', content: '↑ 24.5% vs last month', style: { margin: 0, fontSize: '13px', color: '#2e7d32', fontWeight: '600' } },
              { type: 'paragraph', content: 'Total: $125,480', style: { margin: 0, fontSize: '13px', fontWeight: '600' } }
            ]
          }
        ]
      },
      tags: ['chart', 'time-series', 'trends', 'analytics'],
      author: 'system'
    });
  }

  registerBarChart() {
    this.patterns.set('bar-chart', {
      id: 'bar-chart',
      name: 'Bar Chart',
      icon: '📊',
      category: 'charts',
      codeReduction: '84%',
      description: 'Categorical data comparison across categories',
      definition: {
        type: 'flex',
        direction: 'column',
        gap: '16px',
        style: { padding: '20px', background: '#fff', borderRadius: '8px', border: '1px solid #e0e0e0' },
        children: [
          {
            type: 'flex',
            direction: 'row',
            justifyContent: 'space-between',
            style: { alignItems: 'center' },
            children: [
              { type: 'heading', content: 'Sales by Region', level: 3, style: { margin: 0 } },
              { type: 'paragraph', content: 'Q4 2025', style: { margin: 0, fontSize: '12px', color: '#666' } }
            ]
          },
          {
            type: 'flex',
            direction: 'column',
            gap: '12px',
            children: [
              {
                type: 'flex',
                direction: 'row',
                gap: '12px',
                style: { alignItems: 'center' },
                children: [
                  { type: 'paragraph', content: 'North', style: { margin: 0, width: '60px', fontSize: '13px', fontWeight: '500' } },
                  { type: 'box', style: { flex: 1, height: '28px', background: '#0078d4', borderRadius: '4px' } },
                  { type: 'paragraph', content: '$45.2K', style: { margin: 0, width: '60px', textAlign: 'right', fontSize: '13px', fontWeight: '600' } }
                ]
              },
              {
                type: 'flex',
                direction: 'row',
                gap: '12px',
                style: { alignItems: 'center' },
                children: [
                  { type: 'paragraph', content: 'South', style: { margin: 0, width: '60px', fontSize: '13px', fontWeight: '500' } },
                  { type: 'box', style: { flex: 1, height: '28px', background: '#0078d4', borderRadius: '4px', maxWidth: '66%' } },
                  { type: 'paragraph', content: '$32.5K', style: { margin: 0, width: '60px', textAlign: 'right', fontSize: '13px', fontWeight: '600' } }
                ]
              },
              {
                type: 'flex',
                direction: 'row',
                gap: '12px',
                style: { alignItems: 'center' },
                children: [
                  { type: 'paragraph', content: 'East', style: { margin: 0, width: '60px', fontSize: '13px', fontWeight: '500' } },
                  { type: 'box', style: { flex: 1, height: '28px', background: '#0078d4', borderRadius: '4px', maxWidth: '88%' } },
                  { type: 'paragraph', content: '$52.1K', style: { margin: 0, width: '60px', textAlign: 'right', fontSize: '13px', fontWeight: '600' } }
                ]
              },
              {
                type: 'flex',
                direction: 'row',
                gap: '12px',
                style: { alignItems: 'center' },
                children: [
                  { type: 'paragraph', content: 'West', style: { margin: 0, width: '60px', fontSize: '13px', fontWeight: '500' } },
                  { type: 'box', style: { flex: 1, height: '28px', background: '#0078d4', borderRadius: '4px', maxWidth: '75%' } },
                  { type: 'paragraph', content: '$38.9K', style: { margin: 0, width: '60px', textAlign: 'right', fontSize: '13px', fontWeight: '600' } }
                ]
              }
            ]
          }
        ]
      },
      tags: ['chart', 'comparison', 'categories', 'distribution'],
      author: 'system'
    });
  }

  registerPieChart() {
    this.patterns.set('pie-chart', {
      id: 'pie-chart',
      name: 'Pie Chart',
      icon: '🥧',
      category: 'charts',
      codeReduction: '82%',
      description: 'Proportion visualization of parts to whole',
      definition: {
        type: 'flex',
        direction: 'column',
        gap: '16px',
        style: { padding: '20px', background: '#fff', borderRadius: '8px', border: '1px solid #e0e0e0' },
        children: [
          {
            type: 'flex',
            direction: 'row',
            justifyContent: 'space-between',
            style: { alignItems: 'center' },
            children: [
              { type: 'heading', content: 'Market Share', level: 3, style: { margin: 0 } },
              { type: 'paragraph', content: 'By platform', style: { margin: 0, fontSize: '12px', color: '#666' } }
            ]
          },
          {
            type: 'flex',
            direction: 'row',
            gap: '24px',
            style: { justifyContent: 'center', alignItems: 'center' },
            children: [
              {
                type: 'box',
                style: {
                  width: '180px',
                  height: '180px',
                  borderRadius: '50%',
                  background: 'conic-gradient(#0078d4 0deg 129.6deg, #107c10 129.6deg 223.2deg, #ffd700 223.2deg 298.8deg, #ff8c00 298.8deg 360deg)',
                  border: '3px solid white',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                }
              },
              {
                type: 'flex',
                direction: 'column',
                gap: '8px',
                children: [
                  {
                    type: 'flex',
                    direction: 'row',
                    gap: '8px',
                    style: { alignItems: 'center' },
                    children: [
                      { type: 'box', style: { width: '12px', height: '12px', background: '#0078d4', borderRadius: '2px' } },
                      { type: 'paragraph', content: 'Desktop 36%', style: { margin: 0, fontSize: '13px' } }
                    ]
                  },
                  {
                    type: 'flex',
                    direction: 'row',
                    gap: '8px',
                    style: { alignItems: 'center' },
                    children: [
                      { type: 'box', style: { width: '12px', height: '12px', background: '#107c10', borderRadius: '2px' } },
                      { type: 'paragraph', content: 'Mobile 26%', style: { margin: 0, fontSize: '13px' } }
                    ]
                  },
                  {
                    type: 'flex',
                    direction: 'row',
                    gap: '8px',
                    style: { alignItems: 'center' },
                    children: [
                      { type: 'box', style: { width: '12px', height: '12px', background: '#ffd700', borderRadius: '2px' } },
                      { type: 'paragraph', content: 'Tablet 21%', style: { margin: 0, fontSize: '13px' } }
                    ]
                  },
                  {
                    type: 'flex',
                    direction: 'row',
                    gap: '8px',
                    style: { alignItems: 'center' },
                    children: [
                      { type: 'box', style: { width: '12px', height: '12px', background: '#ff8c00', borderRadius: '2px' } },
                      { type: 'paragraph', content: 'Other 17%', style: { margin: 0, fontSize: '13px' } }
                    ]
                  }
                ]
              }
            ]
          }
        ]
      },
      tags: ['chart', 'proportion', 'percentage', 'distribution'],
      author: 'system'
    });
  }

  registerAreaChart() {
    this.patterns.set('area-chart', {
      id: 'area-chart',
      name: 'Area Chart',
      icon: '📉',
      category: 'charts',
      codeReduction: '85%',
      description: 'Stacked area visualization for cumulative trends',
      definition: {
        type: 'flex',
        direction: 'column',
        gap: '16px',
        style: { padding: '20px', background: '#fff', borderRadius: '8px', border: '1px solid #e0e0e0' },
        children: [
          {
            type: 'flex',
            direction: 'row',
            justifyContent: 'space-between',
            style: { alignItems: 'center' },
            children: [
              { type: 'heading', content: 'User Growth', level: 3, style: { margin: 0 } },
              { type: 'paragraph', content: 'Past 6 months', style: { margin: 0, fontSize: '12px', color: '#666' } }
            ]
          },
          {
            type: 'box',
            style: {
              width: '100%',
              height: '200px',
              background: 'linear-gradient(180deg, rgba(0,120,212,0.3) 0%, rgba(0,120,212,0) 100%)',
              borderRadius: '6px',
              padding: '20px',
              position: 'relative',
              border: '1px solid #e0e0e0'
            },
            children: [
              {
                type: 'flex',
                direction: 'row',
                justifyContent: 'space-around',
                style: { height: '100%', alignItems: 'flex-end', gap: '8px' },
                children: [
                  { type: 'box', style: { width: '8px', height: '35%', background: '#0078d4', borderRadius: '2px', opacity: '0.8' } },
                  { type: 'box', style: { width: '8px', height: '52%', background: '#0078d4', borderRadius: '2px', opacity: '0.8' } },
                  { type: 'box', style: { width: '8px', height: '68%', background: '#0078d4', borderRadius: '2px', opacity: '0.8' } },
                  { type: 'box', style: { width: '8px', height: '75%', background: '#0078d4', borderRadius: '2px', opacity: '0.8' } },
                  { type: 'box', style: { width: '8px', height: '88%', background: '#0078d4', borderRadius: '2px', opacity: '0.8' } },
                  { type: 'box', style: { width: '8px', height: '95%', background: '#0078d4', borderRadius: '2px', opacity: '0.8' } }
                ]
              }
            ]
          },
          {
            type: 'flex',
            direction: 'row',
            gap: '8px',
            style: { alignItems: 'center' },
            children: [
              { type: 'box', style: { width: '12px', height: '12px', background: '#0078d4', borderRadius: '2px' } },
              { type: 'paragraph', content: 'Total Users', style: { margin: 0, fontSize: '13px' } }
            ]
          }
        ]
      },
      tags: ['chart', 'area', 'stacked', 'trends'],
      author: 'system'
    });
  }

  registerSparklineChart() {
    this.patterns.set('sparkline-chart', {
      id: 'sparkline-chart',
      name: 'Sparkline Chart',
      icon: '✨',
      category: 'charts',
      codeReduction: '89%',
      description: 'Tiny inline chart for quick data overview',
      definition: {
        type: 'flex',
        direction: 'column',
        gap: '12px',
        style: { padding: '16px', background: '#fff', borderRadius: '6px', border: '1px solid #e0e0e0' },
        children: [
          {
            type: 'flex',
            direction: 'row',
            justifyContent: 'space-between',
            style: { alignItems: 'center', marginBottom: '8px' },
            children: [
              { type: 'paragraph', content: 'API Response Time', style: { margin: 0, fontSize: '13px', fontWeight: '600' } },
              {
                type: 'flex',
                direction: 'row',
                gap: '2px',
                style: { height: '24px', alignItems: 'flex-end' },
                children: [
                  { type: 'box', style: { width: '2px', height: '40%', background: '#0078d4' } },
                  { type: 'box', style: { width: '2px', height: '55%', background: '#0078d4' } },
                  { type: 'box', style: { width: '2px', height: '45%', background: '#0078d4' } },
                  { type: 'box', style: { width: '2px', height: '70%', background: '#0078d4' } },
                  { type: 'box', style: { width: '2px', height: '60%', background: '#0078d4' } },
                  { type: 'box', style: { width: '2px', height: '75%', background: '#0078d4' } },
                  { type: 'box', style: { width: '2px', height: '80%', background: '#0078d4' } }
                ]
              }
            ]
          },
          {
            type: 'flex',
            direction: 'row',
            justifyContent: 'space-between',
            style: { alignItems: 'center', marginBottom: '8px' },
            children: [
              { type: 'paragraph', content: 'Error Rate', style: { margin: 0, fontSize: '13px', fontWeight: '600' } },
              {
                type: 'flex',
                direction: 'row',
                gap: '2px',
                style: { height: '24px', alignItems: 'flex-end' },
                children: [
                  { type: 'box', style: { width: '2px', height: '8%', background: '#107c10' } },
                  { type: 'box', style: { width: '2px', height: '5%', background: '#107c10' } },
                  { type: 'box', style: { width: '2px', height: '12%', background: '#107c10' } },
                  { type: 'box', style: { width: '2px', height: '3%', background: '#107c10' } },
                  { type: 'box', style: { width: '2px', height: '6%', background: '#107c10' } },
                  { type: 'box', style: { width: '2px', height: '4%', background: '#107c10' } },
                  { type: 'box', style: { width: '2px', height: '7%', background: '#107c10' } }
                ]
              }
            ]
          },
          {
            type: 'flex',
            direction: 'row',
            justifyContent: 'space-between',
            style: { alignItems: 'center' },
            children: [
              { type: 'paragraph', content: 'Memory Usage', style: { margin: 0, fontSize: '13px', fontWeight: '600' } },
              {
                type: 'flex',
                direction: 'row',
                gap: '2px',
                style: { height: '24px', alignItems: 'flex-end' },
                children: [
                  { type: 'box', style: { width: '2px', height: '65%', background: '#ff8c00' } },
                  { type: 'box', style: { width: '2px', height: '72%', background: '#ff8c00' } },
                  { type: 'box', style: { width: '2px', height: '68%', background: '#ff8c00' } },
                  { type: 'box', style: { width: '2px', height: '80%', background: '#ff8c00' } },
                  { type: 'box', style: { width: '2px', height: '75%', background: '#ff8c00' } },
                  { type: 'box', style: { width: '2px', height: '85%', background: '#ff8c00' } },
                  { type: 'box', style: { width: '2px', height: '90%', background: '#ff8c00' } }
                ]
              }
            ]
          }
        ]
      },
      tags: ['chart', 'sparkline', 'inline', 'monitoring'],
      author: 'system'
    });
  }

  registerScatterChart() {
    this.patterns.set('scatter-chart', {
      id: 'scatter-chart',
      name: 'Scatter Chart',
      icon: '◦',
      category: 'charts',
      codeReduction: '81%',
      description: 'Correlation and distribution visualization',
      definition: {
        type: 'flex',
        direction: 'column',
        gap: '16px',
        style: { padding: '20px', background: '#fff', borderRadius: '8px', border: '1px solid #e0e0e0' },
        children: [
          {
            type: 'flex',
            direction: 'row',
            justifyContent: 'space-between',
            style: { alignItems: 'center' },
            children: [
              { type: 'heading', content: 'Price vs Performance', level: 3, style: { margin: 0 } },
              { type: 'paragraph', content: 'Product comparison', style: { margin: 0, fontSize: '12px', color: '#666' } }
            ]
          },
          {
            type: 'box',
            style: {
              width: '100%',
              height: '280px',
              background: '#f9f9f9',
              borderRadius: '6px',
              padding: '20px',
              position: 'relative',
              border: '1px solid #e0e0e0'
            },
            children: [
              {
                type: 'flex',
                direction: 'column',
                justifyContent: 'space-around',
                style: { height: '100%', position: 'relative' },
                children: [
                  {
                    type: 'flex',
                    direction: 'row',
                    justifyContent: 'space-around',
                    style: { height: '100%', alignItems: 'center' },
                    children: [
                      { type: 'box', style: { width: '12px', height: '12px', background: '#0078d4', borderRadius: '50%', cursor: 'pointer' } },
                      { type: 'box', style: { width: '12px', height: '12px', background: '#107c10', borderRadius: '50%', cursor: 'pointer', position: 'relative', top: '-20px' } },
                      { type: 'box', style: { width: '12px', height: '12px', background: '#ff8c00', borderRadius: '50%', cursor: 'pointer', position: 'relative', top: '30px' } },
                      { type: 'box', style: { width: '12px', height: '12px', background: '#d13438', borderRadius: '50%', cursor: 'pointer', position: 'relative', top: '-10px' } },
                      { type: 'box', style: { width: '12px', height: '12px', background: '#ffd700', borderRadius: '50%', cursor: 'pointer', position: 'relative', top: '40px' } },
                      { type: 'box', style: { width: '12px', height: '12px', background: '#00897b', borderRadius: '50%', cursor: 'pointer', position: 'relative', top: '20px' } }
                    ]
                  }
                ]
              }
            ]
          },
          {
            type: 'flex',
            direction: 'row',
            gap: '20px',
            style: { justifyContent: 'center', padding: '12px', background: '#f5f5f5', borderRadius: '6px' },
            children: [
              { type: 'paragraph', content: 'X: Price ($)', style: { margin: 0, fontSize: '12px' } },
              { type: 'paragraph', content: 'Y: Performance Score', style: { margin: 0, fontSize: '12px' } }
            ]
          }
        ]
      },
      tags: ['chart', 'scatter', 'correlation', 'distribution'],
      author: 'system'
    });
  }

  registerGaugeChart() {
    this.patterns.set('gauge-chart', {
      id: 'gauge-chart',
      name: 'Gauge Chart',
      icon: '🎚️',
      category: 'charts',
      codeReduction: '83%',
      description: 'Single metric progress and status visualization',
      definition: {
        type: 'flex',
        direction: 'column',
        gap: '16px',
        style: { padding: '20px', background: '#fff', borderRadius: '8px', border: '1px solid #e0e0e0' },
        children: [
          {
            type: 'flex',
            direction: 'row',
            justifyContent: 'space-between',
            style: { alignItems: 'center' },
            children: [
              { type: 'heading', content: 'System Health', level: 3, style: { margin: 0 } },
              { type: 'paragraph', content: 'Real-time', style: { margin: 0, fontSize: '12px', color: '#666' } }
            ]
          },
          {
            type: 'flex',
            direction: 'row',
            gap: '24px',
            style: { justifyContent: 'space-around', padding: '20px' },
            children: [
              {
                type: 'flex',
                direction: 'column',
                gap: '8px',
                style: { alignItems: 'center' },
                children: [
                  {
                    type: 'box',
                    style: {
                      width: '120px',
                      height: '120px',
                      borderRadius: '50%',
                      background: 'conic-gradient(#107c10 0deg 252deg, #e0e0e0 252deg 360deg)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      position: 'relative'
                    },
                    children: [
                      {
                        type: 'box',
                        style: { width: '100px', height: '100px', borderRadius: '50%', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' },
                        children: [
                          { type: 'paragraph', content: '84%', style: { margin: 0, fontSize: '20px', fontWeight: '700' } },
                          { type: 'paragraph', content: 'Good', style: { margin: '4px 0 0 0', fontSize: '11px', color: '#107c10' } }
                        ]
                      }
                    ]
                  },
                  { type: 'paragraph', content: 'CPU Usage', style: { margin: 0, fontSize: '13px', fontWeight: '600' } }
                ]
              },
              {
                type: 'flex',
                direction: 'column',
                gap: '8px',
                style: { alignItems: 'center' },
                children: [
                  {
                    type: 'box',
                    style: {
                      width: '120px',
                      height: '120px',
                      borderRadius: '50%',
                      background: 'conic-gradient(#ffd700 0deg 189deg, #e0e0e0 189deg 360deg)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      position: 'relative'
                    },
                    children: [
                      {
                        type: 'box',
                        style: { width: '100px', height: '100px', borderRadius: '50%', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' },
                        children: [
                          { type: 'paragraph', content: '63%', style: { margin: 0, fontSize: '20px', fontWeight: '700' } },
                          { type: 'paragraph', content: 'Fair', style: { margin: '4px 0 0 0', fontSize: '11px', color: '#ffd700' } }
                        ]
                      }
                    ]
                  },
                  { type: 'paragraph', content: 'Memory Usage', style: { margin: 0, fontSize: '13px', fontWeight: '600' } }
                ]
              }
            ]
          }
        ]
      },
      tags: ['chart', 'gauge', 'status', 'metrics'],
      author: 'system'
    });
  }

  registerHeatmapChart() {
    this.patterns.set('heatmap-chart', {
      id: 'heatmap-chart',
      name: 'Heatmap Chart',
      icon: '🔥',
      category: 'charts',
      codeReduction: '80%',
      description: 'Matrix visualization with color-coded intensity',
      definition: {
        type: 'flex',
        direction: 'column',
        gap: '16px',
        style: { padding: '20px', background: '#fff', borderRadius: '8px', border: '1px solid #e0e0e0' },
        children: [
          {
            type: 'flex',
            direction: 'row',
            justifyContent: 'space-between',
            style: { alignItems: 'center' },
            children: [
              { type: 'heading', content: 'Page Views by Hour', level: 3, style: { margin: 0 } },
              { type: 'paragraph', content: 'Weekly data', style: { margin: 0, fontSize: '12px', color: '#666' } }
            ]
          },
          {
            type: 'flex',
            direction: 'column',
            gap: '8px',
            style: { padding: '12px' },
            children: [
              {
                type: 'flex',
                direction: 'row',
                gap: '4px',
                children: [
                  { type: 'box', style: { width: '30px', height: '30px', background: '#e0e0e0', borderRadius: '4px' } },
                  { type: 'box', style: { width: '30px', height: '30px', background: '#d0d0d0', borderRadius: '4px' } },
                  { type: 'box', style: { width: '30px', height: '30px', background: '#90caf9', borderRadius: '4px' } },
                  { type: 'box', style: { width: '30px', height: '30px', background: '#42a5f5', borderRadius: '4px' } },
                  { type: 'box', style: { width: '30px', height: '30px', background: '#1e88e5', borderRadius: '4px' } },
                  { type: 'box', style: { width: '30px', height: '30px', background: '#0d47a1', borderRadius: '4px' } },
                  { type: 'box', style: { width: '30px', height: '30px', background: '#e0e0e0', borderRadius: '4px' } }
                ]
              },
              {
                type: 'flex',
                direction: 'row',
                gap: '4px',
                children: [
                  { type: 'box', style: { width: '30px', height: '30px', background: '#f0f0f0', borderRadius: '4px' } },
                  { type: 'box', style: { width: '30px', height: '30px', background: '#87ceeb', borderRadius: '4px' } },
                  { type: 'box', style: { width: '30px', height: '30px', background: '#42a5f5', borderRadius: '4px' } },
                  { type: 'box', style: { width: '30px', height: '30px', background: '#0d47a1', borderRadius: '4px' } },
                  { type: 'box', style: { width: '30px', height: '30px', background: '#0d47a1', borderRadius: '4px' } },
                  { type: 'box', style: { width: '30px', height: '30px', background: '#1565c0', borderRadius: '4px' } },
                  { type: 'box', style: { width: '30px', height: '30px', background: '#90caf9', borderRadius: '4px' } }
                ]
              },
              {
                type: 'flex',
                direction: 'row',
                gap: '4px',
                children: [
                  { type: 'box', style: { width: '30px', height: '30px', background: '#e0e0e0', borderRadius: '4px' } },
                  { type: 'box', style: { width: '30px', height: '30px', background: '#90caf9', borderRadius: '4px' } },
                  { type: 'box', style: { width: '30px', height: '30px', background: '#1e88e5', borderRadius: '4px' } },
                  { type: 'box', style: { width: '30px', height: '30px', background: '#0d47a1', borderRadius: '4px' } },
                  { type: 'box', style: { width: '30px', height: '30px', background: '#0d47a1', borderRadius: '4px' } },
                  { type: 'box', style: { width: '30px', height: '30px', background: '#1565c0', borderRadius: '4px' } },
                  { type: 'box', style: { width: '30px', height: '30px', background: '#42a5f5', borderRadius: '4px' } }
                ]
              }
            ]
          },
          {
            type: 'flex',
            direction: 'row',
            gap: '16px',
            style: { padding: '12px', background: '#f5f5f5', borderRadius: '6px', justifyContent: 'center' },
            children: [
              { type: 'paragraph', content: 'Low', style: { margin: 0, fontSize: '12px' } },
              { type: 'flex', direction: 'row', gap: '4px', children: [{ type: 'box', style: { width: '12px', height: '12px', background: '#90caf9', borderRadius: '2px' } }, { type: 'box', style: { width: '12px', height: '12px', background: '#42a5f5', borderRadius: '2px' } }, { type: 'box', style: { width: '12px', height: '12px', background: '#1e88e5', borderRadius: '2px' } }, { type: 'box', style: { width: '12px', height: '12px', background: '#0d47a1', borderRadius: '2px' } }] },
              { type: 'paragraph', content: 'High', style: { margin: 0, fontSize: '12px' } }
            ]
          }
        ]
      },
      tags: ['chart', 'heatmap', 'matrix', 'intensity'],
      author: 'system'
    });
  }

  getAllPatterns() {
    return Array.from(this.patterns.values());
  }

  getPattern(id) {
    return this.patterns.get(id);
  }

  getPatternsByCategory(category) {
    return this.getAllPatterns().filter(p => p.category === category);
  }

  searchPatterns(query) {
    const q = query.toLowerCase();
    return this.getAllPatterns().filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      p.tags.some(t => t.toLowerCase().includes(q))
    );
  }
}

function createChartPatternLibrary() {
  return new ChartPatternLibrary();
}

export { ChartPatternLibrary, createChartPatternLibrary };
