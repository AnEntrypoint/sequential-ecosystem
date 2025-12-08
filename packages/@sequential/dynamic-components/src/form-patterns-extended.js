import { PatternLibraryBase } from './pattern-library-base.js';

class FormPatternsExtended extends PatternLibraryBase {
  constructor() {
    super(null);
    this.registerAllPatterns();
  }

  registerAllPatterns() {
    this.registerRichTextarea();
    this.registerRadioGroup();
    this.registerCheckboxGroup();
    this.registerToggleSwitch();
    this.registerDatePicker();
    this.registerFileUpload();
    this.registerMultiSelect();
    this.registerAutoComplete();
  }

  registerRichTextarea() {
    this.patterns.set('rich-textarea', {
      id: 'rich-textarea',
      name: 'Rich Textarea',
      icon: '📝',
      category: 'forms',
      codeReduction: '72%',
      description: 'Enhanced textarea with character count, auto-expand, and formatting hints',
      definition: {
        type: 'flex',
        direction: 'column',
        gap: '8px',
        children: [
          {
            type: 'paragraph',
            content: 'Message',
            style: { margin: 0, fontSize: '13px', fontWeight: '600', color: '#333' }
          },
          {
            type: 'textarea',
            placeholder: 'Enter your message here...',
            style: {
              width: '100%',
              minHeight: '120px',
              padding: '10px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '13px',
              fontFamily: 'monospace',
              resize: 'vertical'
            }
          },
          {
            type: 'flex',
            gap: '12px',
            style: { fontSize: '11px', color: '#999' },
            children: [
              { type: 'paragraph', content: '0 / 500 characters', style: { margin: 0 } },
              { type: 'paragraph', content: '•', style: { margin: 0 } },
              { type: 'paragraph', content: 'Markdown supported', style: { margin: 0 } }
            ]
          }
        ]
      },
      tags: ['textarea', 'form', 'input', 'text'],
      author: 'system'
    });
  }

  registerRadioGroup() {
    this.patterns.set('radio-group', {
      id: 'radio-group',
      name: 'Radio Group',
      icon: '◉',
      category: 'forms',
      codeReduction: '68%',
      description: 'Grouped radio buttons with labels and descriptions',
      definition: {
        type: 'flex',
        direction: 'column',
        gap: '12px',
        children: [
          {
            type: 'paragraph',
            content: 'Choose option',
            style: { margin: 0, fontSize: '13px', fontWeight: '600', color: '#333' }
          },
          {
            type: 'flex',
            direction: 'column',
            gap: '8px',
            children: [
              {
                type: 'flex',
                gap: '8px',
                alignItems: 'center',
                children: [
                  { type: 'input', type: 'radio', name: 'option', value: '1', style: { width: '16px', height: '16px', cursor: 'pointer' } },
                  {
                    type: 'flex',
                    direction: 'column',
                    gap: '2px',
                    children: [
                      { type: 'paragraph', content: 'Option 1', style: { margin: 0, fontSize: '13px', fontWeight: '500' } },
                      { type: 'paragraph', content: 'Description for option 1', style: { margin: 0, fontSize: '11px', color: '#666' } }
                    ]
                  }
                ]
              },
              {
                type: 'flex',
                gap: '8px',
                alignItems: 'center',
                children: [
                  { type: 'input', type: 'radio', name: 'option', value: '2', style: { width: '16px', height: '16px', cursor: 'pointer' } },
                  {
                    type: 'flex',
                    direction: 'column',
                    gap: '2px',
                    children: [
                      { type: 'paragraph', content: 'Option 2', style: { margin: 0, fontSize: '13px', fontWeight: '500' } },
                      { type: 'paragraph', content: 'Description for option 2', style: { margin: 0, fontSize: '11px', color: '#666' } }
                    ]
                  }
                ]
              }
            ]
          }
        ]
      },
      tags: ['radio', 'select', 'input', 'form'],
      author: 'system'
    });
  }

  registerCheckboxGroup() {
    this.patterns.set('checkbox-group', {
      id: 'checkbox-group',
      name: 'Checkbox Group',
      icon: '☑️',
      category: 'forms',
      codeReduction: '70%',
      description: 'Grouped checkboxes with labels and toggle state management',
      definition: {
        type: 'flex',
        direction: 'column',
        gap: '12px',
        children: [
          {
            type: 'paragraph',
            content: 'Select options',
            style: { margin: 0, fontSize: '13px', fontWeight: '600', color: '#333' }
          },
          {
            type: 'flex',
            direction: 'column',
            gap: '8px',
            children: [
              {
                type: 'flex',
                gap: '8px',
                alignItems: 'center',
                children: [
                  { type: 'input', type: 'checkbox', value: '1', style: { width: '16px', height: '16px', cursor: 'pointer' } },
                  { type: 'paragraph', content: 'Option 1', style: { margin: 0, fontSize: '13px', cursor: 'pointer' } }
                ]
              },
              {
                type: 'flex',
                gap: '8px',
                alignItems: 'center',
                children: [
                  { type: 'input', type: 'checkbox', value: '2', style: { width: '16px', height: '16px', cursor: 'pointer' } },
                  { type: 'paragraph', content: 'Option 2', style: { margin: 0, fontSize: '13px', cursor: 'pointer' } }
                ]
              },
              {
                type: 'flex',
                gap: '8px',
                alignItems: 'center',
                children: [
                  { type: 'input', type: 'checkbox', value: '3', style: { width: '16px', height: '16px', cursor: 'pointer' } },
                  { type: 'paragraph', content: 'Option 3', style: { margin: 0, fontSize: '13px', cursor: 'pointer' } }
                ]
              }
            ]
          }
        ]
      },
      tags: ['checkbox', 'multi-select', 'input', 'form'],
      author: 'system'
    });
  }

  registerToggleSwitch() {
    this.patterns.set('toggle-switch', {
      id: 'toggle-switch',
      name: 'Toggle Switch',
      icon: '🔘',
      category: 'forms',
      codeReduction: '65%',
      description: 'iOS-style toggle switch with on/off states and labels',
      definition: {
        type: 'flex',
        gap: '12px',
        alignItems: 'center',
        children: [
          {
            type: 'flex',
            direction: 'column',
            gap: '4px',
            children: [
              { type: 'paragraph', content: 'Enable notifications', style: { margin: 0, fontSize: '13px', fontWeight: '500' } },
              { type: 'paragraph', content: 'Get notified about important updates', style: { margin: 0, fontSize: '11px', color: '#666' } }
            ]
          },
          {
            type: 'box',
            style: {
              width: '48px',
              height: '24px',
              background: '#4ade80',
              borderRadius: '12px',
              cursor: 'pointer',
              position: 'relative',
              transition: 'all 0.3s',
              display: 'flex',
              alignItems: 'center',
              padding: '2px'
            },
            children: [
              {
                type: 'box',
                style: {
                  width: '20px',
                  height: '20px',
                  background: 'white',
                  borderRadius: '50%',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                  transition: 'transform 0.3s',
                  transform: 'translateX(24px)'
                }
              }
            ]
          }
        ]
      },
      tags: ['toggle', 'switch', 'boolean', 'input'],
      author: 'system'
    });
  }

  registerDatePicker() {
    this.patterns.set('date-picker', {
      id: 'date-picker',
      name: 'Date Picker',
      icon: '📅',
      category: 'forms',
      codeReduction: '78%',
      description: 'Date input with calendar picker and format options',
      definition: {
        type: 'flex',
        direction: 'column',
        gap: '8px',
        children: [
          {
            type: 'paragraph',
            content: 'Select date',
            style: { margin: 0, fontSize: '13px', fontWeight: '600', color: '#333' }
          },
          {
            type: 'flex',
            gap: '8px',
            alignItems: 'center',
            children: [
              {
                type: 'input',
                type: 'date',
                placeholder: 'MM/DD/YYYY',
                style: {
                  flex: 1,
                  padding: '8px 10px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '13px',
                  cursor: 'pointer'
                }
              },
              {
                type: 'button',
                label: '📅',
                style: {
                  width: '36px',
                  height: '36px',
                  padding: 0,
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  background: '#f5f5f5',
                  cursor: 'pointer',
                  fontSize: '16px'
                }
              }
            ]
          },
          {
            type: 'paragraph',
            content: 'Format: MM/DD/YYYY',
            style: { margin: 0, fontSize: '11px', color: '#999' }
          }
        ]
      },
      tags: ['date', 'calendar', 'input', 'form'],
      author: 'system'
    });
  }

  registerFileUpload() {
    this.patterns.set('file-upload', {
      id: 'file-upload',
      name: 'File Upload',
      icon: '📤',
      category: 'forms',
      codeReduction: '75%',
      description: 'Drag-and-drop file upload zone with file preview',
      definition: {
        type: 'flex',
        direction: 'column',
        gap: '12px',
        children: [
          {
            type: 'paragraph',
            content: 'Upload file',
            style: { margin: 0, fontSize: '13px', fontWeight: '600', color: '#333' }
          },
          {
            type: 'box',
            style: {
              padding: '32px',
              border: '2px dashed #ddd',
              borderRadius: '8px',
              textAlign: 'center',
              background: '#f9f9f9',
              cursor: 'pointer',
              transition: 'all 0.2s'
            },
            children: [
              { type: 'paragraph', content: '📁', style: { fontSize: '32px', margin: '0 0 8px 0' } },
              { type: 'paragraph', content: 'Drop files here or click to select', style: { margin: '0 0 4px 0', fontSize: '13px', fontWeight: '500' } },
              { type: 'paragraph', content: 'Supports: PDF, DOC, XLS, JPG, PNG (max 5MB)', style: { margin: 0, fontSize: '11px', color: '#999' } }
            ]
          },
          {
            type: 'flex',
            direction: 'column',
            gap: '4px',
            children: [
              {
                type: 'flex',
                gap: '8px',
                alignItems: 'center',
                children: [
                  { type: 'paragraph', content: '✓', style: { margin: 0, color: '#4ade80', fontWeight: '600' } },
                  { type: 'paragraph', content: 'document.pdf (2.4 MB)', style: { margin: 0, fontSize: '12px' } }
                ]
              }
            ]
          }
        ]
      },
      tags: ['file', 'upload', 'input', 'form'],
      author: 'system'
    });
  }

  registerMultiSelect() {
    this.patterns.set('multi-select', {
      id: 'multi-select',
      name: 'Multi-Select',
      icon: '🏷️',
      category: 'forms',
      codeReduction: '73%',
      description: 'Tag-based multi-select input with autocomplete and chip display',
      definition: {
        type: 'flex',
        direction: 'column',
        gap: '8px',
        children: [
          {
            type: 'paragraph',
            content: 'Select items',
            style: { margin: 0, fontSize: '13px', fontWeight: '600', color: '#333' }
          },
          {
            type: 'box',
            style: {
              padding: '8px 10px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              background: '#f9f9f9',
              display: 'flex',
              gap: '6px',
              flexWrap: 'wrap',
              alignItems: 'center',
              minHeight: '40px'
            },
            children: [
              {
                type: 'box',
                style: {
                  background: '#e7f0ff',
                  color: '#0078d4',
                  padding: '4px 8px',
                  borderRadius: '3px',
                  display: 'flex',
                  gap: '6px',
                  alignItems: 'center',
                  fontSize: '12px'
                },
                children: [
                  { type: 'paragraph', content: 'React', style: { margin: 0 } },
                  { type: 'paragraph', content: '✕', style: { margin: 0, cursor: 'pointer', fontWeight: '600' } }
                ]
              },
              {
                type: 'box',
                style: {
                  background: '#e7f0ff',
                  color: '#0078d4',
                  padding: '4px 8px',
                  borderRadius: '3px',
                  display: 'flex',
                  gap: '6px',
                  alignItems: 'center',
                  fontSize: '12px'
                },
                children: [
                  { type: 'paragraph', content: 'TypeScript', style: { margin: 0 } },
                  { type: 'paragraph', content: '✕', style: { margin: 0, cursor: 'pointer', fontWeight: '600' } }
                ]
              },
              {
                type: 'input',
                placeholder: 'Add more...',
                style: {
                  border: 'none',
                  background: 'transparent',
                  fontSize: '13px',
                  outline: 'none',
                  flex: 1
                }
              }
            ]
          }
        ]
      },
      tags: ['multi-select', 'tags', 'input', 'form'],
      author: 'system'
    });
  }

  registerAutoComplete() {
    this.patterns.set('autocomplete', {
      id: 'autocomplete',
      name: 'Autocomplete',
      icon: '🔍',
      category: 'forms',
      codeReduction: '76%',
      description: 'Search input with autocomplete suggestions and filtering',
      definition: {
        type: 'flex',
        direction: 'column',
        gap: '8px',
        children: [
          {
            type: 'paragraph',
            content: 'Search',
            style: { margin: 0, fontSize: '13px', fontWeight: '600', color: '#333' }
          },
          {
            type: 'input',
            placeholder: 'Type to search...',
            style: {
              width: '100%',
              padding: '8px 10px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '13px'
            }
          },
          {
            type: 'box',
            style: {
              border: '1px solid #ddd',
              borderTop: 'none',
              borderRadius: '0 0 4px 4px',
              overflow: 'hidden',
              maxHeight: '200px',
              overflowY: 'auto',
              background: 'white'
            },
            children: [
              {
                type: 'box',
                style: {
                  padding: '8px 10px',
                  background: '#f5f5f5',
                  cursor: 'pointer',
                  borderBottom: '1px solid #eee'
                },
                children: [
                  { type: 'paragraph', content: '🔍 React', style: { margin: 0, fontSize: '13px' } }
                ]
              },
              {
                type: 'box',
                style: {
                  padding: '8px 10px',
                  background: 'white',
                  cursor: 'pointer',
                  borderBottom: '1px solid #eee'
                },
                children: [
                  { type: 'paragraph', content: '🔍 ReactDOM', style: { margin: 0, fontSize: '13px' } }
                ]
              },
              {
                type: 'box',
                style: {
                  padding: '8px 10px',
                  background: 'white',
                  cursor: 'pointer'
                },
                children: [
                  { type: 'paragraph', content: '🔍 Redux', style: { margin: 0, fontSize: '13px' } }
                ]
              }
            ]
          }
        ]
      },
      tags: ['autocomplete', 'search', 'input', 'form'],
      author: 'system'
    });
  }
}

function createFormPatternsExtended() {
  return new FormPatternsExtended();
}

export { FormPatternsExtended, createFormPatternsExtended };
