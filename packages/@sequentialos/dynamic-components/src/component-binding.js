// Component binding helpers
export class ComponentBinding {
  constructor(dataStore) {
    this.dataStore = dataStore;
  }

  bindComponentToData(componentDef, dataPath) {
    const component = JSON.parse(JSON.stringify(componentDef));

    if (component.type === 'input' || component.type === 'textarea') {
      component.value = this.dataStore.getData(dataPath);
      component.onChange = (e) => {
        this.dataStore.setData(dataPath, e.target.value);
      };
    } else if (component.type === 'select') {
      component.value = this.dataStore.getData(dataPath);
      component.onChange = (e) => {
        this.dataStore.setData(dataPath, e.target.value);
      };
    } else if (component.type === 'checkbox') {
      component.checked = this.dataStore.getData(dataPath);
      component.onChange = (e) => {
        this.dataStore.setData(dataPath, e.target.checked);
      };
    }

    return component;
  }
}
