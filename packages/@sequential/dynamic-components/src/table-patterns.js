class TablePatternLibrary {
  constructor() {
    this.patterns = new Map();
    this.registerAllPatterns();
  }

  registerAllPatterns() {
    this.registerBasicTable();
    this.registerSortableTable();
    this.registerFilterableTable();
    this.registerSelectableTable();
    this.registerExpandableTable();
    this.registerPaginatedTable();
    this.registerEditableTable();
    this.registerResponsiveTable();
  }

  registerBasicTable() {
    this.patterns.set('basic-table', {
      id: 'basic-table',
      name: 'Basic Table',
      icon: '📋',
      category: 'tables',
      codeReduction: '77%',
      description: 'Simple structured data display with rows and columns',
      definition: {
        type: 'flex',
        direction: 'column',
        gap: '0',
        style: { padding: '0', background: '#fff', borderRadius: '8px', border: '1px solid #e0e0e0', overflow: 'hidden' },
        children: [
          {
            type: 'flex',
            direction: 'row',
            gap: '0',
            style: { background: '#f5f5f5', borderBottom: '2px solid #0078d4', padding: '0' },
            children: [
              { type: 'paragraph', content: 'Product', style: { flex: 1, padding: '12px 16px', margin: 0, fontWeight: '600', fontSize: '14px' } },
              { type: 'paragraph', content: 'Category', style: { flex: 0.8, padding: '12px 16px', margin: 0, fontWeight: '600', fontSize: '14px' } },
              { type: 'paragraph', content: 'Price', style: { flex: 0.6, padding: '12px 16px', margin: 0, fontWeight: '600', fontSize: '14px', textAlign: 'right' } },
              { type: 'paragraph', content: 'Stock', style: { flex: 0.6, padding: '12px 16px', margin: 0, fontWeight: '600', fontSize: '14px', textAlign: 'center' } }
            ]
          },
          {
            type: 'flex',
            direction: 'row',
            gap: '0',
            style: { borderBottom: '1px solid #e0e0e0', padding: '0' },
            children: [
              { type: 'paragraph', content: 'Laptop Pro 15', style: { flex: 1, padding: '12px 16px', margin: 0, fontSize: '14px' } },
              { type: 'paragraph', content: 'Electronics', style: { flex: 0.8, padding: '12px 16px', margin: 0, fontSize: '14px', color: '#666' } },
              { type: 'paragraph', content: '$1,299', style: { flex: 0.6, padding: '12px 16px', margin: 0, fontSize: '14px', textAlign: 'right', fontWeight: '600' } },
              { type: 'box', style: { flex: 0.6, padding: '12px 16px', textAlign: 'center' }, children: [{ type: 'box', style: { display: 'inline-block', padding: '4px 8px', background: '#e8f5e9', color: '#2e7d32', borderRadius: '4px', fontSize: '12px' }, children: [{ type: 'paragraph', content: '45', style: { margin: 0 } }] }] }
            ]
          },
          {
            type: 'flex',
            direction: 'row',
            gap: '0',
            style: { borderBottom: '1px solid #e0e0e0', padding: '0' },
            children: [
              { type: 'paragraph', content: 'Wireless Mouse', style: { flex: 1, padding: '12px 16px', margin: 0, fontSize: '14px' } },
              { type: 'paragraph', content: 'Accessories', style: { flex: 0.8, padding: '12px 16px', margin: 0, fontSize: '14px', color: '#666' } },
              { type: 'paragraph', content: '$29.99', style: { flex: 0.6, padding: '12px 16px', margin: 0, fontSize: '14px', textAlign: 'right', fontWeight: '600' } },
              { type: 'box', style: { flex: 0.6, padding: '12px 16px', textAlign: 'center' }, children: [{ type: 'box', style: { display: 'inline-block', padding: '4px 8px', background: '#fff3e0', color: '#e65100', borderRadius: '4px', fontSize: '12px' }, children: [{ type: 'paragraph', content: '12', style: { margin: 0 } }] }] }
            ]
          },
          {
            type: 'flex',
            direction: 'row',
            gap: '0',
            style: { padding: '0' },
            children: [
              { type: 'paragraph', content: 'USB-C Cable', style: { flex: 1, padding: '12px 16px', margin: 0, fontSize: '14px' } },
              { type: 'paragraph', content: 'Cables', style: { flex: 0.8, padding: '12px 16px', margin: 0, fontSize: '14px', color: '#666' } },
              { type: 'paragraph', content: '$12.99', style: { flex: 0.6, padding: '12px 16px', margin: 0, fontSize: '14px', textAlign: 'right', fontWeight: '600' } },
              { type: 'box', style: { flex: 0.6, padding: '12px 16px', textAlign: 'center' }, children: [{ type: 'box', style: { display: 'inline-block', padding: '4px 8px', background: '#fce4ec', color: '#c2185b', borderRadius: '4px', fontSize: '12px' }, children: [{ type: 'paragraph', content: '2', style: { margin: 0 } }] }] }
            ]
          }
        ]
      },
      tags: ['table', 'basic', 'data-display', 'structured'],
      author: 'system'
    });
  }

  registerSortableTable() {
    this.patterns.set('sortable-table', {
      id: 'sortable-table',
      name: 'Sortable Table',
      icon: '↕️',
      category: 'tables',
      codeReduction: '80%',
      description: 'Clickable column headers to sort data ascending/descending',
      definition: {
        type: 'flex',
        direction: 'column',
        gap: '0',
        style: { padding: '0', background: '#fff', borderRadius: '8px', border: '1px solid #e0e0e0', overflow: 'hidden' },
        children: [
          {
            type: 'flex',
            direction: 'row',
            gap: '0',
            style: { background: '#f5f5f5', borderBottom: '2px solid #0078d4', padding: '0' },
            children: [
              { type: 'button', label: 'Name ↑', variant: 'secondary', style: { flex: 1, padding: '12px 16px', margin: 0, fontWeight: '600', fontSize: '14px', border: 'none', background: 'transparent', textAlign: 'left', cursor: 'pointer', borderRadius: '0' } },
              { type: 'button', label: 'Dept ↓', variant: 'secondary', style: { flex: 0.8, padding: '12px 16px', margin: 0, fontWeight: '600', fontSize: '14px', border: 'none', background: 'transparent', textAlign: 'left', cursor: 'pointer', borderRadius: '0' } },
              { type: 'button', label: 'Salary', variant: 'secondary', style: { flex: 0.6, padding: '12px 16px', margin: 0, fontWeight: '600', fontSize: '14px', border: 'none', background: 'transparent', textAlign: 'right', cursor: 'pointer', borderRadius: '0' } },
              { type: 'button', label: 'Start Date', variant: 'secondary', style: { flex: 0.7, padding: '12px 16px', margin: 0, fontWeight: '600', fontSize: '14px', border: 'none', background: 'transparent', textAlign: 'right', cursor: 'pointer', borderRadius: '0' } }
            ]
          },
          {
            type: 'flex',
            direction: 'row',
            gap: '0',
            style: { borderBottom: '1px solid #e0e0e0', padding: '0' },
            children: [
              { type: 'paragraph', content: 'Alice Johnson', style: { flex: 1, padding: '12px 16px', margin: 0, fontSize: '14px' } },
              { type: 'paragraph', content: 'Engineering', style: { flex: 0.8, padding: '12px 16px', margin: 0, fontSize: '14px', color: '#666' } },
              { type: 'paragraph', content: '$95,000', style: { flex: 0.6, padding: '12px 16px', margin: 0, fontSize: '14px', textAlign: 'right', fontWeight: '600' } },
              { type: 'paragraph', content: '2023-01-15', style: { flex: 0.7, padding: '12px 16px', margin: 0, fontSize: '14px', textAlign: 'right', color: '#666' } }
            ]
          },
          {
            type: 'flex',
            direction: 'row',
            gap: '0',
            style: { borderBottom: '1px solid #e0e0e0', padding: '0' },
            children: [
              { type: 'paragraph', content: 'Bob Smith', style: { flex: 1, padding: '12px 16px', margin: 0, fontSize: '14px' } },
              { type: 'paragraph', content: 'Marketing', style: { flex: 0.8, padding: '12px 16px', margin: 0, fontSize: '14px', color: '#666' } },
              { type: 'paragraph', content: '$75,000', style: { flex: 0.6, padding: '12px 16px', margin: 0, fontSize: '14px', textAlign: 'right', fontWeight: '600' } },
              { type: 'paragraph', content: '2023-06-20', style: { flex: 0.7, padding: '12px 16px', margin: 0, fontSize: '14px', textAlign: 'right', color: '#666' } }
            ]
          },
          {
            type: 'flex',
            direction: 'row',
            gap: '0',
            style: { padding: '0' },
            children: [
              { type: 'paragraph', content: 'Carol Davis', style: { flex: 1, padding: '12px 16px', margin: 0, fontSize: '14px' } },
              { type: 'paragraph', content: 'Finance', style: { flex: 0.8, padding: '12px 16px', margin: 0, fontSize: '14px', color: '#666' } },
              { type: 'paragraph', content: '$85,500', style: { flex: 0.6, padding: '12px 16px', margin: 0, fontSize: '14px', textAlign: 'right', fontWeight: '600' } },
              { type: 'paragraph', content: '2022-11-10', style: { flex: 0.7, padding: '12px 16px', margin: 0, fontSize: '14px', textAlign: 'right', color: '#666' } }
            ]
          }
        ]
      },
      tags: ['table', 'sortable', 'interactive', 'data-organization'],
      author: 'system'
    });
  }

  registerFilterableTable() {
    this.patterns.set('filterable-table', {
      id: 'filterable-table',
      name: 'Filterable Table',
      icon: '🔍',
      category: 'tables',
      codeReduction: '79%',
      description: 'Table with column filtering and search capabilities',
      definition: {
        type: 'flex',
        direction: 'column',
        gap: '12px',
        style: { padding: '16px', background: '#fff', borderRadius: '8px', border: '1px solid #e0e0e0' },
        children: [
          {
            type: 'flex',
            direction: 'row',
            gap: '12px',
            style: { marginBottom: '12px' },
            children: [
              { type: 'input', placeholder: 'Search...', style: { flex: 1, padding: '8px 12px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '13px' } },
              { type: 'select', style: { padding: '8px 12px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '13px' }, children: [{ type: 'paragraph', content: 'All Status', style: { margin: 0 } }] }
            ]
          },
          {
            type: 'flex',
            direction: 'row',
            gap: '0',
            style: { background: '#f5f5f5', borderBottom: '2px solid #0078d4', padding: '0' },
            children: [
              { type: 'paragraph', content: 'Issue', style: { flex: 1.2, padding: '12px 16px', margin: 0, fontWeight: '600', fontSize: '14px' } },
              { type: 'paragraph', content: 'Type', style: { flex: 0.6, padding: '12px 16px', margin: 0, fontWeight: '600', fontSize: '14px' } },
              { type: 'paragraph', content: 'Priority', style: { flex: 0.6, padding: '12px 16px', margin: 0, fontWeight: '600', fontSize: '14px' } },
              { type: 'paragraph', content: 'Status', style: { flex: 0.6, padding: '12px 16px', margin: 0, fontWeight: '600', fontSize: '14px' } }
            ]
          },
          {
            type: 'flex',
            direction: 'row',
            gap: '0',
            style: { borderBottom: '1px solid #e0e0e0', padding: '0' },
            children: [
              { type: 'paragraph', content: 'Login page not loading', style: { flex: 1.2, padding: '12px 16px', margin: 0, fontSize: '14px' } },
              { type: 'box', style: { flex: 0.6, padding: '12px 16px' }, children: [{ type: 'box', style: { display: 'inline-block', padding: '4px 8px', background: '#f3e5f5', color: '#6a1b9a', borderRadius: '4px', fontSize: '12px' }, children: [{ type: 'paragraph', content: 'Bug', style: { margin: 0 } }] }] },
              { type: 'box', style: { flex: 0.6, padding: '12px 16px' }, children: [{ type: 'box', style: { display: 'inline-block', padding: '4px 8px', background: '#ffebee', color: '#c62828', borderRadius: '4px', fontSize: '12px' }, children: [{ type: 'paragraph', content: 'High', style: { margin: 0 } }] }] },
              { type: 'box', style: { flex: 0.6, padding: '12px 16px' }, children: [{ type: 'box', style: { display: 'inline-block', padding: '4px 8px', background: '#fff3e0', color: '#e65100', borderRadius: '4px', fontSize: '12px' }, children: [{ type: 'paragraph', content: 'Open', style: { margin: 0 } }] }] }
            ]
          },
          {
            type: 'flex',
            direction: 'row',
            gap: '0',
            style: { borderBottom: '1px solid #e0e0e0', padding: '0' },
            children: [
              { type: 'paragraph', content: 'Add dark mode toggle', style: { flex: 1.2, padding: '12px 16px', margin: 0, fontSize: '14px' } },
              { type: 'box', style: { flex: 0.6, padding: '12px 16px' }, children: [{ type: 'box', style: { display: 'inline-block', padding: '4px 8px', background: '#e8f5e9', color: '#2e7d32', borderRadius: '4px', fontSize: '12px' }, children: [{ type: 'paragraph', content: 'Feature', style: { margin: 0 } }] }] },
              { type: 'box', style: { flex: 0.6, padding: '12px 16px' }, children: [{ type: 'box', style: { display: 'inline-block', padding: '4px 8px', background: '#e0f2f1', color: '#00695c', borderRadius: '4px', fontSize: '12px' }, children: [{ type: 'paragraph', content: 'Low', style: { margin: 0 } }] }] },
              { type: 'box', style: { flex: 0.6, padding: '12px 16px' }, children: [{ type: 'box', style: { display: 'inline-block', padding: '4px 8px', background: '#f3e5f5', color: '#6a1b9a', borderRadius: '4px', fontSize: '12px' }, children: [{ type: 'paragraph', content: 'In Review', style: { margin: 0 } }] }] }
            ]
          },
          {
            type: 'flex',
            direction: 'row',
            gap: '0',
            style: { padding: '0' },
            children: [
              { type: 'paragraph', content: 'Fix spelling errors', style: { flex: 1.2, padding: '12px 16px', margin: 0, fontSize: '14px' } },
              { type: 'box', style: { flex: 0.6, padding: '12px 16px' }, children: [{ type: 'box', style: { display: 'inline-block', padding: '4px 8px', background: '#f3e5f5', color: '#6a1b9a', borderRadius: '4px', fontSize: '12px' }, children: [{ type: 'paragraph', content: 'Bug', style: { margin: 0 } }] }] },
              { type: 'box', style: { flex: 0.6, padding: '12px 16px' }, children: [{ type: 'box', style: { display: 'inline-block', padding: '4px 8px', background: '#e0f2f1', color: '#00695c', borderRadius: '4px', fontSize: '12px' }, children: [{ type: 'paragraph', content: 'Low', style: { margin: 0 } }] }] },
              { type: 'box', style: { flex: 0.6, padding: '12px 16px' }, children: [{ type: 'box', style: { display: 'inline-block', padding: '4px 8px', background: '#e8f5e9', color: '#2e7d32', borderRadius: '4px', fontSize: '12px' }, children: [{ type: 'paragraph', content: 'Done', style: { margin: 0 } }] }] }
            ]
          }
        ]
      },
      tags: ['table', 'filterable', 'searchable', 'dynamic'],
      author: 'system'
    });
  }

  registerSelectableTable() {
    this.patterns.set('selectable-table', {
      id: 'selectable-table',
      name: 'Selectable Table',
      icon: '☑️',
      category: 'tables',
      codeReduction: '78%',
      description: 'Table with checkboxes for row selection and bulk actions',
      definition: {
        type: 'flex',
        direction: 'column',
        gap: '12px',
        style: { padding: '16px', background: '#fff', borderRadius: '8px', border: '1px solid #e0e0e0' },
        children: [
          {
            type: 'flex',
            direction: 'row',
            gap: '12px',
            style: { marginBottom: '12px', padding: '12px', background: '#f0f7ff', borderRadius: '6px', border: '1px solid #b3d9ff' },
            children: [
              { type: 'paragraph', content: '✓ 2 selected', style: { margin: 0, flex: 1, fontSize: '13px', fontWeight: '600', color: '#0078d4' } },
              { type: 'button', label: 'Delete', variant: 'secondary', style: { padding: '6px 12px', border: '1px solid #ddd', borderRadius: '4px', background: '#fff', cursor: 'pointer', fontSize: '12px' } },
              { type: 'button', label: 'Archive', variant: 'secondary', style: { padding: '6px 12px', border: '1px solid #ddd', borderRadius: '4px', background: '#fff', cursor: 'pointer', fontSize: '12px' } }
            ]
          },
          {
            type: 'flex',
            direction: 'row',
            gap: '0',
            style: { background: '#f5f5f5', borderBottom: '2px solid #0078d4', padding: '0' },
            children: [
              { type: 'box', style: { width: '40px', padding: '12px 16px', textAlign: 'center' }, children: [{ type: 'input', style: { cursor: 'pointer' } }] },
              { type: 'paragraph', content: 'File', style: { flex: 1, padding: '12px 16px', margin: 0, fontWeight: '600', fontSize: '14px' } },
              { type: 'paragraph', content: 'Size', style: { flex: 0.5, padding: '12px 16px', margin: 0, fontWeight: '600', fontSize: '14px', textAlign: 'right' } },
              { type: 'paragraph', content: 'Modified', style: { flex: 0.6, padding: '12px 16px', margin: 0, fontWeight: '600', fontSize: '14px', textAlign: 'right' } }
            ]
          },
          {
            type: 'flex',
            direction: 'row',
            gap: '0',
            style: { borderBottom: '1px solid #e0e0e0', padding: '0', background: '#f9f9f9' },
            children: [
              { type: 'box', style: { width: '40px', padding: '12px 16px', textAlign: 'center' }, children: [{ type: 'input', style: { cursor: 'pointer', accentColor: '#0078d4' } }] },
              { type: 'paragraph', content: 'document.pdf', style: { flex: 1, padding: '12px 16px', margin: 0, fontSize: '14px', fontWeight: '500' } },
              { type: 'paragraph', content: '2.4 MB', style: { flex: 0.5, padding: '12px 16px', margin: 0, fontSize: '14px', textAlign: 'right' } },
              { type: 'paragraph', content: '12/01/25', style: { flex: 0.6, padding: '12px 16px', margin: 0, fontSize: '14px', textAlign: 'right', color: '#666' } }
            ]
          },
          {
            type: 'flex',
            direction: 'row',
            gap: '0',
            style: { borderBottom: '1px solid #e0e0e0', padding: '0', background: '#f9f9f9' },
            children: [
              { type: 'box', style: { width: '40px', padding: '12px 16px', textAlign: 'center' }, children: [{ type: 'input', style: { cursor: 'pointer', accentColor: '#0078d4' } }] },
              { type: 'paragraph', content: 'presentation.pptx', style: { flex: 1, padding: '12px 16px', margin: 0, fontSize: '14px', fontWeight: '500' } },
              { type: 'paragraph', content: '5.1 MB', style: { flex: 0.5, padding: '12px 16px', margin: 0, fontSize: '14px', textAlign: 'right' } },
              { type: 'paragraph', content: '11/28/25', style: { flex: 0.6, padding: '12px 16px', margin: 0, fontSize: '14px', textAlign: 'right', color: '#666' } }
            ]
          },
          {
            type: 'flex',
            direction: 'row',
            gap: '0',
            style: { padding: '0' },
            children: [
              { type: 'box', style: { width: '40px', padding: '12px 16px', textAlign: 'center' }, children: [{ type: 'input', style: { cursor: 'pointer' } }] },
              { type: 'paragraph', content: 'archive.zip', style: { flex: 1, padding: '12px 16px', margin: 0, fontSize: '14px', fontWeight: '500' } },
              { type: 'paragraph', content: '12.7 MB', style: { flex: 0.5, padding: '12px 16px', margin: 0, fontSize: '14px', textAlign: 'right' } },
              { type: 'paragraph', content: '11/15/25', style: { flex: 0.6, padding: '12px 16px', margin: 0, fontSize: '14px', textAlign: 'right', color: '#666' } }
            ]
          }
        ]
      },
      tags: ['table', 'selectable', 'bulk-actions', 'checkboxes'],
      author: 'system'
    });
  }

  registerExpandableTable() {
    this.patterns.set('expandable-table', {
      id: 'expandable-table',
      name: 'Expandable Table',
      icon: '⏱️',
      category: 'tables',
      codeReduction: '82%',
      description: 'Table rows that expand to show additional details',
      definition: {
        type: 'flex',
        direction: 'column',
        gap: '8px',
        style: { padding: '16px', background: '#fff', borderRadius: '8px', border: '1px solid #e0e0e0' },
        children: [
          {
            type: 'flex',
            direction: 'column',
            gap: '0',
            style: { borderRadius: '6px', border: '1px solid #e0e0e0', overflow: 'hidden' },
            children: [
              {
                type: 'flex',
                direction: 'row',
                gap: '0',
                style: { background: '#f5f5f5', borderBottom: '1px solid #e0e0e0', padding: '0', cursor: 'pointer' },
                children: [
                  { type: 'box', style: { width: '40px', padding: '12px 16px', textAlign: 'center', fontSize: '14px' }, children: [{ type: 'paragraph', content: '▶', style: { margin: 0 } }] },
                  { type: 'paragraph', content: 'Order #12345', style: { flex: 1, padding: '12px 0', margin: 0, fontWeight: '600', fontSize: '14px' } },
                  { type: 'paragraph', content: '$156.50', style: { padding: '12px 16px', margin: 0, fontWeight: '600', fontSize: '14px' } },
                  { type: 'paragraph', content: 'Processing', style: { padding: '12px 16px', margin: 0, fontSize: '13px' } }
                ]
              },
              {
                type: 'flex',
                direction: 'column',
                gap: '8px',
                style: { padding: '16px', background: '#f9f9f9', borderTop: '1px solid #e0e0e0' },
                children: [
                  { type: 'paragraph', content: 'Items:', style: { margin: '0 0 8px 0', fontWeight: '600', fontSize: '13px' } },
                  { type: 'paragraph', content: '• Laptop Stand (qty: 1) - $45.00', style: { margin: '4px 0', fontSize: '13px', paddingLeft: '16px' } },
                  { type: 'paragraph', content: '• USB Hub (qty: 2) - $55.00', style: { margin: '4px 0', fontSize: '13px', paddingLeft: '16px' } },
                  { type: 'paragraph', content: '• Monitor (qty: 1) - $56.50', style: { margin: '4px 0', fontSize: '13px', paddingLeft: '16px' } }
                ]
              }
            ]
          },
          {
            type: 'flex',
            direction: 'column',
            gap: '0',
            style: { borderRadius: '6px', border: '1px solid #e0e0e0', overflow: 'hidden' },
            children: [
              {
                type: 'flex',
                direction: 'row',
                gap: '0',
                style: { background: '#f5f5f5', borderBottom: '1px solid #e0e0e0', padding: '0', cursor: 'pointer' },
                children: [
                  { type: 'box', style: { width: '40px', padding: '12px 16px', textAlign: 'center', fontSize: '14px' }, children: [{ type: 'paragraph', content: '▼', style: { margin: 0 } }] },
                  { type: 'paragraph', content: 'Order #12346', style: { flex: 1, padding: '12px 0', margin: 0, fontWeight: '600', fontSize: '14px' } },
                  { type: 'paragraph', content: '$89.99', style: { padding: '12px 16px', margin: 0, fontWeight: '600', fontSize: '14px' } },
                  { type: 'paragraph', content: 'Shipped', style: { padding: '12px 16px', margin: 0, fontSize: '13px' } }
                ]
              },
              {
                type: 'flex',
                direction: 'column',
                gap: '8px',
                style: { padding: '16px', background: '#f9f9f9', borderTop: '1px solid #e0e0e0' },
                children: [
                  { type: 'paragraph', content: 'Tracking: FDX123456789', style: { margin: 0, fontSize: '13px' } },
                  { type: 'paragraph', content: 'Est. Delivery: 12/12/25', style: { margin: '4px 0 0 0', fontSize: '13px' } }
                ]
              }
            ]
          }
        ]
      },
      tags: ['table', 'expandable', 'details', 'hierarchy'],
      author: 'system'
    });
  }

  registerPaginatedTable() {
    this.patterns.set('paginated-table', {
      id: 'paginated-table',
      name: 'Paginated Table',
      icon: '📖',
      category: 'tables',
      codeReduction: '81%',
      description: 'Table with built-in pagination controls for large datasets',
      definition: {
        type: 'flex',
        direction: 'column',
        gap: '12px',
        style: { padding: '16px', background: '#fff', borderRadius: '8px', border: '1px solid #e0e0e0' },
        children: [
          {
            type: 'flex',
            direction: 'row',
            gap: '0',
            style: { background: '#f5f5f5', borderBottom: '2px solid #0078d4', padding: '0' },
            children: [
              { type: 'paragraph', content: 'User', style: { flex: 1, padding: '12px 16px', margin: 0, fontWeight: '600', fontSize: '14px' } },
              { type: 'paragraph', content: 'Email', style: { flex: 1.2, padding: '12px 16px', margin: 0, fontWeight: '600', fontSize: '14px' } },
              { type: 'paragraph', content: 'Role', style: { flex: 0.6, padding: '12px 16px', margin: 0, fontWeight: '600', fontSize: '14px' } },
              { type: 'paragraph', content: 'Status', style: { flex: 0.6, padding: '12px 16px', margin: 0, fontWeight: '600', fontSize: '14px' } }
            ]
          },
          {
            type: 'flex',
            direction: 'row',
            gap: '0',
            style: { borderBottom: '1px solid #e0e0e0', padding: '0' },
            children: [
              { type: 'paragraph', content: 'Sarah Jones', style: { flex: 1, padding: '12px 16px', margin: 0, fontSize: '14px' } },
              { type: 'paragraph', content: 'sarah@example.com', style: { flex: 1.2, padding: '12px 16px', margin: 0, fontSize: '14px', color: '#666' } },
              { type: 'box', style: { flex: 0.6, padding: '12px 16px' }, children: [{ type: 'box', style: { display: 'inline-block', padding: '4px 8px', background: '#f3e5f5', color: '#6a1b9a', borderRadius: '4px', fontSize: '12px' }, children: [{ type: 'paragraph', content: 'Admin', style: { margin: 0 } }] }] },
              { type: 'box', style: { flex: 0.6, padding: '12px 16px' }, children: [{ type: 'box', style: { display: 'inline-block', padding: '4px 8px', background: '#e8f5e9', color: '#2e7d32', borderRadius: '4px', fontSize: '12px' }, children: [{ type: 'paragraph', content: 'Active', style: { margin: 0 } }] }] }
            ]
          },
          {
            type: 'flex',
            direction: 'row',
            gap: '0',
            style: { borderBottom: '1px solid #e0e0e0', padding: '0' },
            children: [
              { type: 'paragraph', content: 'Mike Brown', style: { flex: 1, padding: '12px 16px', margin: 0, fontSize: '14px' } },
              { type: 'paragraph', content: 'mike@example.com', style: { flex: 1.2, padding: '12px 16px', margin: 0, fontSize: '14px', color: '#666' } },
              { type: 'box', style: { flex: 0.6, padding: '12px 16px' }, children: [{ type: 'box', style: { display: 'inline-block', padding: '4px 8px', background: '#e0f2f1', color: '#00695c', borderRadius: '4px', fontSize: '12px' }, children: [{ type: 'paragraph', content: 'User', style: { margin: 0 } }] }] },
              { type: 'box', style: { flex: 0.6, padding: '12px 16px' }, children: [{ type: 'box', style: { display: 'inline-block', padding: '4px 8px', background: '#e8f5e9', color: '#2e7d32', borderRadius: '4px', fontSize: '12px' }, children: [{ type: 'paragraph', content: 'Active', style: { margin: 0 } }] }] }
            ]
          },
          {
            type: 'flex',
            direction: 'row',
            gap: '0',
            style: { padding: '0' },
            children: [
              { type: 'paragraph', content: 'Lisa White', style: { flex: 1, padding: '12px 16px', margin: 0, fontSize: '14px' } },
              { type: 'paragraph', content: 'lisa@example.com', style: { flex: 1.2, padding: '12px 16px', margin: 0, fontSize: '14px', color: '#666' } },
              { type: 'box', style: { flex: 0.6, padding: '12px 16px' }, children: [{ type: 'box', style: { display: 'inline-block', padding: '4px 8px', background: '#e0f2f1', color: '#00695c', borderRadius: '4px', fontSize: '12px' }, children: [{ type: 'paragraph', content: 'User', style: { margin: 0 } }] }] },
              { type: 'box', style: { flex: 0.6, padding: '12px 16px' }, children: [{ type: 'box', style: { display: 'inline-block', padding: '4px 8px', background: '#fce4ec', color: '#c2185b', borderRadius: '4px', fontSize: '12px' }, children: [{ type: 'paragraph', content: 'Inactive', style: { margin: 0 } }] }] }
            ]
          },
          {
            type: 'flex',
            direction: 'row',
            gap: '8px',
            justifyContent: 'space-between',
            style: { padding: '12px', borderTop: '2px solid #e0e0e0', alignItems: 'center' },
            children: [
              { type: 'paragraph', content: 'Page 1 of 8 | 3 rows', style: { margin: 0, fontSize: '12px', color: '#666' } },
              {
                type: 'flex',
                direction: 'row',
                gap: '8px',
                children: [
                  { type: 'button', label: '← Previous', variant: 'secondary', style: { padding: '6px 12px', border: '1px solid #ddd', borderRadius: '4px', background: '#f5f5f5', cursor: 'pointer', fontSize: '12px' } },
                  { type: 'box', style: { padding: '6px 12px', background: '#0078d4', color: 'white', borderRadius: '4px', fontSize: '12px', fontWeight: '600' }, children: [{ type: 'paragraph', content: '1', style: { margin: 0 } }] },
                  { type: 'button', label: '2', variant: 'secondary', style: { padding: '6px 12px', border: '1px solid #ddd', borderRadius: '4px', background: '#f5f5f5', cursor: 'pointer', fontSize: '12px' } },
                  { type: 'button', label: 'Next →', variant: 'secondary', style: { padding: '6px 12px', border: '1px solid #ddd', borderRadius: '4px', background: '#f5f5f5', cursor: 'pointer', fontSize: '12px' } }
                ]
              }
            ]
          }
        ]
      },
      tags: ['table', 'pagination', 'large-data', 'navigation'],
      author: 'system'
    });
  }

  registerEditableTable() {
    this.patterns.set('editable-table', {
      id: 'editable-table',
      name: 'Editable Table',
      icon: '✏️',
      category: 'tables',
      codeReduction: '76%',
      description: 'Table with inline editing capabilities for each cell',
      definition: {
        type: 'flex',
        direction: 'column',
        gap: '12px',
        style: { padding: '16px', background: '#fff', borderRadius: '8px', border: '1px solid #e0e0e0' },
        children: [
          {
            type: 'flex',
            direction: 'row',
            gap: '0',
            style: { background: '#f5f5f5', borderBottom: '2px solid #0078d4', padding: '0' },
            children: [
              { type: 'paragraph', content: 'Item', style: { flex: 1, padding: '12px 16px', margin: 0, fontWeight: '600', fontSize: '14px' } },
              { type: 'paragraph', content: 'Quantity', style: { flex: 0.5, padding: '12px 16px', margin: 0, fontWeight: '600', fontSize: '14px', textAlign: 'center' } },
              { type: 'paragraph', content: 'Unit Price', style: { flex: 0.6, padding: '12px 16px', margin: 0, fontWeight: '600', fontSize: '14px', textAlign: 'right' } },
              { type: 'paragraph', content: 'Total', style: { flex: 0.6, padding: '12px 16px', margin: 0, fontWeight: '600', fontSize: '14px', textAlign: 'right' } },
              { type: 'paragraph', content: '', style: { flex: 0.4, padding: '12px 16px', margin: 0 } }
            ]
          },
          {
            type: 'flex',
            direction: 'row',
            gap: '0',
            style: { borderBottom: '1px solid #e0e0e0', padding: '0', alignItems: 'center' },
            children: [
              { type: 'paragraph', content: 'Widget A', style: { flex: 1, padding: '12px 16px', margin: 0, fontSize: '14px' } },
              { type: 'input', style: { flex: 0.5, padding: '8px 12px', border: '1px solid #ddd', textAlign: 'center', borderRadius: '4px', fontSize: '13px' }, children: [{ type: 'paragraph', content: '5', style: { margin: 0 } }] },
              { type: 'paragraph', content: '$10.00', style: { flex: 0.6, padding: '12px 16px', margin: 0, fontSize: '14px', textAlign: 'right' } },
              { type: 'paragraph', content: '$50.00', style: { flex: 0.6, padding: '12px 16px', margin: 0, fontSize: '14px', textAlign: 'right', fontWeight: '600' } },
              { type: 'box', style: { flex: 0.4, padding: '12px 16px', textAlign: 'center' }, children: [{ type: 'button', label: '✕', variant: 'secondary', style: { padding: '4px 8px', border: '1px solid #ddd', borderRadius: '4px', background: '#fff', cursor: 'pointer', fontSize: '12px' } }] }
            ]
          },
          {
            type: 'flex',
            direction: 'row',
            gap: '0',
            style: { borderBottom: '1px solid #e0e0e0', padding: '0', alignItems: 'center' },
            children: [
              { type: 'paragraph', content: 'Widget B', style: { flex: 1, padding: '12px 16px', margin: 0, fontSize: '14px' } },
              { type: 'input', style: { flex: 0.5, padding: '8px 12px', border: '1px solid #ddd', textAlign: 'center', borderRadius: '4px', fontSize: '13px' }, children: [{ type: 'paragraph', content: '3', style: { margin: 0 } }] },
              { type: 'paragraph', content: '$25.00', style: { flex: 0.6, padding: '12px 16px', margin: 0, fontSize: '14px', textAlign: 'right' } },
              { type: 'paragraph', content: '$75.00', style: { flex: 0.6, padding: '12px 16px', margin: 0, fontSize: '14px', textAlign: 'right', fontWeight: '600' } },
              { type: 'box', style: { flex: 0.4, padding: '12px 16px', textAlign: 'center' }, children: [{ type: 'button', label: '✕', variant: 'secondary', style: { padding: '4px 8px', border: '1px solid #ddd', borderRadius: '4px', background: '#fff', cursor: 'pointer', fontSize: '12px' } }] }
            ]
          },
          {
            type: 'flex',
            direction: 'row',
            justifyContent: 'flex-end',
            gap: '8px',
            style: { padding: '12px 16px', borderTop: '2px solid #e0e0e0' },
            children: [
              { type: 'paragraph', content: 'Subtotal: $125.00', style: { margin: 0, fontSize: '13px', fontWeight: '600' } }
            ]
          }
        ]
      },
      tags: ['table', 'editable', 'inline-editing', 'forms'],
      author: 'system'
    });
  }

  registerResponsiveTable() {
    this.patterns.set('responsive-table', {
      id: 'responsive-table',
      name: 'Responsive Table',
      icon: '📱',
      category: 'tables',
      codeReduction: '74%',
      description: 'Table that adapts layout for mobile and tablet devices',
      definition: {
        type: 'flex',
        direction: 'column',
        gap: '12px',
        style: { padding: '16px', background: '#fff', borderRadius: '8px', border: '1px solid #e0e0e0' },
        children: [
          {
            type: 'flex',
            direction: 'column',
            gap: '8px',
            style: { padding: '12px', background: '#f9f9f9', borderRadius: '6px', border: '1px solid #e0e0e0' },
            children: [
              { type: 'flex', direction: 'row', gap: '12px', style: { justifyContent: 'space-between' }, children: [{ type: 'paragraph', content: 'Order #12345', style: { margin: 0, fontWeight: '600', fontSize: '14px' } }, { type: 'box', style: { padding: '4px 8px', background: '#e8f5e9', color: '#2e7d32', borderRadius: '4px', fontSize: '11px' }, children: [{ type: 'paragraph', content: 'Shipped', style: { margin: 0 } }] }] },
              { type: 'flex', direction: 'row', gap: '12px', style: { justifyContent: 'space-between', marginTop: '8px' }, children: [{ type: 'paragraph', content: 'Customer:', style: { margin: 0, fontSize: '13px', color: '#666' } }, { type: 'paragraph', content: 'John Doe', style: { margin: 0, fontSize: '13px', fontWeight: '500' } }] },
              { type: 'flex', direction: 'row', gap: '12px', style: { justifyContent: 'space-between' }, children: [{ type: 'paragraph', content: 'Total:', style: { margin: 0, fontSize: '13px', color: '#666' } }, { type: 'paragraph', content: '$259.99', style: { margin: 0, fontSize: '13px', fontWeight: '600' } }] },
              { type: 'flex', direction: 'row', gap: '12px', style: { justifyContent: 'space-between' }, children: [{ type: 'paragraph', content: 'Date:', style: { margin: 0, fontSize: '13px', color: '#666' } }, { type: 'paragraph', content: '12/01/25', style: { margin: 0, fontSize: '13px' } }] }
            ]
          },
          {
            type: 'flex',
            direction: 'column',
            gap: '8px',
            style: { padding: '12px', background: '#f9f9f9', borderRadius: '6px', border: '1px solid #e0e0e0' },
            children: [
              { type: 'flex', direction: 'row', gap: '12px', style: { justifyContent: 'space-between' }, children: [{ type: 'paragraph', content: 'Order #12346', style: { margin: 0, fontWeight: '600', fontSize: '14px' } }, { type: 'box', style: { padding: '4px 8px', background: '#fff3e0', color: '#e65100', borderRadius: '4px', fontSize: '11px' }, children: [{ type: 'paragraph', content: 'Pending', style: { margin: 0 } }] }] },
              { type: 'flex', direction: 'row', gap: '12px', style: { justifyContent: 'space-between', marginTop: '8px' }, children: [{ type: 'paragraph', content: 'Customer:', style: { margin: 0, fontSize: '13px', color: '#666' } }, { type: 'paragraph', content: 'Jane Smith', style: { margin: 0, fontSize: '13px', fontWeight: '500' } }] },
              { type: 'flex', direction: 'row', gap: '12px', style: { justifyContent: 'space-between' }, children: [{ type: 'paragraph', content: 'Total:', style: { margin: 0, fontSize: '13px', color: '#666' } }, { type: 'paragraph', content: '$149.50', style: { margin: 0, fontSize: '13px', fontWeight: '600' } }] },
              { type: 'flex', direction: 'row', gap: '12px', style: { justifyContent: 'space-between' }, children: [{ type: 'paragraph', content: 'Date:', style: { margin: 0, fontSize: '13px', color: '#666' } }, { type: 'paragraph', content: '11/30/25', style: { margin: 0, fontSize: '13px' } }] }
            ]
          }
        ]
      },
      tags: ['table', 'responsive', 'mobile', 'adaptive'],
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

function createTablePatternLibrary() {
  return new TablePatternLibrary();
}

export { TablePatternLibrary, createTablePatternLibrary };
