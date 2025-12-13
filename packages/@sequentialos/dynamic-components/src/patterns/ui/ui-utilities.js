// UI builder utility functions
export function toLabel(name) {
  return name.replace(/([A-Z])/g, ' $1').trim().charAt(0).toUpperCase() + name.replace(/([A-Z])/g, ' $1').trim().slice(1);
}
