export const areaChart = {
  id: 'area-chart',
  name: 'Area Chart',
  icon: '📉',
  category: 'charts',
  codeReduction: '82%',
  description: 'Cumulative data visualization with filled areas',
  tags: ['analytics', 'visualization', 'cumulative'],
  author: 'system'
};

export const scatterChart = {
  id: 'scatter-chart',
  name: 'Scatter Chart',
  icon: '💫',
  category: 'charts',
  codeReduction: '81%',
  description: 'Correlation visualization between two variables',
  tags: ['analytics', 'visualization', 'correlation'],
  author: 'system'
};

export const gaugeChart = {
  id: 'gauge-chart',
  name: 'Gauge Chart',
  icon: '🎯',
  category: 'charts',
  codeReduction: '79%',
  description: 'Single metric indicator with threshold markers',
  tags: ['analytics', 'visualization', 'progress'],
  author: 'system'
};

export const statisticalCharts = [areaChart, scatterChart, gaugeChart];
