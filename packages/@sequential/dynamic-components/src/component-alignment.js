// Component alignment and distribution
export class ComponentAlignment {
  constructor(componentManager) {
    this.componentManager = componentManager;
  }

  alignComponents(componentIds, direction) {
    const components = componentIds.map(id => this.componentManager.components.get(id)).filter(Boolean);
    if (components.length < 2) return false;

    const positions = components.map(c => c.position);

    switch (direction) {
      case 'left':
        const minX = Math.min(...positions.map(p => p.x));
        components.forEach(c => c.position.x = minX);
        break;
      case 'right':
        const maxX = Math.max(...positions.map(p => p.x));
        components.forEach(c => c.position.x = maxX);
        break;
      case 'top':
        const minY = Math.min(...positions.map(p => p.y));
        components.forEach(c => c.position.y = minY);
        break;
      case 'bottom':
        const maxY = Math.max(...positions.map(p => p.y));
        components.forEach(c => c.position.y = maxY);
        break;
      case 'center-h':
        const centerX = (Math.max(...positions.map(p => p.x)) + Math.min(...positions.map(p => p.x))) / 2;
        components.forEach(c => c.position.x = centerX - c.size.width / 2);
        break;
      case 'center-v':
        const centerY = (Math.max(...positions.map(p => p.y)) + Math.min(...positions.map(p => p.y))) / 2;
        components.forEach(c => c.position.y = centerY - c.size.height / 2);
        break;
      case 'space-h':
        this.distributeComponentsHorizontally(components);
        break;
      case 'space-v':
        this.distributeComponentsVertically(components);
        break;
    }

    return true;
  }

  distributeComponentsHorizontally(components) {
    const sorted = [...components].sort((a, b) => a.position.x - b.position.x);
    const minX = sorted[0].position.x;
    const maxX = sorted[sorted.length - 1].position.x;
    const gap = (maxX - minX) / (sorted.length - 1);

    sorted.forEach((c, idx) => {
      c.position.x = minX + gap * idx;
    });
  }

  distributeComponentsVertically(components) {
    const sorted = [...components].sort((a, b) => a.position.y - b.position.y);
    const minY = sorted[0].position.y;
    const maxY = sorted[sorted.length - 1].position.y;
    const gap = (maxY - minY) / (sorted.length - 1);

    sorted.forEach((c, idx) => {
      c.position.y = minY + gap * idx;
    });
  }
}
