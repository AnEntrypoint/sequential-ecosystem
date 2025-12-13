export {
  nowISO,
  nowUnix,
  createTimestamps,
  updateTimestamp,
  isoToUnix,
  unixToISO,
  formatDuration,
  timeAgo,
  isExpired,
  isWithinWindow,
  addMs,
  subtractMs,
  getStartOfDay,
  getEndOfDay
} from '@sequentialos/timestamp-utilities';

export { parseISO };

function parseISO(isoString) {
  if (!isoString) return null;
  try {
    return new Date(isoString);
  } catch {
    return null;
  }
}
