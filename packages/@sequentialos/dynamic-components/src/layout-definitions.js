/**
 * layout-definitions.js - Built-in layout preset definitions
 *
 * Layout configurations for grid, flex, and responsive layouts
 */

export const LAYOUT_DEFINITIONS = {
  'grid-2col': {
    type: 'grid',
    columns: 2,
    gap: '16px',
    responsive: {
      md: { columns: 2 },
      sm: { columns: 1 },
      xs: { columns: 1 }
    }
  },
  'grid-3col': {
    type: 'grid',
    columns: 3,
    gap: '16px',
    responsive: {
      lg: { columns: 3 },
      md: { columns: 2 },
      sm: { columns: 1 }
    }
  },
  'flex-row': {
    type: 'flex',
    direction: 'row',
    gap: '12px',
    alignItems: 'center',
    justifyContent: 'flex-start',
    wrap: false
  },
  'flex-column': {
    type: 'flex',
    direction: 'column',
    gap: '12px',
    alignItems: 'stretch',
    justifyContent: 'flex-start',
    wrap: false
  },
  'flex-row-center': {
    type: 'flex',
    direction: 'row',
    gap: '12px',
    alignItems: 'center',
    justifyContent: 'center',
    wrap: true
  },
  'flex-column-center': {
    type: 'flex',
    direction: 'column',
    gap: '12px',
    alignItems: 'center',
    justifyContent: 'center',
    wrap: false
  },
  'sidebar-left': {
    type: 'grid',
    columns: 'auto 1fr',
    gap: '20px',
    areas: [
      ['sidebar', 'main']
    ]
  },
  'sidebar-right': {
    type: 'grid',
    columns: '1fr auto',
    gap: '20px',
    areas: [
      ['main', 'sidebar']
    ]
  },
  'card-grid': {
    type: 'grid',
    columns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '20px',
    autoFlow: 'row'
  },
  'hero': {
    type: 'flex',
    direction: 'column',
    gap: '20px',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '500px'
  },
  'header-footer': {
    type: 'grid',
    rows: 'auto 1fr auto',
    height: '100vh',
    areas: [
      ['header'],
      ['main'],
      ['footer']
    ]
  }
};
