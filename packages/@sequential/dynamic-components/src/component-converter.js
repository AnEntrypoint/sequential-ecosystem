// HTML structure to component conversion
export class ComponentConverter {
  constructor(analyzer) {
    this.analyzer = analyzer;
  }

  convertToComponent(structure) {
    if (!structure) return null;

    const component = {
      type: structure.type,
      props: { ...structure.props },
      style: { ...structure.style },
      children: structure.children
        .filter(child => child)
        .map(child => this.convertToComponent(child))
    };

    if (structure.content && !component.children.length) {
      component.content = structure.content;
    }

    return component;
  }

  analyzeAndConvert(htmlString) {
    const analysis = this.analyzer.analyzeHTML(htmlString);
    const component = this.convertToComponent(analysis.structure);
    return { component, analysis };
  }
}
