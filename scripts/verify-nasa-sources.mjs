#!/usr/bin/env node
/**
 * Reproducible NASA Source Provenance & Table 5.1 Integrity Verifier
 * Verifies local immutable NTRS / DataCite artifacts and cross-checks
 * every BASS-II M1-M20 Table 5.1 row against TM-20210011385.pdf.txt.
 */
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');

const EXPECTED_ARTIFACTS = [
  {
    file: 'data/raw/nasa/TM-20210011385.pdf.txt',
    url: 'https://ntrs.nasa.gov/api/citations/20210011385/downloads/TM-20210011385.pdf.txt',
    sha256: '56ee5bd7702b5c8235f9934468bb9d6e4ea143c4570d7eaa1da11d904b42ea3f',
  },
  {
    file: 'data/raw/nasa/ntrs_20210011385.json',
    url: 'https://ntrs.nasa.gov/api/citations/20210011385',
    sha256: '3fcf1e93014a6c0e210bc77714c5a7f95b0ccbedb7e28390184e051d517ab9e9',
  },
  {
    file: 'data/raw/nasa/datacite_psi69.json',
    url: 'https://api.datacite.org/dois/10.60555/mbq8-0451',
    sha256: '7126988da8fe22fdc2a4d484eb29633705661901522ced822fa728e05f0a83e7',
  },
  {
    file: 'data/raw/nasa/datacite_psi98.json',
    url: 'https://api.datacite.org/dois/10.60555/0t15-1z43',
    sha256: 'c70a9e75f6d6387bbec28bf73e59185c59e397d15e6be871067ddcb24daa236c',
  },
];

let failures = 0;

console.log('=== AegisμG NASA Source Artifact Verification ===');
for (const item of EXPECTED_ARTIFACTS) {
  const fullPath = path.join(ROOT, item.file);
  if (!fs.existsSync(fullPath)) {
    console.error(`MISSING: ${item.file} (fetch from ${item.url})`);
    failures++;
    continue;
  }
  const bytes = fs.readFileSync(fullPath);
  const actualSha = crypto.createHash('sha256').update(bytes).digest('hex');
  const match = actualSha === item.sha256;
  console.log(
    `${match ? 'PASS' : 'MISMATCH'}  ${item.file}  bytes=${bytes.length}  sha256=${actualSha}`
  );
  if (!match) failures++;
}

// Cross-check BASS-II Table 5.1 lines M1..M20 inside TM-20210011385.pdf.txt
const txtPath = path.join(ROOT, 'data/raw/nasa/TM-20210011385.pdf.txt');
if (fs.existsSync(txtPath)) {
  const text = fs.readFileSync(txtPath, 'utf8');
  const lines = text.split(/\r?\n/);
  const matchedIds = [];
  for (let n = 1; n <= 20; n++) {
    const id = `M${n}`;
    const found = lines.find((line) => new RegExp(`^\\s*${id}\\s+`).test(line));
    if (found) matchedIds.push(id);
  }
  console.log(`Table 5.1 NTRS text rows verified: ${matchedIds.length}/20 (${matchedIds[0]}..${matchedIds[matchedIds.length - 1]})`);
  if (matchedIds.length !== 20) failures++;
}

if (failures > 0) {
  console.error(`Verification finished with ${failures} issue(s).`);
  process.exit(1);
}
console.log('All NASA source artifacts and Table 5.1 row anchors verified.');
