export function createSearchEngine(editor) {
  let matches = [];
  let currentMatchIndex = -1;

  function escapeRegex(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  function findMatches(query) {
    matches = [];
    if (!editor || !query) return matches;

    const code = editor.value;
    const regex = new RegExp(escapeRegex(query), 'gi');
    let match;

    while ((match = regex.exec(code)) !== null) {
      matches.push({
        start: match.index,
        end: match.index + match[0].length,
        text: match[0]
      });
    }

    if (matches.length > 0) {
      currentMatchIndex = 0;
    }

    return matches;
  }

  function getMatches() {
    return matches;
  }

  function getCurrentIndex() {
    return currentMatchIndex;
  }

  function setCurrentIndex(index) {
    currentMatchIndex = Math.max(-1, Math.min(index, matches.length - 1));
  }

  function moveNext() {
    if (matches.length === 0) return -1;
    currentMatchIndex = (currentMatchIndex + 1) % matches.length;
    return currentMatchIndex;
  }

  function movePrev() {
    if (matches.length === 0) return -1;
    currentMatchIndex = (currentMatchIndex - 1 + matches.length) % matches.length;
    return currentMatchIndex;
  }

  function getMatchAt(index) {
    if (index < 0 || index >= matches.length) return null;
    return matches[index];
  }

  function selectMatch(index) {
    if (index < 0 || index >= matches.length || !editor) return;
    const match = matches[index];
    editor.setSelectionRange(match.start, match.end);
    editor.focus();
  }

  function clear() {
    matches = [];
    currentMatchIndex = -1;
  }

  return {
    findMatches,
    getMatches,
    getCurrentIndex,
    setCurrentIndex,
    moveNext,
    movePrev,
    getMatchAt,
    selectMatch,
    clear,
    escapeRegex
  };
}
