// Generic component definition to DOM renderer
export class ComponentDOMRenderer {
  renderComponent(def, parent) {
    if (!def) return;

    if (typeof def === 'string') {
      parent.textContent = def;
      return;
    }

    if (def.type === 'input') {
      this.renderInput(def, parent);
      return;
    }

    if (def.type === 'button' || def.type === 'paragraph') {
      this.renderButtonOrParagraph(def, parent);
      return;
    }

    if (def.type === 'flex' || def.type === 'box') {
      this.renderFlexOrBox(def, parent);
      return;
    }

    const el = document.createElement('div');
    if (def.style) Object.assign(el.style, def.style);
    if (def.children && Array.isArray(def.children)) {
      def.children.forEach(child => {
        if (child) this.renderComponent(child, el);
      });
    }
    parent.appendChild(el);
  }

  renderInput(def, parent) {
    const input = document.createElement('input');
    input.placeholder = def.placeholder || '';
    if (def.value) input.value = def.value;
    input.type = def.inputType || 'text';
    if (def.style) Object.assign(input.style, def.style);
    if (def.onChange) {
      input.oninput = (e) => def.onChange(e);
    }
    input.focus();
    parent.appendChild(input);
  }

  renderButtonOrParagraph(def, parent) {
    const el = document.createElement(def.type === 'button' ? 'button' : 'p');
    el.textContent = def.label || def.content || '';
    if (def.style) Object.assign(el.style, def.style);
    if (def.onClick) el.onclick = def.onClick;
    parent.appendChild(el);
  }

  renderFlexOrBox(def, parent) {
    const container = document.createElement('div');
    if (def.type === 'flex') {
      container.style.display = 'flex';
      if (def.direction === 'column') {
        container.style.flexDirection = 'column';
      }
    }
    if (def.gap) container.style.gap = def.gap;
    if (def.alignItems) container.style.alignItems = def.alignItems;
    if (def.style) Object.assign(container.style, def.style);

    if (def.children && Array.isArray(def.children)) {
      def.children.forEach(child => {
        if (child) this.renderComponent(child, container);
      });
    }
    parent.appendChild(container);
  }
}
