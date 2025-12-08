class PatternVariantManager {
  constructor() {
    this.variants = new Map();
    this.selectedVariantId = null;
    this.filterType = 'all';
    this.isOpen = false;
  }

  addVariant(variant) {
    this.variants.set(variant.id, {
      ...variant,
      addedAt: new Date().toISOString(),
      usageCount: 0
    });
  }

  getAllVariants() {
    return Array.from(this.variants.values());
  }

  getVariantsByType(type) {
    return this.getAllVariants().filter(v => {
      if (type === 'theme') return v.tags && v.tags.includes('themed');
      if (type === 'size') return v.tags && v.tags.includes('sized');
      if (type === 'responsive') return v.tags && v.tags.includes('responsive');
      return true;
    });
  }

  getVariantsByPattern(patternId) {
    return this.getAllVariants().filter(v => v.basePatternId === patternId);
  }

  deleteVariant(variantId) {
    return this.variants.delete(variantId);
  }

  renameVariant(variantId, newName) {
    const variant = this.variants.get(variantId);
    if (variant) {
      variant.description = newName;
      return true;
    }
    return false;
  }

  incrementUsageCount(variantId) {
    const variant = this.variants.get(variantId);
    if (variant) {
      variant.usageCount++;
      return true;
    }
    return false;
  }

  buildUI() {
    return {
      type: 'box',
      style: {
        position: 'fixed',
        inset: 0,
        background: this.isOpen ? 'rgba(0, 0, 0, 0.5)' : 'rgba(0, 0, 0, 0)',
        zIndex: 1003,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        pointerEvents: this.isOpen ? 'auto' : 'none',
        opacity: this.isOpen ? 1 : 0,
        transition: 'all 0.2s'
      },
      children: [
        {
          type: 'box',
          style: {
            background: '#252526',
            borderRadius: '8px',
            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.2)',
            width: '90%',
            maxWidth: '1000px',
            maxHeight: '80vh',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            border: '1px solid #3e3e42'
          },
          children: [
            this.buildHeader(),
            this.buildContent()
          ]
        }
      ]
    };
  }

  buildHeader() {
    return {
      type: 'flex',
      style: {
        padding: '16px 20px',
        borderBottom: '1px solid #3e3e42',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: '#1e1e1e'
      },
      children: [
        {
          type: 'heading',
          content: '📋 Pattern Variants',
          level: 2,
          style: {
            margin: 0,
            fontSize: '18px',
            color: '#e0e0e0'
          }
        },
        {
          type: 'box',
          style: { display: 'flex', gap: '8px' },
          children: [
            {
              type: 'button',
              label: '✕',
              style: {
                background: 'transparent',
                border: 'none',
                fontSize: '18px',
                cursor: 'pointer',
                color: '#999'
              },
              onClick: () => this.close()
            }
          ]
        }
      ]
    };
  }

  buildContent() {
    const allVariants = this.getAllVariants();
    const filteredVariants = this.filterType === 'all'
      ? allVariants
      : this.getVariantsByType(this.filterType);

    return {
      type: 'flex',
      style: {
        flex: 1,
        overflow: 'hidden',
        padding: '16px',
        gap: '16px',
        background: '#1e1e1e'
      },
      children: [
        this.buildFilterPanel(),
        this.buildVariantsList(filteredVariants),
        this.buildVariantDetails()
      ]
    };
  }

  buildFilterPanel() {
    return {
      type: 'box',
      style: {
        width: '150px',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px'
      },
      children: [
        {
          type: 'heading',
          content: 'Filters',
          level: 3,
          style: {
            margin: '0 0 12px 0',
            fontSize: '12px',
            color: '#e0e0e0',
            textTransform: 'uppercase'
          }
        },
        {
          type: 'button',
          label: this.filterType === 'all' ? '✓ All' : 'All',
          style: {
            padding: '8px 12px',
            background: this.filterType === 'all' ? '#0e639c' : '#3e3e42',
            color: 'white',
            border: 'none',
            borderRadius: '3px',
            cursor: 'pointer',
            fontSize: '11px',
            fontWeight: 600
          },
          onClick: () => this.filterType = 'all'
        },
        {
          type: 'button',
          label: this.filterType === 'theme' ? '✓ Theme' : '🎨 Theme',
          style: {
            padding: '8px 12px',
            background: this.filterType === 'theme' ? '#0e639c' : '#3e3e42',
            color: 'white',
            border: 'none',
            borderRadius: '3px',
            cursor: 'pointer',
            fontSize: '11px',
            fontWeight: 600
          },
          onClick: () => this.filterType = 'theme'
        },
        {
          type: 'button',
          label: this.filterType === 'size' ? '✓ Size' : '📏 Size',
          style: {
            padding: '8px 12px',
            background: this.filterType === 'size' ? '#0e639c' : '#3e3e42',
            color: 'white',
            border: 'none',
            borderRadius: '3px',
            cursor: 'pointer',
            fontSize: '11px',
            fontWeight: 600
          },
          onClick: () => this.filterType = 'size'
        },
        {
          type: 'button',
          label: this.filterType === 'responsive' ? '✓ Responsive' : '📱 Responsive',
          style: {
            padding: '8px 12px',
            background: this.filterType === 'responsive' ? '#0e639c' : '#3e3e42',
            color: 'white',
            border: 'none',
            borderRadius: '3px',
            cursor: 'pointer',
            fontSize: '11px',
            fontWeight: 600
          },
          onClick: () => this.filterType = 'responsive'
        }
      ]
    };
  }

  buildVariantsList(variants) {
    return {
      type: 'box',
      style: {
        flex: 0.4,
        display: 'flex',
        flexDirection: 'column',
        borderRight: '1px solid #3e3e42'
      },
      children: [
        {
          type: 'heading',
          content: `Variants (${variants.length})`,
          level: 3,
          style: {
            margin: '0 0 12px 0',
            fontSize: '13px',
            color: '#e0e0e0'
          }
        },
        {
          type: 'box',
          style: {
            flex: 1,
            overflow: 'y',
            borderRadius: '4px',
            border: '1px solid #3e3e42'
          },
          children: variants.length > 0 ? variants.map(v => ({
            type: 'box',
            style: {
              padding: '10px 12px',
              borderBottom: '1px solid #3e3e42',
              background: this.selectedVariantId === v.id ? '#0e639c' : '#252526',
              cursor: 'pointer',
              fontSize: '12px',
              color: this.selectedVariantId === v.id ? '#fff' : '#d4d4d4',
              userSelect: 'none'
            },
            children: [
              {
                type: 'paragraph',
                content: v.id,
                style: {
                  margin: 0,
                  fontSize: '12px',
                  fontWeight: 600,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }
              },
              {
                type: 'paragraph',
                content: `${v.tags?.join(', ') || 'untagged'} • ${v.usageCount || 0} uses`,
                style: {
                  margin: '4px 0 0 0',
                  fontSize: '10px',
                  color: this.selectedVariantId === v.id ? '#aaa' : '#858585'
                }
              }
            ],
            onClick: () => this.selectedVariantId = v.id
          })) : [
            {
              type: 'paragraph',
              content: 'No variants yet',
              style: {
                margin: 0,
                fontSize: '12px',
                color: '#858585',
                textAlign: 'center',
                padding: '20px'
              }
            }
          ]
        }
      ]
    };
  }

  buildVariantDetails() {
    const variant = this.selectedVariantId ? this.variants.get(this.selectedVariantId) : null;

    return {
      type: 'box',
      style: {
        flex: 0.6,
        display: 'flex',
        flexDirection: 'column'
      },
      children: [
        {
          type: 'heading',
          content: 'Details',
          level: 3,
          style: {
            margin: '0 0 12px 0',
            fontSize: '13px',
            color: '#e0e0e0'
          }
        },
        {
          type: 'box',
          style: {
            flex: 1,
            background: '#2d2d30',
            borderRadius: '4px',
            border: '1px solid #3e3e42',
            padding: '12px',
            overflow: 'y'
          },
          children: variant ? [
            {
              type: 'box',
              style: { marginBottom: '12px' },
              children: [
                {
                  type: 'paragraph',
                  content: 'Variant ID',
                  style: {
                    margin: 0,
                    fontSize: '10px',
                    color: '#858585',
                    fontWeight: 600,
                    marginBottom: '4px'
                  }
                },
                {
                  type: 'paragraph',
                  content: variant.id,
                  style: {
                    margin: 0,
                    fontSize: '12px',
                    color: '#d4d4d4',
                    fontFamily: 'monospace',
                    wordBreak: 'break-all'
                  }
                }
              ]
            },
            {
              type: 'box',
              style: { marginBottom: '12px' },
              children: [
                {
                  type: 'paragraph',
                  content: 'Base Pattern',
                  style: {
                    margin: 0,
                    fontSize: '10px',
                    color: '#858585',
                    fontWeight: 600,
                    marginBottom: '4px'
                  }
                },
                {
                  type: 'paragraph',
                  content: variant.basePatternId,
                  style: {
                    margin: 0,
                    fontSize: '12px',
                    color: '#d4d4d4'
                  }
                }
              ]
            },
            {
              type: 'box',
              style: { marginBottom: '12px' },
              children: [
                {
                  type: 'paragraph',
                  content: 'Tags',
                  style: {
                    margin: 0,
                    fontSize: '10px',
                    color: '#858585',
                    fontWeight: 600,
                    marginBottom: '4px'
                  }
                },
                {
                  type: 'box',
                  style: { display: 'flex', gap: '4px', flexWrap: 'wrap' },
                  children: (variant.tags || []).map(tag => ({
                    type: 'box',
                    style: {
                      padding: '2px 6px',
                      background: '#0e639c',
                      borderRadius: '2px',
                      fontSize: '10px',
                      color: '#fff'
                    },
                    children: [
                      {
                        type: 'paragraph',
                        content: tag,
                        style: { margin: 0 }
                      }
                    ]
                  }))
                }
              ]
            },
            {
              type: 'box',
              style: { marginBottom: '12px' },
              children: [
                {
                  type: 'paragraph',
                  content: 'Usage Count',
                  style: {
                    margin: 0,
                    fontSize: '10px',
                    color: '#858585',
                    fontWeight: 600,
                    marginBottom: '4px'
                  }
                },
                {
                  type: 'paragraph',
                  content: `${variant.usageCount || 0} times`,
                  style: {
                    margin: 0,
                    fontSize: '12px',
                    color: '#d4d4d4'
                  }
                }
              ]
            },
            {
              type: 'box',
              style: { marginBottom: '12px' },
              children: [
                {
                  type: 'paragraph',
                  content: 'Created',
                  style: {
                    margin: 0,
                    fontSize: '10px',
                    color: '#858585',
                    fontWeight: 600,
                    marginBottom: '4px'
                  }
                },
                {
                  type: 'paragraph',
                  content: new Date(variant.addedAt).toLocaleDateString(),
                  style: {
                    margin: 0,
                    fontSize: '12px',
                    color: '#d4d4d4'
                  }
                }
              ]
            },
            {
              type: 'box',
              style: {
                display: 'flex',
                gap: '6px',
                marginTop: '12px'
              },
              children: [
                {
                  type: 'button',
                  label: '📋 Copy JSON',
                  style: {
                    flex: 1,
                    padding: '6px 12px',
                    background: '#0e639c',
                    color: 'white',
                    border: 'none',
                    borderRadius: '3px',
                    cursor: 'pointer',
                    fontSize: '11px',
                    fontWeight: 600
                  },
                  onClick: () => this.copyVariantToClipboard(variant)
                },
                {
                  type: 'button',
                  label: '🗑️ Delete',
                  style: {
                    flex: 1,
                    padding: '6px 12px',
                    background: '#dc3545',
                    color: 'white',
                    border: 'none',
                    borderRadius: '3px',
                    cursor: 'pointer',
                    fontSize: '11px',
                    fontWeight: 600
                  },
                  onClick: () => this.deleteAndRefresh(variant.id)
                }
              ]
            }
          ] : [
            {
              type: 'paragraph',
              content: 'Select a variant to view details',
              style: {
                margin: 0,
                fontSize: '12px',
                color: '#858585',
                textAlign: 'center',
                paddingTop: '20px'
              }
            }
          ]
        }
      ]
    };
  }

  copyVariantToClipboard(variant) {
    const json = JSON.stringify(variant, null, 2);
    if (navigator.clipboard) {
      navigator.clipboard.writeText(json);
      alert('✓ Variant JSON copied to clipboard');
    } else {
      alert('Could not copy to clipboard');
    }
  }

  deleteAndRefresh(variantId) {
    if (confirm('Delete this variant?')) {
      this.deleteVariant(variantId);
      if (this.selectedVariantId === variantId) {
        this.selectedVariantId = null;
      }
    }
  }

  open() {
    this.isOpen = true;
  }

  close() {
    this.isOpen = false;
  }

  render(container) {
    const ui = this.buildUI();
    if (container && typeof renderComponentTree === 'function') {
      renderComponentTree(ui, container);
    }
  }
}

function createPatternVariantManager() {
  return new PatternVariantManager();
}
