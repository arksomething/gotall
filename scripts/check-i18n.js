#!/usr/bin/env node
/*
  Simple i18n hygiene check:
  - Extract used keys in code via regex for i18n.t("ns:key")
  - Flatten locale JSON files into "ns:path.to.key" form
  - Fail if: any used key missing in a required locale
  - Fail if: any locale key is unused (minus whitelisted dynamic prefixes)
*/

const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const CODE_DIRS = ['app', 'components', 'utils'];
const LOCALES_DIR = path.join(ROOT, 'locales');
const REQUIRED_LANGS = ['en', 'es'];
const ALLOWED_UNUSED_PREFIXES = [
  'tabs:stretch_names.',
  'tabs:task_names.',
];

function walkFiles(dir, exts, ignoreDirs = ['node_modules', 'android', 'ios', '.git']) {
  const out = [];
  const stack = [dir];
  while (stack.length) {
    const cur = stack.pop();
    const entries = fs.readdirSync(cur, { withFileTypes: true });
    for (const e of entries) {
      if (e.name.startsWith('.')) continue;
      const full = path.join(cur, e.name);
      if (e.isDirectory()) {
        if (ignoreDirs.includes(e.name)) continue;
        stack.push(full);
      } else {
        if (exts.includes(path.extname(e.name))) out.push(full);
      }
    }
  }
  return out;
}

function extractUsedKeys() {
  const files = CODE_DIRS.flatMap((d) => walkFiles(path.join(ROOT, d), ['.ts', '.tsx']));
  const keySet = new Set();
  const keyRegex = /i18n\.t\(\s*(["'`])([^\1\)]+)\1/g; // matches i18n.t("ns:key")
  for (const f of files) {
    try {
      const src = fs.readFileSync(f, 'utf8');
      let m;
      while ((m = keyRegex.exec(src))) {
        const key = m[2].trim();
        if (key) keySet.add(key);
      }
    } catch {}
  }
  return keySet;
}

function flattenObject(obj, prefix = '') {
  const out = {};
  for (const [k, v] of Object.entries(obj || {})) {
    const p = prefix ? `${prefix}.${k}` : k;
    if (v && typeof v === 'object' && !Array.isArray(v)) {
      Object.assign(out, flattenObject(v, p));
    } else {
      out[p] = String(v);
    }
  }
  return out;
}

function loadLocaleKeys() {
  const byLang = {};
  for (const lang of REQUIRED_LANGS) {
    const dir = path.join(LOCALES_DIR, lang);
    const files = fs.existsSync(dir) ? fs.readdirSync(dir) : [];
    const keys = new Set();
    for (const file of files) {
      if (!file.endsWith('.json')) continue;
      const ns = path.basename(file, '.json');
      const full = path.join(dir, file);
      try {
        const json = JSON.parse(fs.readFileSync(full, 'utf8'));
        const flat = flattenObject(json);
        for (const k of Object.keys(flat)) {
          keys.add(`${ns}:${k}`);
        }
      } catch (e) {
        console.error(`[i18n] Failed parsing ${full}:`, e.message);
        process.exitCode = 1;
      }
    }
    byLang[lang] = keys;
  }
  return byLang;
}

function isWhitelisted(key) {
  return ALLOWED_UNUSED_PREFIXES.some((p) => key.startsWith(p));
}

function main() {
  const used = extractUsedKeys();
  const locales = loadLocaleKeys();

  let hasErrors = false;

  // Missing keys per language
  for (const lang of REQUIRED_LANGS) {
    const available = locales[lang] || new Set();
    const missing = [...used].filter((k) => !available.has(k));
    if (missing.length) {
      hasErrors = true;
      console.error(`\n[i18n] Missing keys in '${lang}':`);
      missing.slice(0, 200).forEach((k) => console.error(`  - ${k}`));
      if (missing.length > 200) console.error(`  ...and ${missing.length - 200} more`);
    }
  }

  // Unused keys per language (excluding whitelisted prefixes)
  const usedSet = new Set(used);
  for (const lang of REQUIRED_LANGS) {
    const available = locales[lang] || new Set();
    const unused = [...available].filter((k) => !usedSet.has(k) && !isWhitelisted(k));
    if (unused.length) {
      hasErrors = true;
      console.error(`\n[i18n] Unused keys in '${lang}':`);
      unused.slice(0, 200).forEach((k) => console.error(`  - ${k}`));
      if (unused.length > 200) console.error(`  ...and ${unused.length - 200} more`);
    }
  }

  if (hasErrors) {
    console.error('\n[i18n] Check failed. See missing/unused keys above.');
    process.exit(1);
  } else {
    console.log('[i18n] All good: no missing or unused keys found.');
  }
}

main();


