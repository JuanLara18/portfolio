#!/usr/bin/env node
/**
 * prune-build.js — drop narration MP3s from build/ when the site streams them
 * from the CDN.
 *
 * CRA copies all of public/ into build/, including public/blog/audio{,-es}/,
 * which holds every narration MP3 (several GB). When AUDIO_BASE_URL_EN and
 * AUDIO_BASE_URL_ES are set, blogData.json points every player at Cloudflare
 * R2 and those local copies are never requested. Shipping them anyway made
 * the GitHub Pages site about ten times larger than it needs to be and pushed
 * each deploy toward the Pages size and time limits.
 *
 * Without the CDN variables (plain local builds), nothing is removed, so a
 * local build still plays audio from disk.
 *
 * Runs as part of `postbuild`, after inject-blog-meta.js.
 */

const fs = require('fs');
const path = require('path');

const BUILD_DIR = path.join(__dirname, '..', 'build');

try {
  const envPath = path.join(__dirname, '..', '.env.local');
  if (fs.existsSync(envPath)) require('dotenv').config({ path: envPath });
} catch (_) {
  // dotenv is optional
}

function removeMp3s(dir) {
  let count = 0;
  let bytes = 0;
  if (!fs.existsSync(dir)) return { count, bytes };
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      const sub = removeMp3s(full);
      count += sub.count;
      bytes += sub.bytes;
    } else if (entry.name.endsWith('.mp3')) {
      bytes += fs.statSync(full).size;
      fs.unlinkSync(full);
      count += 1;
    }
  }
  return { count, bytes };
}

function main() {
  const targets = [
    ['AUDIO_BASE_URL_EN', path.join(BUILD_DIR, 'blog', 'audio')],
    ['AUDIO_BASE_URL_ES', path.join(BUILD_DIR, 'blog', 'audio-es')],
  ];
  for (const [envVar, dir] of targets) {
    if (!process.env[envVar]) {
      console.log(`[skip] ${envVar} not set; keeping local MP3s in ${path.relative(process.cwd(), dir)}`);
      continue;
    }
    const { count, bytes } = removeMp3s(dir);
    console.log(`[OK] pruned ${count} MP3(s), ${(bytes / 1048576).toFixed(0)} MB, from ${path.relative(process.cwd(), dir)} (served from CDN)`);
  }
}

if (require.main === module) main();

module.exports = { main };
