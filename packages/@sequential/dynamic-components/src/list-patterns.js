import { PatternLibraryBase } from './pattern-library-base.js';

class ListPatternLibrary extends PatternLibraryBase {
  constructor() {
    super(null);
    this.registerAllPatterns();
  }

  registerAllPatterns() {
    this.registerPaginationList();
    this.registerInfiniteScrollList();
    this.registerFilteredList();
    this.registerSortableList();
    this.registerSearchableList();
    this.registerVirtualizedList();
    this.registerGroupedList();
    this.registerCompactList();
  }

  registerPaginationList() {
    this.patterns.set('pagination-list', {
      id: 'pagination-list',
      name: 'Pagination List',
      icon: '📄',
      category: 'lists',
      codeReduction: '80%',
      description: 'Multi-page data display with page navigation controls',
      definition: {
        type: 'flex',
        direction: 'column',
        gap: '16px',
        style: { padding: '20px', background: '#fff' },
        children: [
          {
            type: 'flex',
            direction: 'column',
            gap: '12px',
            style: { flex: 1 },
            children: [
              {
                type: 'flex',
                direction: 'row',
                gap: '12px',
                style: { alignItems: 'center', padding: '12px', background: '#f5f5f5', borderRadius: '6px', borderBottom: '1px solid #e0e0e0' },
                children: [
                  { type: 'paragraph', content: 'Item name', style: { flex: 1, margin: 0, fontWeight: '600', fontSize: '14px' } },
                  { type: 'paragraph', content: 'Status', style: { flex: 0.5, margin: 0, fontWeight: '600', fontSize: '14px', textAlign: 'center' } },
                  { type: 'paragraph', content: 'Date', style: { flex: 0.5, margin: 0, fontWeight: '600', fontSize: '14px', textAlign: 'right' } }
                ]
              },
              {
                type: 'flex',
                direction: 'row',
                gap: '12px',
                style: { alignItems: 'center', padding: '12px', borderBottom: '1px solid #e0e0e0' },
                children: [
                  { type: 'paragraph', content: 'Sample Item 1', style: { flex: 1, margin: 0, fontSize: '14px' } },
                  { type: 'box', style: { flex: 0.5, padding: '4px 8px', background: '#e8f5e9', color: '#2e7d32', borderRadius: '4px', textAlign: 'center', fontSize: '12px' }, children: [{ type: 'paragraph', content: 'Active', style: { margin: 0 } }] },
                  { type: 'paragraph', content: '2025-12-08', style: { flex: 0.5, margin: 0, fontSize: '14px', textAlign: 'right', color: '#666' } }
                ]
              },
              {
                type: 'flex',
                direction: 'row',
                gap: '12px',
                style: { alignItems: 'center', padding: '12px', borderBottom: '1px solid #e0e0e0' },
                children: [
                  { type: 'paragraph', content: 'Sample Item 2', style: { flex: 1, margin: 0, fontSize: '14px' } },
                  { type: 'box', style: { flex: 0.5, padding: '4px 8px', background: '#fff3e0', color: '#e65100', borderRadius: '4px', textAlign: 'center', fontSize: '12px' }, children: [{ type: 'paragraph', content: 'Pending', style: { margin: 0 } }] },
                  { type: 'paragraph', content: '2025-12-07', style: { flex: 0.5, margin: 0, fontSize: '14px', textAlign: 'right', color: '#666' } }
                ]
              },
              {
                type: 'flex',
                direction: 'row',
                gap: '12px',
                style: { alignItems: 'center', padding: '12px' },
                children: [
                  { type: 'paragraph', content: 'Sample Item 3', style: { flex: 1, margin: 0, fontSize: '14px' } },
                  { type: 'box', style: { flex: 0.5, padding: '4px 8px', background: '#fce4ec', color: '#c2185b', borderRadius: '4px', textAlign: 'center', fontSize: '12px' }, children: [{ type: 'paragraph', content: 'Inactive', style: { margin: 0 } }] },
                  { type: 'paragraph', content: '2025-12-06', style: { flex: 0.5, margin: 0, fontSize: '14px', textAlign: 'right', color: '#666' } }
                ]
              }
            ]
          },
          {
            type: 'flex',
            direction: 'row',
            gap: '8px',
            style: { justifyContent: 'center', alignItems: 'center', padding: '12px' },
            children: [
              { type: 'button', label: '← Prev', variant: 'secondary', style: { padding: '8px 12px', border: '1px solid #ddd', borderRadius: '4px', background: '#f5f5f5', cursor: 'pointer', fontSize: '14px' } },
              { type: 'box', style: { padding: '8px 12px', background: '#0078d4', color: 'white', borderRadius: '4px', fontSize: '14px', fontWeight: '600' }, children: [{ type: 'paragraph', content: 'Page 1', style: { margin: 0 } }] },
              { type: 'button', label: 'Page 2', variant: 'secondary', style: { padding: '8px 12px', border: '1px solid #ddd', borderRadius: '4px', background: '#f5f5f5', cursor: 'pointer', fontSize: '14px' } },
              { type: 'button', label: 'Page 3', variant: 'secondary', style: { padding: '8px 12px', border: '1px solid #ddd', borderRadius: '4px', background: '#f5f5f5', cursor: 'pointer', fontSize: '14px' } },
              { type: 'button', label: 'Next →', variant: 'secondary', style: { padding: '8px 12px', border: '1px solid #ddd', borderRadius: '4px', background: '#f5f5f5', cursor: 'pointer', fontSize: '14px' } }
            ]
          }
        ]
      },
      tags: ['list', 'pagination', 'data-display', 'navigation'],
      author: 'system'
    });
  }

  registerInfiniteScrollList() {
    this.patterns.set('infinite-scroll-list', {
      id: 'infinite-scroll-list',
      name: 'Infinite Scroll List',
      icon: '♾️',
      category: 'lists',
      codeReduction: '78%',
      description: 'Auto-loading list that fetches more items on scroll',
      definition: {
        type: 'flex',
        direction: 'column',
        gap: '0',
        style: { height: '400px', overflow: 'auto', background: '#fff' },
        children: [
          {
            type: 'flex',
            direction: 'column',
            gap: '0',
            children: [
              {
                type: 'flex',
                direction: 'row',
                gap: '12px',
                style: { alignItems: 'center', padding: '12px', borderBottom: '1px solid #e0e0e0', background: '#f9f9f9' },
                children: [
                  { type: 'box', style: { width: '40px', height: '40px', background: '#e0e0e0', borderRadius: '50%' } },
                  {
                    type: 'flex',
                    direction: 'column',
                    gap: '4px',
                    children: [
                      { type: 'paragraph', content: 'User Name', style: { margin: 0, fontWeight: '600', fontSize: '14px' } },
                      { type: 'paragraph', content: '@username', style: { margin: 0, fontSize: '12px', color: '#666' } }
                    ]
                  }
                ]
              },
              {
                type: 'flex',
                direction: 'row',
                gap: '12px',
                style: { alignItems: 'center', padding: '12px', borderBottom: '1px solid #e0e0e0', background: '#f9f9f9' },
                children: [
                  { type: 'box', style: { width: '40px', height: '40px', background: '#e0e0e0', borderRadius: '50%' } },
                  {
                    type: 'flex',
                    direction: 'column',
                    gap: '4px',
                    children: [
                      { type: 'paragraph', content: 'User Name', style: { margin: 0, fontWeight: '600', fontSize: '14px' } },
                      { type: 'paragraph', content: '@username', style: { margin: 0, fontSize: '12px', color: '#666' } }
                    ]
                  }
                ]
              },
              {
                type: 'flex',
                direction: 'row',
                gap: '12px',
                style: { alignItems: 'center', padding: '12px', borderBottom: '1px solid #e0e0e0', background: '#f9f9f9' },
                children: [
                  { type: 'box', style: { width: '40px', height: '40px', background: '#e0e0e0', borderRadius: '50%' } },
                  {
                    type: 'flex',
                    direction: 'column',
                    gap: '4px',
                    children: [
                      { type: 'paragraph', content: 'User Name', style: { margin: 0, fontWeight: '600', fontSize: '14px' } },
                      { type: 'paragraph', content: '@username', style: { margin: 0, fontSize: '12px', color: '#666' } }
                    ]
                  }
                ]
              },
              {
                type: 'flex',
                direction: 'row',
                gap: '12px',
                justifyContent: 'center',
                style: { alignItems: 'center', padding: '16px', borderTop: '1px solid #e0e0e0' },
                children: [
                  { type: 'box', style: { width: '20px', height: '20px', border: '3px solid #0078d4', borderRadius: '50%', borderTop: '3px solid #e0e0e0', animation: 'spin 1s linear infinite' } }
                ]
              }
            ]
          }
        ]
      },
      tags: ['list', 'infinite-scroll', 'loading', 'streaming-data'],
      author: 'system'
    });
  }

  registerFilteredList() {
    this.patterns.set('filtered-list', {
      id: 'filtered-list',
      name: 'Filtered List',
      icon: '🔍',
      category: 'lists',
      codeReduction: '82%',
      description: 'List with category/tag filters and visual indicators',
      definition: {
        type: 'flex',
        direction: 'column',
        gap: '16px',
        style: { padding: '20px', background: '#fff' },
        children: [
          {
            type: 'flex',
            direction: 'row',
            gap: '8px',
            style: { flexWrap: 'wrap', marginBottom: '12px' },
            children: [
              { type: 'button', label: 'All', variant: 'primary', style: { padding: '6px 12px', background: '#0078d4', color: 'white', border: 'none', borderRadius: '20px', cursor: 'pointer', fontSize: '12px', fontWeight: '600' } },
              { type: 'button', label: 'Design', variant: 'secondary', style: { padding: '6px 12px', background: '#e8e8e8', color: '#333', border: 'none', borderRadius: '20px', cursor: 'pointer', fontSize: '12px' } },
              { type: 'button', label: 'Development', variant: 'secondary', style: { padding: '6px 12px', background: '#e8e8e8', color: '#333', border: 'none', borderRadius: '20px', cursor: 'pointer', fontSize: '12px' } },
              { type: 'button', label: 'Marketing', variant: 'secondary', style: { padding: '6px 12px', background: '#e8e8e8', color: '#333', border: 'none', borderRadius: '20px', cursor: 'pointer', fontSize: '12px' } },
              { type: 'button', label: 'Sales', variant: 'secondary', style: { padding: '6px 12px', background: '#e8e8e8', color: '#333', border: 'none', borderRadius: '20px', cursor: 'pointer', fontSize: '12px' } }
            ]
          },
          {
            type: 'flex',
            direction: 'column',
            gap: '8px',
            children: [
              {
                type: 'flex',
                direction: 'row',
                gap: '12px',
                style: { alignItems: 'center', padding: '12px', background: '#f5f5f5', borderRadius: '6px', borderLeft: '4px solid #0078d4' },
                children: [
                  { type: 'box', style: { width: '8px', height: '8px', background: '#0078d4', borderRadius: '50%' } },
                  { type: 'paragraph', content: 'Design System Update', style: { flex: 1, margin: 0, fontSize: '14px', fontWeight: '500' } },
                  { type: 'box', style: { padding: '4px 8px', background: '#e8f5e9', color: '#2e7d32', borderRadius: '4px', fontSize: '11px' }, children: [{ type: 'paragraph', content: 'Design', style: { margin: 0 } }] }
                ]
              },
              {
                type: 'flex',
                direction: 'row',
                gap: '12px',
                style: { alignItems: 'center', padding: '12px', background: '#f5f5f5', borderRadius: '6px', borderLeft: '4px solid #00897b' },
                children: [
                  { type: 'box', style: { width: '8px', height: '8px', background: '#00897b', borderRadius: '50%' } },
                  { type: 'paragraph', content: 'API Implementation', style: { flex: 1, margin: 0, fontSize: '14px', fontWeight: '500' } },
                  { type: 'box', style: { padding: '4px 8px', background: '#f3e5f5', color: '#7b1fa2', borderRadius: '4px', fontSize: '11px' }, children: [{ type: 'paragraph', content: 'Development', style: { margin: 0 } }] }
                ]
              },
              {
                type: 'flex',
                direction: 'row',
                gap: '12px',
                style: { alignItems: 'center', padding: '12px', background: '#f5f5f5', borderRadius: '6px', borderLeft: '4px solid #f57c00' },
                children: [
                  { type: 'box', style: { width: '8px', height: '8px', background: '#f57c00', borderRadius: '50%' } },
                  { type: 'paragraph', content: 'Q1 Campaign Planning', style: { flex: 1, margin: 0, fontSize: '14px', fontWeight: '500' } },
                  { type: 'box', style: { padding: '4px 8px', background: '#fff3e0', color: '#e65100', borderRadius: '4px', fontSize: '11px' }, children: [{ type: 'paragraph', content: 'Marketing', style: { margin: 0 } }] }
                ]
              }
            ]
          }
        ]
      },
      tags: ['list', 'filtering', 'categories', 'search-refinement'],
      author: 'system'
    });
  }

  registerSortableList() {
    this.patterns.set('sortable-list', {
      id: 'sortable-list',
      name: 'Sortable List',
      icon: '↕️',
      category: 'lists',
      codeReduction: '79%',
      description: 'List with clickable column headers for sorting',
      definition: {
        type: 'flex',
        direction: 'column',
        gap: '0',
        style: { padding: '20px', background: '#fff' },
        children: [
          {
            type: 'flex',
            direction: 'column',
            gap: '0',
            children: [
              {
                type: 'flex',
                direction: 'row',
                gap: '0',
                style: { borderBottom: '2px solid #0078d4', padding: '0' },
                children: [
                  { type: 'button', label: 'Name ↓', variant: 'secondary', style: { flex: 1, padding: '12px', border: 'none', background: 'transparent', textAlign: 'left', fontWeight: '600', fontSize: '14px', cursor: 'pointer', borderRadius: '0' } },
                  { type: 'button', label: 'Priority', variant: 'secondary', style: { flex: 0.5, padding: '12px', border: 'none', background: 'transparent', textAlign: 'center', fontWeight: '600', fontSize: '14px', cursor: 'pointer', borderRadius: '0' } },
                  { type: 'button', label: 'Status ↑', variant: 'secondary', style: { flex: 0.5, padding: '12px', border: 'none', background: 'transparent', textAlign: 'right', fontWeight: '600', fontSize: '14px', cursor: 'pointer', borderRadius: '0' } }
                ]
              },
              {
                type: 'flex',
                direction: 'row',
                gap: '0',
                style: { borderBottom: '1px solid #e0e0e0', padding: '0' },
                children: [
                  { type: 'paragraph', content: 'Complete project proposal', style: { flex: 1, padding: '12px', margin: 0, fontSize: '14px' } },
                  { type: 'box', style: { flex: 0.5, padding: '12px', textAlign: 'center' }, children: [{ type: 'box', style: { display: 'inline-block', padding: '4px 8px', background: '#ffebee', color: '#c62828', borderRadius: '4px', fontSize: '12px' }, children: [{ type: 'paragraph', content: 'High', style: { margin: 0 } }] }] },
                  { type: 'box', style: { flex: 0.5, padding: '12px', textAlign: 'right' }, children: [{ type: 'box', style: { display: 'inline-block', padding: '4px 8px', background: '#e8f5e9', color: '#2e7d32', borderRadius: '4px', fontSize: '12px' }, children: [{ type: 'paragraph', content: 'Done', style: { margin: 0 } }] }] }
                ]
              },
              {
                type: 'flex',
                direction: 'row',
                gap: '0',
                style: { borderBottom: '1px solid #e0e0e0', padding: '0' },
                children: [
                  { type: 'paragraph', content: 'Design homepage mockup', style: { flex: 1, padding: '12px', margin: 0, fontSize: '14px' } },
                  { type: 'box', style: { flex: 0.5, padding: '12px', textAlign: 'center' }, children: [{ type: 'box', style: { display: 'inline-block', padding: '4px 8px', background: '#fff3e0', color: '#e65100', borderRadius: '4px', fontSize: '12px' }, children: [{ type: 'paragraph', content: 'Medium', style: { margin: 0 } }] }] },
                  { type: 'box', style: { flex: 0.5, padding: '12px', textAlign: 'right' }, children: [{ type: 'box', style: { display: 'inline-block', padding: '4px 8px', background: '#fff3e0', color: '#e65100', borderRadius: '4px', fontSize: '12px' }, children: [{ type: 'paragraph', content: 'In Progress', style: { margin: 0 } }] }] }
                ]
              },
              {
                type: 'flex',
                direction: 'row',
                gap: '0',
                style: { borderBottom: '1px solid #e0e0e0', padding: '0' },
                children: [
                  { type: 'paragraph', content: 'Review user feedback', style: { flex: 1, padding: '12px', margin: 0, fontSize: '14px' } },
                  { type: 'box', style: { flex: 0.5, padding: '12px', textAlign: 'center' }, children: [{ type: 'box', style: { display: 'inline-block', padding: '4px 8px', background: '#e0f2f1', color: '#00695c', borderRadius: '4px', fontSize: '12px' }, children: [{ type: 'paragraph', content: 'Low', style: { margin: 0 } }] }] },
                  { type: 'box', style: { flex: 0.5, padding: '12px', textAlign: 'right' }, children: [{ type: 'box', style: { display: 'inline-block', padding: '4px 8px', background: '#f5f5f5', color: '#666', borderRadius: '4px', fontSize: '12px' }, children: [{ type: 'paragraph', content: 'Pending', style: { margin: 0 } }] }] }
                ]
              }
            ]
          }
        ]
      },
      tags: ['list', 'sorting', 'table', 'data-organization'],
      author: 'system'
    });
  }

  registerSearchableList() {
    this.patterns.set('searchable-list', {
      id: 'searchable-list',
      name: 'Searchable List',
      icon: '🔎',
      category: 'lists',
      codeReduction: '76%',
      description: 'List with real-time search and keyword highlighting',
      definition: {
        type: 'flex',
        direction: 'column',
        gap: '16px',
        style: { padding: '20px', background: '#fff' },
        children: [
          {
            type: 'flex',
            direction: 'row',
            gap: '12px',
            style: { alignItems: 'center', padding: '12px', background: '#f5f5f5', borderRadius: '6px', border: '1px solid #e0e0e0' },
            children: [
              { type: 'paragraph', content: '🔍', style: { margin: 0, fontSize: '16px' } },
              { type: 'input', placeholder: 'Search items...', style: { flex: 1, padding: '8px', border: 'none', background: 'transparent', fontSize: '14px', outline: 'none' } }
            ]
          },
          {
            type: 'flex',
            direction: 'column',
            gap: '8px',
            children: [
              {
                type: 'flex',
                direction: 'row',
                gap: '12px',
                style: { alignItems: 'center', padding: '12px', background: '#f0f7ff', borderRadius: '6px', borderLeft: '4px solid #0078d4' },
                children: [
                  { type: 'box', style: { width: '40px', height: '40px', background: '#0078d4', borderRadius: '6px', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', fontWeight: '600' }, children: [{ type: 'paragraph', content: 'JS', style: { margin: 0 } }] },
                  {
                    type: 'flex',
                    direction: 'column',
                    gap: '4px',
                    style: { flex: 1 },
                    children: [
                      { type: 'paragraph', content: 'JavaScript Guide', style: { margin: 0, fontWeight: '600', fontSize: '14px' } },
                      { type: 'paragraph', content: 'Complete <mark>JavaScript</mark> language fundamentals...', style: { margin: 0, fontSize: '12px', color: '#666' } }
                    ]
                  }
                ]
              },
              {
                type: 'flex',
                direction: 'row',
                gap: '12px',
                style: { alignItems: 'center', padding: '12px', background: '#f5f5f5', borderRadius: '6px' },
                children: [
                  { type: 'box', style: { width: '40px', height: '40px', background: '#e0e0e0', borderRadius: '6px', color: '#666', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', fontWeight: '600' }, children: [{ type: 'paragraph', content: 'PY', style: { margin: 0 } }] },
                  {
                    type: 'flex',
                    direction: 'column',
                    gap: '4px',
                    style: { flex: 1 },
                    children: [
                      { type: 'paragraph', content: 'Python Basics', style: { margin: 0, fontWeight: '600', fontSize: '14px', color: '#999' } },
                      { type: 'paragraph', content: 'Learn Python programming from scratch', style: { margin: 0, fontSize: '12px', color: '#999' } }
                    ]
                  }
                ]
              }
            ]
          },
          {
            type: 'flex',
            direction: 'row',
            justifyContent: 'center',
            style: { padding: '12px' },
            children: [
              { type: 'paragraph', content: '1 of 3 results', style: { margin: 0, fontSize: '12px', color: '#666' } }
            ]
          }
        ]
      },
      tags: ['list', 'search', 'filtering', 'keyword-highlighting'],
      author: 'system'
    });
  }

  registerVirtualizedList() {
    this.patterns.set('virtualized-list', {
      id: 'virtualized-list',
      name: 'Virtualized List',
      icon: '⚡',
      category: 'lists',
      codeReduction: '84%',
      description: 'High-performance list rendering only visible items (10k+ items)',
      definition: {
        type: 'flex',
        direction: 'column',
        gap: '12px',
        style: { padding: '20px', background: '#fff', height: '500px', overflow: 'auto' },
        children: [
          {
            type: 'flex',
            direction: 'row',
            gap: '12px',
            style: { alignItems: 'center', padding: '12px', background: '#f9f9f9', borderRadius: '4px', borderBottom: '1px solid #e0e0e0', position: 'sticky', top: 0, zIndex: 10 },
            children: [
              { type: 'box', style: { width: '40px', height: '40px', background: '#d0d0d0', borderRadius: '50%' } },
              {
                type: 'flex',
                direction: 'column',
                gap: '4px',
                style: { flex: 1 },
                children: [
                  { type: 'paragraph', content: 'Item 1 of 10,000', style: { margin: 0, fontWeight: '600', fontSize: '14px' } },
                  { type: 'paragraph', content: 'List renders 20 items at a time (virtualized)', style: { margin: 0, fontSize: '12px', color: '#666' } }
                ]
              }
            ]
          },
          {
            type: 'flex',
            direction: 'row',
            gap: '12px',
            style: { alignItems: 'center', padding: '12px', background: '#f9f9f9', borderRadius: '4px', borderBottom: '1px solid #e0e0e0' },
            children: [
              { type: 'box', style: { width: '40px', height: '40px', background: '#d0d0d0', borderRadius: '50%' } },
              {
                type: 'flex',
                direction: 'column',
                gap: '4px',
                style: { flex: 1 },
                children: [
                  { type: 'paragraph', content: 'Item 2 of 10,000', style: { margin: 0, fontWeight: '600', fontSize: '14px' } },
                  { type: 'paragraph', content: 'Smooth 60fps scrolling performance', style: { margin: 0, fontSize: '12px', color: '#666' } }
                ]
              }
            ]
          },
          {
            type: 'flex',
            direction: 'row',
            gap: '12px',
            style: { alignItems: 'center', padding: '12px', background: '#f9f9f9', borderRadius: '4px', borderBottom: '1px solid #e0e0e0' },
            children: [
              { type: 'box', style: { width: '40px', height: '40px', background: '#d0d0d0', borderRadius: '50%' } },
              {
                type: 'flex',
                direction: 'column',
                gap: '4px',
                style: { flex: 1 },
                children: [
                  { type: 'paragraph', content: 'Item 3 of 10,000', style: { margin: 0, fontWeight: '600', fontSize: '14px' } },
                  { type: 'paragraph', content: 'DOM contains only visible rows', style: { margin: 0, fontSize: '12px', color: '#666' } }
                ]
              }
            ]
          },
          {
            type: 'flex',
            direction: 'row',
            justifyContent: 'center',
            style: { padding: '16px', background: '#f5f5f5', borderRadius: '4px', border: '1px dashed #ddd' },
            children: [
              { type: 'paragraph', content: '⬇️ Scroll for more (9,997 items remaining)', style: { margin: 0, fontSize: '12px', color: '#666' } }
            ]
          }
        ]
      },
      tags: ['list', 'performance', 'virtualization', 'large-datasets'],
      author: 'system'
    });
  }

  registerGroupedList() {
    this.patterns.set('grouped-list', {
      id: 'grouped-list',
      name: 'Grouped List',
      icon: '📂',
      category: 'lists',
      codeReduction: '81%',
      description: 'Hierarchical list with collapsible groups and sections',
      definition: {
        type: 'flex',
        direction: 'column',
        gap: '8px',
        style: { padding: '20px', background: '#fff' },
        children: [
          {
            type: 'flex',
            direction: 'column',
            gap: '0',
            style: { borderRadius: '6px', border: '1px solid #e0e0e0', overflow: 'hidden' },
            children: [
              {
                type: 'button',
                label: '▼ Design & UX (5 items)',
                variant: 'secondary',
                style: { width: '100%', padding: '12px 16px', background: '#f5f5f5', border: 'none', textAlign: 'left', fontWeight: '600', fontSize: '14px', cursor: 'pointer', borderBottom: '1px solid #e0e0e0' }
              },
              {
                type: 'flex',
                direction: 'column',
                gap: '0',
                children: [
                  { type: 'paragraph', content: '  • Design System Components', style: { margin: 0, padding: '10px 16px', fontSize: '13px', borderBottom: '1px solid #f0f0f0', paddingLeft: '32px' } },
                  { type: 'paragraph', content: '  • Figma Icons Library', style: { margin: 0, padding: '10px 16px', fontSize: '13px', borderBottom: '1px solid #f0f0f0', paddingLeft: '32px' } },
                  { type: 'paragraph', content: '  • Accessibility Audit', style: { margin: 0, padding: '10px 16px', fontSize: '13px', borderBottom: '1px solid #f0f0f0', paddingLeft: '32px' } },
                  { type: 'paragraph', content: '  • User Research Findings', style: { margin: 0, padding: '10px 16px', fontSize: '13px', borderBottom: '1px solid #f0f0f0', paddingLeft: '32px' } },
                  { type: 'paragraph', content: '  • Prototype Testing', style: { margin: 0, padding: '10px 16px', fontSize: '13px', paddingLeft: '32px' } }
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
                type: 'button',
                label: '▶ Development (8 items)',
                variant: 'secondary',
                style: { width: '100%', padding: '12px 16px', background: '#f5f5f5', border: 'none', textAlign: 'left', fontWeight: '600', fontSize: '14px', cursor: 'pointer', borderBottom: '1px solid #e0e0e0' }
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
                type: 'button',
                label: '▼ QA & Testing (3 items)',
                variant: 'secondary',
                style: { width: '100%', padding: '12px 16px', background: '#f5f5f5', border: 'none', textAlign: 'left', fontWeight: '600', fontSize: '14px', cursor: 'pointer', borderBottom: '1px solid #e0e0e0' }
              },
              {
                type: 'flex',
                direction: 'column',
                gap: '0',
                children: [
                  { type: 'paragraph', content: '  • Manual Testing Checklist', style: { margin: 0, padding: '10px 16px', fontSize: '13px', borderBottom: '1px solid #f0f0f0', paddingLeft: '32px' } },
                  { type: 'paragraph', content: '  • Automated Test Suite', style: { margin: 0, padding: '10px 16px', fontSize: '13px', borderBottom: '1px solid #f0f0f0', paddingLeft: '32px' } },
                  { type: 'paragraph', content: '  • Bug Reports', style: { margin: 0, padding: '10px 16px', fontSize: '13px', paddingLeft: '32px' } }
                ]
              }
            ]
          }
        ]
      },
      tags: ['list', 'hierarchy', 'collapsible', 'grouping'],
      author: 'system'
    });
  }

  registerCompactList() {
    this.patterns.set('compact-list', {
      id: 'compact-list',
      name: 'Compact List',
      icon: '📋',
      category: 'lists',
      codeReduction: '75%',
      description: 'Dense list layout for quick scanning and high-volume data',
      definition: {
        type: 'flex',
        direction: 'column',
        gap: '0',
        style: { padding: '16px', background: '#fff' },
        children: [
          {
            type: 'flex',
            direction: 'column',
            gap: '0',
            children: [
              {
                type: 'flex',
                direction: 'row',
                gap: '12px',
                style: { alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #f0f0f0', fontSize: '13px' },
                children: [
                  { type: 'box', style: { width: '24px', height: '24px', background: '#e0e0e0', borderRadius: '4px' } },
                  { type: 'paragraph', content: 'Task A123', style: { flex: 1, margin: 0, fontWeight: '500', fontSize: '13px' } },
                  { type: 'paragraph', content: 'High', style: { flex: 0.3, margin: 0, fontSize: '12px', color: '#d32f2f', fontWeight: '600' } },
                  { type: 'paragraph', content: 'Today', style: { flex: 0.3, margin: 0, fontSize: '12px', color: '#666' } }
                ]
              },
              {
                type: 'flex',
                direction: 'row',
                gap: '12px',
                style: { alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #f0f0f0', fontSize: '13px' },
                children: [
                  { type: 'box', style: { width: '24px', height: '24px', background: '#e0e0e0', borderRadius: '4px' } },
                  { type: 'paragraph', content: 'Task B456', style: { flex: 1, margin: 0, fontWeight: '500', fontSize: '13px' } },
                  { type: 'paragraph', content: 'Medium', style: { flex: 0.3, margin: 0, fontSize: '12px', color: '#f57c00', fontWeight: '600' } },
                  { type: 'paragraph', content: 'Tomorrow', style: { flex: 0.3, margin: 0, fontSize: '12px', color: '#666' } }
                ]
              },
              {
                type: 'flex',
                direction: 'row',
                gap: '12px',
                style: { alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #f0f0f0', fontSize: '13px' },
                children: [
                  { type: 'box', style: { width: '24px', height: '24px', background: '#e0e0e0', borderRadius: '4px' } },
                  { type: 'paragraph', content: 'Task C789', style: { flex: 1, margin: 0, fontWeight: '500', fontSize: '13px' } },
                  { type: 'paragraph', content: 'Low', style: { flex: 0.3, margin: 0, fontSize: '12px', color: '#1976d2', fontWeight: '600' } },
                  { type: 'paragraph', content: '12/12/25', style: { flex: 0.3, margin: 0, fontSize: '12px', color: '#666' } }
                ]
              },
              {
                type: 'flex',
                direction: 'row',
                gap: '12px',
                style: { alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #f0f0f0', fontSize: '13px' },
                children: [
                  { type: 'box', style: { width: '24px', height: '24px', background: '#e0e0e0', borderRadius: '4px' } },
                  { type: 'paragraph', content: 'Task D012', style: { flex: 1, margin: 0, fontWeight: '500', fontSize: '13px' } },
                  { type: 'paragraph', content: 'Low', style: { flex: 0.3, margin: 0, fontSize: '12px', color: '#1976d2', fontWeight: '600' } },
                  { type: 'paragraph', content: '12/15/25', style: { flex: 0.3, margin: 0, fontSize: '12px', color: '#666' } }
                ]
              },
              {
                type: 'flex',
                direction: 'row',
                gap: '12px',
                style: { alignItems: 'center', padding: '8px 0', fontSize: '13px' },
                children: [
                  { type: 'box', style: { width: '24px', height: '24px', background: '#e0e0e0', borderRadius: '4px' } },
                  { type: 'paragraph', content: 'Task E345', style: { flex: 1, margin: 0, fontWeight: '500', fontSize: '13px' } },
                  { type: 'paragraph', content: 'Medium', style: { flex: 0.3, margin: 0, fontSize: '12px', color: '#f57c00', fontWeight: '600' } },
                  { type: 'paragraph', content: '12/20/25', style: { flex: 0.3, margin: 0, fontSize: '12px', color: '#666' } }
                ]
              }
            ]
          }
        ]
      },
      tags: ['list', 'compact', 'dense', 'scanning'],
      author: 'system'
    });
  }

}

function createListPatternLibrary() {
  return new ListPatternLibrary();
}

export { ListPatternLibrary, createListPatternLibrary };
