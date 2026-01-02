/**
 * ComponentPalette - Palette for selecting and adding components to flows
 *
 * Displays available:
 * - Tasks
 * - Flows
 * - Tools
 * - Custom components
 *
 * With search, filtering, and drag-drop support
 */

import React, { useState, useMemo } from 'react';

const ComponentPalette = ({
  tasks = [],
  flows = [],
  tools = [],
  onSelect,
  onDragStart
}) => {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');

  const items = useMemo(() => {
    const all = [
      ...tasks.map(t => ({ type: 'task', name: t, category: 'tasks', id: `task-${t}` })),
      ...flows.map(f => ({ type: 'flow', name: f, category: 'flows', id: `flow-${f}` })),
      ...tools.map(t => ({ type: 'tool', name: t.name, category: t.category, id: `tool-${t.name}` }))
    ];

    return all.filter(item => {
      const matchesCategory = category === 'all' || item.category === category;
      const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [tasks, flows, tools, search, category]);

  const categories = useMemo(() => {
    const cats = new Set(['all']);
    items.forEach(item => cats.add(item.category));
    return Array.from(cats);
  }, [items]);

  const typeIcons = {
    task: '⚡',
    flow: '🔄',
    tool: '🔧'
  };

  const typeColors = {
    task: '#3b82f6',
    flow: '#10b981',
    tool: '#f59e0b'
  };

  const typeBgColors = {
    task: '#dbeafe',
    flow: '#d1fae5',
    tool: '#fef3c7'
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
      padding: '16px',
      border: '1px solid #e5e7eb',
      borderRadius: '8px',
      backgroundColor: '#ffffff',
      maxHeight: '100%',
      overflow: 'auto'
    }}>
      <div>
        <h2 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: 600 }}>
          Components
        </h2>
      </div>

      <input
        type="text"
        placeholder="Search components..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{
          padding: '8px 12px',
          border: '1px solid #d1d5db',
          borderRadius: '4px',
          fontSize: '12px',
          fontFamily: 'inherit',
          width: '100%',
          boxSizing: 'border-box'
        }}
      />

      <div style={{
        display: 'flex',
        gap: '4px',
        flexWrap: 'wrap'
      }}>
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            style={{
              padding: '4px 8px',
              borderRadius: '4px',
              border: category === cat ? `2px solid #3b82f6` : '1px solid #d1d5db',
              backgroundColor: category === cat ? '#dbeafe' : '#f9fafb',
              color: category === cat ? '#3b82f6' : '#6b7280',
              cursor: 'pointer',
              fontSize: '11px',
              fontWeight: 500,
              textTransform: 'capitalize'
            }}
          >
            {cat === 'all' ? 'All' : cat}
          </button>
        ))}
      </div>

      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
        maxHeight: '400px',
        overflowY: 'auto'
      }}>
        {items.length === 0 ? (
          <div style={{
            padding: '12px',
            textAlign: 'center',
            color: '#9ca3af',
            fontSize: '12px'
          }}>
            No components found
          </div>
        ) : (
          items.map(item => (
            <div
              key={item.id}
              draggable={onDragStart ? true : false}
              onDragStart={(e) => onDragStart?.(item, e)}
              onClick={() => onSelect?.(item)}
              style={{
                padding: '10px 12px',
                backgroundColor: typeBgColors[item.type] || '#f3f4f6',
                border: `1px solid ${typeColors[item.type] || '#d1d5db'}`,
                borderRadius: '4px',
                cursor: 'pointer',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.opacity = '0.8';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.opacity = '1';
              }}
            >
              <span style={{ fontSize: '14px' }}>
                {typeIcons[item.type]}
              </span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontSize: '12px',
                  fontWeight: 500,
                  color: '#111827',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}>
                  {item.name}
                </div>
                {item.category && item.category !== item.type && (
                  <div style={{
                    fontSize: '10px',
                    color: '#6b7280',
                    textTransform: 'capitalize'
                  }}>
                    {item.category}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      <div style={{
        padding: '8px 12px',
        backgroundColor: '#f9fafb',
        border: '1px solid #e5e7eb',
        borderRadius: '4px',
        fontSize: '10px',
        color: '#6b7280'
      }}>
        Found {items.length} component{items.length !== 1 ? 's' : ''}
      </div>
    </div>
  );
};

export default ComponentPalette;
