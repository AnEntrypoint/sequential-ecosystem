import {h} from 'hyperapp';

export const FormGroup = ({label, children}) =>
  h('div', {class: 'form-group'}, [
    label && h('label', {class: 'form-label'}, label),
    children
  ]);
