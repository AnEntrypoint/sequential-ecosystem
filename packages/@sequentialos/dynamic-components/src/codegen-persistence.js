// Code generation persistence and export
export class CodegenPersistence {
  constructor(engine) {
    this.engine = engine;
  }

  exportGeneratedCode() {
    return {
      generatedAt: new Date().toISOString(),
      totalGenerated: this.engine.generatedCode.size,
      code: Array.from(this.engine.generatedCode.entries()).map(([key, value]) => ({
        key,
        format: value.format,
        componentName: value.componentName,
        code: value.code
      }))
    };
  }
}
