import {h} from 'hyperapp';

export const Tabs = ({tabs, activeTab, onTabChange}) =>
  h('div', {class: 'tabs'}, tabs.map(tab =>
    h('div', {
      class: `tab ${activeTab === tab.id ? 'active' : ''}`,
      onclick: () => onTabChange(tab.id)
    }, tab.label)
  ));
