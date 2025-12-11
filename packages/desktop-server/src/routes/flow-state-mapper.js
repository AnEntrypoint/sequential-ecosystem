/**
 * flow-state-mapper.js
 *
 * Map state connections and complexity
 */

export function createFlowStateMapper(states) {
  return {
    map() {
      return states.reduce((acc, s) => {
        const inbound = states.filter(st => {
          const nexts = [];
          if (st.onDone) nexts.push(st.onDone);
          if (st.onTrue) nexts.push(st.onTrue);
          if (st.onFalse) nexts.push(st.onFalse);
          if (st.cases) nexts.push(...Object.values(st.cases));
          if (st.default) nexts.push(st.default);
          if (st.branches) nexts.push(...st.branches);
          return nexts.includes(s.id);
        }).map(st => st.id);

        const outbound = [];
        if (s.onDone) outbound.push(s.onDone);
        if (s.onTrue) outbound.push(s.onTrue);
        if (s.onFalse) outbound.push(s.onFalse);
        if (s.cases) outbound.push(...Object.values(s.cases));
        if (s.default) outbound.push(s.default);
        if (s.branches) outbound.push(...s.branches);

        acc[s.id] = {
          type: s.type || 'task',
          inbound: inbound.filter(Boolean),
          outbound: outbound.filter(Boolean),
          complexity: s.type === 'parallel' ? s.branches?.length || 0 : (s.cases ? Object.keys(s.cases).length : 1)
        };
        return acc;
      }, {});
    }
  };
}
