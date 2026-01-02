export const pending = () => {
  const active = {};
  let inc = 0;
  return {
    active: () => {
      return Object.values(active);
    },
    track: (p) => {
      if (inc + 1 === inc) inc = -1;
      active[inc++] = p;
      const _inc = inc;
      if (p.finally) {
        p.finally(() => {
          delete active[_inc];
        });
        return p;
      }

      let resolve, reject;
      const proxy = new Promise((res, rej) => {
        resolve = res;
        reject = rej;
      });

      p.then((value) => {
         delete active[_inc];
         resolve(value);
       }).catch((e) => {
        delete active[_inc];
        reject(e);
      });
      return proxy;
    }
  };
};
