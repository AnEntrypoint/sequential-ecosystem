#!/usr/bin/env node

/**
 * Naming Convention Analysis Tool for P2.5
 * Identifies inconsistent variable, function, and class naming patterns
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

class NamingAnalyzer {
  constructor(rootDir) {
    this.rootDir = rootDir;
    this.issues = [];
    this.patterns = {
      abbreviations: new Map(),
      casing: new Map(),
      prefixes: new Map(),
      naming: new Map(),
    };
    this.filesProcessed = 0;
  }

  async analyze() {
    console.log('🔍 Starting naming convention analysis...\n');

    const packageDirs = path.join(this.rootDir, 'packages');
    const packages = fs.readdirSync(packageDirs).filter(f => {
      return fs.statSync(path.join(packageDirs, f)).isDirectory();
    });

    for (const pkg of packages) {
      await this._analyzePackage(path.join(packageDirs, pkg));
    }

    this._reportFindings();
  }

  async _analyzePackage(pkgDir) {
    const files = this._getJsFiles(pkgDir);

    for (const file of files) {
      try {
        const content = fs.readFileSync(file, 'utf8');
        this._analyzeContent(content, file);
        this.filesProcessed++;
      } catch (err) {
        // Silently skip unreadable files
      }
    }
  }

  _getJsFiles(dir, extension = '.js') {
    let files = [];
    try {
      const entries = fs.readdirSync(dir, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory() && !entry.name.startsWith('.')) {
          files = files.concat(this._getJsFiles(fullPath, extension));
        } else if (entry.isFile() && entry.name.endsWith(extension)) {
          files.push(fullPath);
        }
      }
    } catch (err) {
      // Skip inaccessible directories
    }
    return files;
  }

  _analyzeContent(content, file) {
    // Extract variable/function names
    const varMatches = content.matchAll(/(?:const|let|var)\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/g);
    const funcMatches = content.matchAll(/function\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/g);
    const classMatches = content.matchAll(/class\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/g);
    const methodMatches = content.matchAll(/\s([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\(/g);
    const paramMatches = content.matchAll(/\(([^)]*)\)/g);

    for (const match of varMatches) {
      this._analyzeIdentifier(match[1], 'variable');
    }

    for (const match of funcMatches) {
      this._analyzeIdentifier(match[1], 'function');
    }

    for (const match of classMatches) {
      this._analyzeIdentifier(match[1], 'class');
    }

    for (const match of methodMatches) {
      this._analyzeIdentifier(match[1], 'method');
    }

    for (const match of paramMatches) {
      const params = match[1].split(',');
      for (const param of params) {
        const name = param.trim().split('=')[0].split(':')[0].trim();
        if (name && /^[a-zA-Z_$]/.test(name)) {
          this._analyzeIdentifier(name, 'parameter');
        }
      }
    }
  }

  _analyzeIdentifier(name, type) {
    // Detect naming patterns
    if (name.includes('_')) {
      this._recordPattern('casing', name, `snake_case in ${type}`);
    }

    if (name.includes('-')) {
      this._recordPattern('casing', name, `kebab-case in ${type}`);
    }

    // Detect abbreviations
    const abbrevPatterns = {
      'cfg': 'config',
      'config': 'configuration',
      'opts': 'options',
      'opt': 'option',
      'req': 'request',
      'res': 'response',
      'msg': 'message',
      'err': 'error',
      'num': 'number',
      'str': 'string',
      'val': 'value',
      'arr': 'array',
      'obj': 'object',
      'fn': 'function',
      'cb': 'callback',
      'ctx': 'context',
      'params': 'parameters',
      'args': 'arguments',
      'repo': 'repository',
      'db': 'database',
      'temp': 'temporary',
      'tmp': 'temporary',
      'var': 'variable',
      'prop': 'property',
      'attr': 'attribute',
      'desc': 'description',
      'info': 'information',
      'ref': 'reference',
      'ptr': 'pointer',
      'addr': 'address',
      'id': 'identifier',
      'idx': 'index',
      'max': 'maximum',
      'min': 'minimum',
      'init': 'initialize',
      'spec': 'specification',
      'impl': 'implementation',
      'util': 'utility',
      'lib': 'library',
      'pkg': 'package',
    };

    for (const [abbrev, fullForm] of Object.entries(abbrevPatterns)) {
      if (name.toLowerCase().includes(abbrev)) {
        this._recordPattern('abbreviations', name, `uses "${abbrev}" instead of "${fullForm}"`);
      }
    }

    // Detect redundant prefixes
    if (name.startsWith('get') && type === 'method') {
      this._recordPattern('prefixes', name, 'getter prefix in method');
    }

    if (name.startsWith('set') && type === 'method') {
      this._recordPattern('prefixes', name, 'setter prefix in method');
    }

    if (name.match(/^(Task|Flow|Run|App|File)/) && type === 'method') {
      const prefix = name.match(/^(Task|Flow|Run|App|File)/)[1];
      this._recordPattern('prefixes', name, `redundant "${prefix}" prefix in method`);
    }
  }

  _recordPattern(category, name, description) {
    if (!this.patterns[category].has(name)) {
      this.patterns[category].set(name, []);
    }
    this.patterns[category].get(name).push(description);
  }

  _reportFindings() {
    console.log(`\n📊 NAMING CONVENTION ANALYSIS REPORT\n`);
    console.log(`Files Analyzed: ${this.filesProcessed}\n`);

    console.log('🔤 CASING INCONSISTENCIES (snake_case/kebab-case found):');
    const casingIssues = Array.from(this.patterns.casing.entries()).slice(0, 20);
    if (casingIssues.length > 0) {
      casingIssues.forEach(([name, issues]) => {
        console.log(`  • ${name}`);
      });
      if (this.patterns.casing.size > 20) {
        console.log(`  ... and ${this.patterns.casing.size - 20} more`);
      }
    } else {
      console.log('  ✓ No casing inconsistencies found');
    }

    console.log('\n🔤 ABBREVIATION ISSUES (common abbreviations found):');
    const abbrevIssues = Array.from(this.patterns.abbreviations.entries()).slice(0, 20);
    if (abbrevIssues.length > 0) {
      abbrevIssues.forEach(([name, issues]) => {
        console.log(`  • ${name} (${issues[0]})`);
      });
      if (this.patterns.abbreviations.size > 20) {
        console.log(`  ... and ${this.patterns.abbreviations.size - 20} more`);
      }
    } else {
      console.log('  ✓ All identifiers use full words (no abbreviations)');
    }

    console.log('\n🔤 PREFIX REDUNDANCY (redundant class/method prefixes):');
    const prefixIssues = Array.from(this.patterns.prefixes.entries()).slice(0, 20);
    if (prefixIssues.length > 0) {
      prefixIssues.forEach(([name, issues]) => {
        console.log(`  • ${name}`);
      });
      if (this.patterns.prefixes.size > 20) {
        console.log(`  ... and ${this.patterns.prefixes.size - 20} more`);
      }
    } else {
      console.log('  ✓ No redundant prefixes detected');
    }

    console.log('\n📈 SUMMARY:');
    console.log(`  Casing Issues: ${this.patterns.casing.size}`);
    console.log(`  Abbreviation Issues: ${this.patterns.abbreviations.size}`);
    console.log(`  Prefix Issues: ${this.patterns.prefixes.size}`);
    console.log(`  Total Patterns: ${this.patterns.casing.size + this.patterns.abbreviations.size + this.patterns.prefixes.size}`);

    console.log('\n✅ Analysis complete');
  }
}

const analyzer = new NamingAnalyzer(path.join(__dirname, '..'));
await analyzer.analyze();
