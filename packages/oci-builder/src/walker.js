import * as fs from 'fs';
import * as micromatch from 'micromatch';
import * as path from 'path';
import * as walkdir from 'walkdir';

export const walk = async (dir, options, onStat) => {
  const cwd = process.cwd();
  const entryDir = path.resolve(cwd, dir);
  options = options || {};

  if ((options.ignores && options.ignores.length) ||
      (options.ignoreFiles && options.ignoreFiles.length)) {
    const ignoreTree = {};
    const ignoreFiles = options.ignoreFiles || [];
    const ignores = options.ignores || [];
    const ignoreFilesMap = {};
    ignoreFiles.forEach((name) => {
      ignoreFilesMap[name] = 1;
    });

    if (ignores.length) {
      ignoreTree[entryDir] = ignores;
    }

    const applyRules = (dir, files) => {
      const currentDir = dir;
      let i;

      while (dir.lastIndexOf(path.sep) > -1) {
        if (ignoreTree[dir]) {
          files = files.filter((file) => {
            let relativeToRuleSource =
                (currentDir + path.sep + file).replace(dir + path.sep, '');

            if (path.sep !== path.posix.sep) {
              relativeToRuleSource =
                  relativeToRuleSource.split(path.sep).join(path.posix.sep);
            }

            return !micromatch.any(relativeToRuleSource, ignoreTree[dir]);
          });
        }
        i = dir.lastIndexOf(path.sep);
        dir = dir.substr(0, i);
      }

      return files;
    };

    options.filter = (dir, files) => {
      if (!files.length) return [];

      const unread = [];
      if (ignoreFiles.length || ignores.length) {
        files.forEach((name) => {
          if (ignoreFilesMap[name]) {
            unread.push(readIgnore(path.join(dir, name)).then((rules) => {
              if (rules.length) {
                if (!ignoreTree[dir]) {
                  ignoreTree[dir] = rules;
                } else {
                  ignoreTree[dir].push.apply(ignoreTree[dir], rules);
                }
              }
              return true;
            }));
          }
        });
      }

      if (!unread.length) {
        return applyRules(dir, files);
      }

      return Promise.all(unread).then(() => {
        return applyRules(dir, files);
      });
    };
  }
  options.find_links = false;
  return walkdir.async(entryDir, options, onStat);
};

export const readIgnore = (file) => {
  return new Promise((resolve, reject) => {
    fs.readFile(file, (err, buf) => {
      if (err) {
        return reject(err);
      }

      const rules = (buf + '').trim().split(/\r\n|\n|\r/).filter((line) => {
        if (line.trim().length && line.indexOf('#') !== 0) {
          return true;
        }
        return false;
      });
      resolve(rules);
    });
  });
};
