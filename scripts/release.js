#!/usr/bin/env node
/*
 Automates production builds:
 - run tests
 - verify version bumps vs HEAD (Android versionCode, iOS buildNumber, app.json version)
 - commit and push
 - run EAS build with production profile for the selected platform
 Usage:
   node scripts/release.js --platform android
   node scripts/release.js --platform ios
   node scripts/release.js --platform both
*/

const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

function run(command, args, opts = {}) {
  const res = spawnSync(command, args, { stdio: 'inherit', shell: true, ...opts });
  if (res.status !== 0) {
    process.exit(res.status || 1);
  }
}

function runCapture(command) {
  const res = spawnSync(command, { stdio: 'pipe', shell: true, encoding: 'utf8' });
  if (res.status !== 0) return null;
  return res.stdout.trim();
}

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function readFileSafe(file) {
  return fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : '';
}

function readFromHead(file) {
  const res = spawnSync(`git show HEAD:${file}`, { stdio: 'pipe', shell: true, encoding: 'utf8' });
  if (res.status !== 0) return null; // probably first commit or file moved
  return res.stdout;
}

function parseGradleVersionCode(gradleText) {
  const match = gradleText.match(/\bversionCode\s+(\d+)/);
  return match ? parseInt(match[1], 10) : null;
}

function parseGradleVersionName(gradleText) {
  const match = gradleText.match(/\bversionName\s+"([^"]+)"/);
  return match ? match[1] : null;
}

function getArg(name, def) {
  const idx = process.argv.findIndex(a => a === `--${name}`);
  if (idx !== -1 && process.argv[idx + 1]) return process.argv[idx + 1];
  const kv = process.argv.find(a => a.startsWith(`--${name}=`));
  if (kv) return kv.split('=')[1];
  return def;
}

const platform = (getArg('platform', 'android') || '').toLowerCase();
if (!['android', 'ios', 'both'].includes(platform)) {
  console.error(`Unknown platform: ${platform}. Use --platform android|ios|both`);
  process.exit(1);
}

// 1) Ensure git working tree clean
const status = runCapture('git status --porcelain');
if (status && status.length > 0) {
  console.error('Uncommitted changes present. Commit or stash before releasing.');
  process.exit(1);
}

// 2) Run tests
run('npm', ['test']);

// 3) Version checks
const appJsonPath = path.join(process.cwd(), 'app.json');
const gradlePath = path.join(process.cwd(), 'android/app/build.gradle');

const appJson = readJson(appJsonPath);
const gradle = readFileSafe(gradlePath);

const currentVersionName = appJson.expo?.version || null;
const currentIosBuild = appJson.expo?.ios?.buildNumber || null;
const currentAndroidCode = parseGradleVersionCode(gradle);
const currentAndroidName = parseGradleVersionName(gradle);

const prevAppJsonText = readFromHead('app.json');
const prevGradleText = readFromHead('android/app/build.gradle');

let prevVersionName = null, prevIosBuild = null, prevAndroidCode = null, prevAndroidName = null;
if (prevAppJsonText) {
  try {
    const prevApp = JSON.parse(prevAppJsonText);
    prevVersionName = prevApp.expo?.version || null;
    prevIosBuild = prevApp.expo?.ios?.buildNumber || null;
  } catch {}
}
if (prevGradleText) {
  prevAndroidCode = parseGradleVersionCode(prevGradleText);
  prevAndroidName = parseGradleVersionName(prevGradleText);
}

function ensureBumped(current, previous, label, comparator = (a, b) => a !== b) {
  if (previous == null) return; // nothing to compare
  if (!comparator(current, previous)) {
    console.error(`\n${label} not bumped. Previous: ${previous}, Current: ${current}`);
    console.error('Please bump versions (android/app/build.gradle and app.json) then retry.');
    process.exit(1);
  }
}

// Compare: app.json version changed, Android versionCode increased, iOS buildNumber changed
ensureBumped(currentVersionName, prevVersionName, 'app.json expo.version');
if (platform === 'android' || platform === 'both') {
  ensureBumped(currentAndroidCode, prevAndroidCode, 'Android versionCode', (a, b) => Number(a) > Number(b));
}
if (platform === 'ios' || platform === 'both') {
  ensureBumped(currentIosBuild, prevIosBuild, 'iOS buildNumber');
}

// 4) Commit & push
const commitMsg = `release: v${currentVersionName}` +
  (currentAndroidCode != null ? ` androidCode=${currentAndroidCode}` : '') +
  (currentIosBuild != null ? ` iosBuild=${currentIosBuild}` : '') +
  (currentAndroidName ? ` androidName=${currentAndroidName}` : '');

run('git', ['add', '-A']);
run('git', ['commit', '-m', commitMsg]);
run('git', ['push']);

// 5) Trigger EAS build(s)
function buildPlat(p) {
  run('eas', ['build', '--platform', p, '--profile', 'production']);
}

if (platform === 'both') {
  buildPlat('android');
  buildPlat('ios');
} else {
  buildPlat(platform);
}

console.log('\nRelease started successfully. Watch EAS dashboard for progress.');


