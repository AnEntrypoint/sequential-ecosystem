// Component pattern - documentation and examples for component patterns
export class ComponentPattern {
  constructor(name, description = '') {
    this.name = name;
    this.description = description;
    this.steps = [];
    this.examples = [];
  }

  addStep(description, code) {
    this.steps.push({ description, code });
    return this;
  }

  addExample(name, props) {
    this.examples.push({ name, props });
    return this;
  }

  getSteps() {
    return this.steps;
  }

  getExamples() {
    return this.examples;
  }

  toJSON() {
    return {
      name: this.name,
      description: this.description,
      steps: this.steps,
      examples: this.examples
    };
  }
}
