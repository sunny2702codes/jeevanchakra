#!/usr/bin/env node
// Extracts rubric->remedy grade mappings AND text index from HDSS kent_full JS files
// Writes:
//   public/data/kent_rubric_grades.json  - { [id]: [[remedyId, grade], ...] }
//   public/data/kent_rubric_texts.json   - [[id, "rubric text", "category"], ...]

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import vm from 'vm';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const KENT_DIR = '/Users/itesmanager/Desktop/Sunny/hdss/data/kent_full/';
const OUT_GRADES = path.join(__dirname, 'public', 'data', 'kent_rubric_grades.json');
const OUT_TEXTS  = path.join(__dirname, 'public', 'data', 'kent_rubric_texts.json');

const files = fs.readdirSync(KENT_DIR).filter(f => f.endsWith('.js')).sort();

const grades = {};
const texts = [];

for (const file of files) {
  const content = fs.readFileSync(path.join(KENT_DIR, file), 'utf8');
  const rubrics = [];
  const sandbox = { window: { KENT_RUBRICS: rubrics } };
  try {
    vm.runInNewContext(content, sandbox);
    for (const r of sandbox.window.KENT_RUBRICS) {
      if (r.id) {
        if (Array.isArray(r.rem) && r.rem.length > 0) {
          grades[r.id] = r.rem;
        }
        texts.push([r.id, r.r ?? '', r.cat ?? '']);
      }
    }
  } catch (e) {
    console.error(`Error processing ${file}:`, e.message);
  }
}

fs.writeFileSync(OUT_GRADES, JSON.stringify(grades));
fs.writeFileSync(OUT_TEXTS, JSON.stringify(texts));

console.log(`Grades: ${Object.keys(grades).length} rubrics -> ${Math.round(fs.statSync(OUT_GRADES).size/1024)}KB`);
console.log(`Texts:  ${texts.length} rubrics -> ${Math.round(fs.statSync(OUT_TEXTS).size/1024)}KB`);
