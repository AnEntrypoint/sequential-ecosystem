export function nowISO() { return new Date().toISOString(); }
export function nowUnix() { return Math.floor(Date.now() / 1000); }
export function formatDate(date) { return new Date(date).toISOString().split('T')[0]; }
export function createTimestamps() {
  return {
    created: nowISO(),
    modified: nowISO(),
    accessed: nowISO()
  };
}
export function updateTimestamp(timestamps) {
  return {
    ...timestamps,
    modified: nowISO(),
    accessed: nowISO()
  };
}
export default { nowISO, nowUnix, formatDate, createTimestamps, updateTimestamp };
