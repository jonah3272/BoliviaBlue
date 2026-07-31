import fs from 'fs';
import path from 'path';

const root = 'frontend/src';

/** Only remove competitor-spam phrases — never generic punctuation cleanup. */
const replacements = [
  [/,\s*mejor que bolivianblue\.net/gi, ''],
  [/,\s*better than bolivianblue\.net/gi, ''],
  [/\.\s*Mejor que bolivianblue\.net\./g, '.'],
  [/\.\s*Better than bolivianblue\.net\./g, '.'],
  [/ Mejor que bolivianblue\.net\./g, '.'],
  [/ Better than bolivianblue\.net\./g, '.'],
  [/\s*\|\s*Mejor que bolivianblue\.net/g, ''],
  [/\s*\|\s*Better than bolivianblue\.net/g, ''],
  [/,\s*mejor que bolivianblue(?!\.net)\b/gi, ''],
  [/,\s*better than bolivianblue(?!\.net)\b/gi, ''],
  [/\s*Faster than bolivianblue\.net/gi, ''],
  [/\s*Más rápido que bolivianblue\.net/gi, ''],
];

function walk(dir, files = []) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) walk(p, files);
    else if (/\.(jsx|js)$/.test(ent.name)) files.push(p);
  }
  return files;
}

const changed = [];
for (const file of walk(root)) {
  const unix = file.replace(/\\/g, '/');
  if (unix.endsWith('pages/Comparison.jsx')) continue;
  let text = fs.readFileSync(file, 'utf8');
  const orig = text;
  for (const [re, to] of replacements) text = text.replace(re, to);
  if (text !== orig) {
    fs.writeFileSync(file, text);
    changed.push(unix);
  }
}
console.log('Changed', changed.length, 'files:');
changed.forEach((f) => console.log(' -', f));
