/**
 * cli-commands.js - Sequential Machine CLI command handlers
 *
 * Command implementations for run, exec, batch, history, status, diff, etc.
 */

import fs from 'fs';
import logger from '@sequentialos/sequential-logging';

export function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export function createCommandHandler(kit, args) {
  return async function handleCommand() {
    const cmd = args[0];

    switch (cmd) {
      case 'run': {
        const instruction = args.slice(1).join(' ');
        if (!instruction) throw new Error('Usage: sequential-machine run <command>');
        const r = await kit.run(instruction);
        const status = r.cached ? 'cached' : r.empty ? 'empty' : 'new';
        logger.info(`${r.short} [${status}]`);
        break;
      }

      case 'exec': {
        const instruction = args.slice(1).join(' ');
        if (!instruction) throw new Error('Usage: sequential-machine exec <command>');
        await kit.exec(instruction);
        break;
      }

      case 'batch': {
        const file = args[1];
        if (!file) throw new Error('Usage: sequential-machine batch <file.json>');
        const instructions = JSON.parse(fs.readFileSync(file, 'utf8'));
        const results = await kit.batch(instructions);
        for (const r of results) {
          const status = r.cached ? 'cached' : r.empty ? 'empty' : 'new';
          logger.info(`${r.short} [${status}]`);
        }
        break;
      }

      case 'history': {
        const history = kit.history();
        if (history.length === 0) return logger.info('(empty)');
        for (const l of history) {
          const parent = l.parentShort ? ` <- ${l.parentShort}` : '';
          logger.info(`${l.short}${parent}  ${l.instruction}`);
        }
        break;
      }

      case 'status': {
        const s = await kit.status();
        if (s.clean) return logger.info('clean');
        for (const f of s.added) logger.info(`+ ${f}`);
        for (const f of s.modified) logger.info(`~ ${f}`);
        for (const f of s.deleted) logger.info(`- ${f}`);
        break;
      }

      case 'diff': {
        const from = args[1];
        const to = args[2];
        const d = await kit.diff(from, to);
        if (d.added.length === 0 && d.modified.length === 0 && d.deleted.length === 0) {
          return logger.info('(no changes)');
        }
        for (const f of d.added) logger.info(`+ ${f}`);
        for (const f of d.modified) logger.info(`~ ${f}`);
        for (const f of d.deleted) logger.info(`- ${f}`);
        break;
      }

      case 'checkout': {
        const ref = args[1];
        if (!ref) throw new Error('Usage: sequential-machine checkout <ref>');
        await kit.checkout(ref);
        logger.info(`checked out ${kit.head().slice(0, 12)}`);
        break;
      }

      case 'tag': {
        const name = args[1];
        const ref = args[2];
        if (!name) throw new Error('Usage: sequential-machine tag <name> [ref]');
        kit.tag(name, ref);
        logger.info(`tagged ${name} -> ${kit._resolve(name).slice(0, 12)}`);
        break;
      }

      case 'tags': {
        const tags = kit.tags();
        const entries = Object.entries(tags);
        if (entries.length === 0) return logger.info('(no tags)');
        for (const [name, hash] of entries) {
          logger.info(`${name} -> ${hash.slice(0, 12)}`);
        }
        break;
      }

      case 'inspect': {
        const ref = args[1];
        if (!ref) throw new Error('Usage: sequential-machine inspect <ref>');
        const info = kit.inspect(ref);
        logger.info(`hash:        ${info.hash}`);
        logger.info(`instruction: ${info.instruction}`);
        logger.info(`parent:      ${info.parent || '(none)'}`);
        logger.info(`time:        ${info.time.toISOString()}`);
        logger.info(`size:        ${formatBytes(info.size)}`);
        break;
      }

      case 'rebuild': {
        const count = await kit.rebuild();
        logger.info(`rebuilt ${count} layers`);
        break;
      }

      case 'reset': {
        await kit.reset();
        logger.info('reset');
        break;
      }

      case 'head': {
        const head = kit.head();
        logger.info(head ? head.slice(0, 12) : '(empty)');
        break;
      }

      default:
        return false;
    }
    return true;
  };
}
