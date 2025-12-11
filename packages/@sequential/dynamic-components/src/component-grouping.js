// Component grouping functionality
export class ComponentGrouping {
  constructor(componentManager) {
    this.componentManager = componentManager;
  }

  groupComponents(componentIds) {
    const components = componentIds.map(id => this.componentManager.components.get(id)).filter(Boolean);
    if (components.length < 2) return null;

    const minX = Math.min(...components.map(c => c.position.x));
    const minY = Math.min(...components.map(c => c.position.y));
    const maxX = Math.max(...components.map(c => c.position.x + c.size.width));
    const maxY = Math.max(...components.map(c => c.position.y + c.size.height));

    const group = {
      id: `group-${Date.now()}`,
      type: 'group',
      position: { x: minX, y: minY },
      size: { width: maxX - minX, height: maxY - minY },
      children: componentIds,
      locked: false
    };

    this.componentManager.components.set(group.id, group);
    return group;
  }
}
