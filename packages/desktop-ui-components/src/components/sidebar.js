import {h} from 'hyperapp';

export const Sidebar = ({children, width = '300px'}) =>
  h('div', {
    class: 'sidebar',
    style: {width}
  }, children);
