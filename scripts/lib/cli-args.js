#!/usr/bin/env node

/* eslint-disable */

const path = require('path');

function getFlagValue(argv, flagName) {
  const flag = `--${flagName}`;
  const prefix = `${flag}=`;

  const idx = argv.findIndex((a) => a === flag || (typeof a === 'string' && a.startsWith(prefix)));
  if (idx < 0) return null;

  const arg = argv[idx];
  if (typeof arg === 'string' && arg.startsWith(prefix)) {
    const value = arg.slice(prefix.length);
    return value ? value : null;
  }

  const next = argv[idx + 1];
  if (!next || String(next).startsWith('--')) return null;
  return String(next);
}

function getRepeatableFlagValues(argv, flagName) {
  const flag = `--${flagName}`;
  const prefix = `${flag}=`;

  const values = [];
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === flag) {
      const next = argv[i + 1];
      if (next && !String(next).startsWith('--')) {
        values.push(String(next));
        i++;
      }
      continue;
    }
    if (typeof a === 'string' && a.startsWith(prefix)) {
      const v = a.slice(prefix.length);
      if (v) values.push(v);
    }
  }
  return values;
}

function resolveProjectRoot(argv, defaultRoot) {
  const argRoot = getFlagValue(argv, 'projectRoot');
  const envRoot = process.env.GAS_PROJECT_ROOT;
  const base = argRoot || envRoot || defaultRoot || process.cwd();
  return path.resolve(base);
}

module.exports = {
  getFlagValue,
  getRepeatableFlagValues,
  resolveProjectRoot,
};
