#!/usr/bin/env node

/* eslint-disable */

function isPlainObject(x) {
  return x !== null && typeof x === 'object' && !Array.isArray(x);
}

function coerceValue(raw) {
  const v = String(raw);
  const t = v.trim();

  if (t === 'true') return true;
  if (t === 'false') return false;
  if (t === 'null') return null;

  // Number (avoid accidental leading-zero coercion like 001)
  if (/^-?(0|[1-9]\d*)(\.\d+)?$/.test(t)) {
    if (t.length > 1 && t[0] === '0' && t[1] !== '.') {
      return v;
    }
    if (t.length > 2 && t.startsWith('-0') && t[2] !== '.') {
      return v;
    }
    const n = Number(t);
    if (Number.isFinite(n)) return n;
  }

  // JSON fragment
  if (
    (t.startsWith('{') && t.endsWith('}')) ||
    (t.startsWith('[') && t.endsWith(']')) ||
    (t.startsWith('"') && t.endsWith('"'))
  ) {
    try {
      return JSON.parse(t);
    } catch {
      // fallthrough to string
    }
  }

  return v;
}

function splitKeyValueStrict(pair) {
  const idx = String(pair).indexOf('=');
  if (idx === -1) {
    throw new Error(`Invalid param: ${pair} (expected k=v)`);
  }
  const key = String(pair).slice(0, idx).trim();
  const value = String(pair).slice(idx + 1);
  if (!key) {
    throw new Error(`Invalid param: ${pair} (empty key)`);
  }
  return { key, value };
}

function parseParamPairs(pairs) {
  const obj = {};
  for (const pair of pairs) {
    const { key, value } = splitKeyValueStrict(pair);
    obj[key] = coerceValue(value);
  }
  return obj;
}

function parseKeyValueString(text) {
  const normalized = String(text)
    .replace(/\s+/g, '&')
    .replace(/[;,]+/g, '&');

  const obj = {};
  const sp = new URLSearchParams(normalized);
  for (const [k, v] of sp.entries()) {
    if (!k) continue;
    obj[k] = coerceValue(v);
  }

  if (Object.keys(obj).length === 0 && String(text).includes('=')) {
    const parts = normalized.split('&').filter(Boolean);
    for (const part of parts) {
      const { key, value } = splitKeyValueStrict(part);
      obj[key] = coerceValue(value);
    }
  }

  if (Object.keys(obj).length === 0) {
    throw new Error('--params must be JSON or key=value pairs');
  }

  return obj;
}

function parseParams(raw) {
  const text = String(raw).trim();
  if (!text) return undefined;

  if (text.startsWith('{') || text.startsWith('[')) {
    try {
      return JSON.parse(text);
    } catch {
      throw new Error('--params must be valid JSON');
    }
  }

  return parseKeyValueString(text);
}

function mergeParams(a, b) {
  if (a === undefined) return b;
  if (b === undefined) return a;

  if (isPlainObject(a) && isPlainObject(b)) {
    return { ...a, ...b };
  }

  return b;
}

module.exports = {
  coerceValue,
  mergeParams,
  parseParams,
  parseParamPairs,
};
