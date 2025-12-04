import {h} from 'hyperapp';

export const Button = ({onclick, children, disabled, variant = 'primary', size = 'md'}) =>
  h('button', {
    class: `btn btn-${variant} btn-${size}`,
    onclick,
    disabled
  }, children);
