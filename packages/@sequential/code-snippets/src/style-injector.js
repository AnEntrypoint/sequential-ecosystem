/**
 * style-injector.js
 *
 * Style injection and management utilities
 */

export function injectSnippetStyles() {
  if (!document.querySelector(`style[data-snippet-css]`)) {
    const style = document.createElement('style');
    style.setAttribute('data-snippet-css', 'true');
    document.head.appendChild(style);
  }
}

export function createStyleElement(cssContent) {
  const style = document.createElement('style');
  style.textContent = cssContent;
  return style;
}

export function appendStyleToHead(cssContent) {
  if (!document.querySelector(`style[data-snippet-css]`)) {
    const style = createStyleElement(cssContent);
    style.setAttribute('data-snippet-css', 'true');
    document.head.appendChild(style);
  }
}
