import {h} from 'hyperapp';

export const ListItem = ({children, onclick, active, icon}) =>
  h('div', {
    class: `list-item ${active ? 'active' : ''}`,
    onclick
  }, [
    icon && h('span', {class: 'list-item-icon'}, icon),
    h('span', {class: 'list-item-content'}, children)
  ]);
