export class Container {
  constructor() { this.services = new Map(); }
  register(name, factory) { this.services.set(name, factory); }
  get(name) { 
    const factory = this.services.get(name);
    if (!factory) throw new Error(`Service not found: ${name}`);
    return factory(this);
  }
}
export function createContainer() { return new Container(); }
export default { Container, createContainer };
