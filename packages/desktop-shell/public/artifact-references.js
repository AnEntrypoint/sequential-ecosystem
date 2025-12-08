const ArtifactReferences = {
  detectToolUsage(code) {
    const toolMatches = (code.match(/__callHostTool__\(['"]([^'"]+)['"]/g) || [])
      .map(m => m.match(/__callHostTool__\(['"]([^'"]+)['"]/)[1]);
    return [...new Set(toolMatches)];
  },

  detectTaskUsage(code) {
    const taskMatches = (code.match(/__callHostTool__\(['"]task['"]\s*,\s*['"]([^'"]+)['"]/g) || [])
      .map(m => m.match(/__callHostTool__\(['"]task['"]\s*,\s*['"]([^'"]+)['"]/)[1]);
    return [...new Set(taskMatches)];
  },

  detectFlowUsage(code) {
    const flowMatches = (code.match(/__callHostTool__\(['"]flow['"]\s*,\s*['"]([^'"]+)['"]/g) || [])
      .map(m => m.match(/__callHostTool__\(['"]flow['"]\s*,\s*['"]([^'"]+)['"]/)[1]);
    return [...new Set(flowMatches)];
  },

  renderReferencePanel(usesTools = [], usesTasks = [], usesFlows = [], usedBy = []) {
    let html = '<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">';

    html += '<div>';
    html += '<h4 style="color: #4ade80; margin-bottom: 12px; font-size: 13px;">🔗 Uses</h4>';

    if (usesTools.length > 0 || usesTasks.length > 0 || usesFlows.length > 0) {
      html += '<div style="background: #2a2a2a; border: 1px solid #3a3a3a; border-radius: 6px; padding: 12px; max-height: 300px; overflow-y: auto;">';

      if (usesTools.length > 0) {
        html += '<div style="margin-bottom: 12px;">';
        html += '<div style="font-size: 11px; color: #999; text-transform: uppercase; margin-bottom: 6px;">Tools</div>';
        usesTools.forEach(tool => {
          html += `<div style="padding: 6px; background: #1e1e1e; border-radius: 4px; margin-bottom: 6px; cursor: pointer; color: #4ade80; font-size: 12px;">🔧 ${tool}</div>`;
        });
        html += '</div>';
      }

      if (usesTasks.length > 0) {
        html += '<div style="margin-bottom: 12px;">';
        html += '<div style="font-size: 11px; color: #999; text-transform: uppercase; margin-bottom: 6px;">Tasks</div>';
        usesTasks.forEach(task => {
          html += `<div style="padding: 6px; background: #1e1e1e; border-radius: 4px; margin-bottom: 6px; cursor: pointer; color: #4ade80; font-size: 12px;">📋 ${task}</div>`;
        });
        html += '</div>';
      }

      if (usesFlows.length > 0) {
        html += '<div>';
        html += '<div style="font-size: 11px; color: #999; text-transform: uppercase; margin-bottom: 6px;">Flows</div>';
        usesFlows.forEach(flow => {
          html += `<div style="padding: 6px; background: #1e1e1e; border-radius: 4px; margin-bottom: 6px; cursor: pointer; color: #4ade80; font-size: 12px;">🔄 ${flow}</div>`;
        });
        html += '</div>';
      }

      html += '</div>';
    } else {
      html += '<div style="background: #2a2a2a; border: 1px solid #3a3a3a; border-radius: 6px; padding: 12px; color: #999; font-size: 12px;">No dependencies detected</div>';
    }

    html += '</div>';

    html += '<div>';
    html += '<h4 style="color: #4ade80; margin-bottom: 12px; font-size: 13px;">📤 Used By</h4>';
    if (usedBy.length > 0) {
      html += '<div style="background: #2a2a2a; border: 1px solid #3a3a3a; border-radius: 6px; padding: 12px; max-height: 300px; overflow-y: auto;">';
      usedBy.forEach(item => {
        html += `<div style="padding: 6px; background: #1e1e1e; border-radius: 4px; margin-bottom: 6px; cursor: pointer; color: #4a9eff; font-size: 12px;">← ${item}</div>`;
      });
      html += '</div>';
    } else {
      html += '<div style="background: #2a2a2a; border: 1px solid #3a3a3a; border-radius: 6px; padding: 12px; color: #999; font-size: 12px;">Analyzed by server (coming soon)</div>';
    }
    html += '</div>';

    html += '</div>';
    return html;
  }
};
