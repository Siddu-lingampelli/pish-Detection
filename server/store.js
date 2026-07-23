import fs from 'fs';
import path from 'path';

const DATA_DIR = process.env.DATA_DIR || path.join(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'store.json');

function ensureDir() {
  try {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  } catch (e) {
    if (e.code !== 'EEXIST') throw e;
  }
}

function read() {
  try {
    if (!fs.existsSync(DATA_FILE)) return { users: [], scans: [] };
    const raw = fs.readFileSync(DATA_FILE, 'utf8');
    const parsed = JSON.parse(raw);
    return {
      users: Array.isArray(parsed.users) ? parsed.users : [],
      scans: Array.isArray(parsed.scans) ? parsed.scans : []
    };
  } catch (e) {
    console.error('Store read error:', e.message);
    return { users: [], scans: [] };
  }
}

let cache = null;
let writeTimer = null;

function scheduleWrite() {
  if (writeTimer) return;
  writeTimer = setTimeout(() => {
    writeTimer = null;
    flush();
  }, 2000);
}

function flush() {
  if (!cache) return;
  try {
    ensureDir();
    const tmp = DATA_FILE + '.tmp';
    fs.writeFileSync(tmp, JSON.stringify(cache));
    fs.renameSync(tmp, DATA_FILE);
  } catch (e) {
    console.error('Store write error:', e.message);
  }
}

export function loadStore() {
  cache = read();
  return cache;
}

export function getUsers() {
  if (!cache) cache = read();
  return cache.users;
}

export function getScans() {
  if (!cache) cache = read();
  return cache.scans;
}

export function addUser(user) {
  if (!cache) cache = read();
  cache.users.push(user);
  scheduleWrite();
}

export function findUserByEmail(email) {
  if (!cache) cache = read();
  return cache.users.find(u => u.email === email) || null;
}

export function findUserById(id) {
  if (!cache) cache = read();
  return cache.users.find(u => u._id === id) || null;
}

export function addScan(scan) {
  if (!cache) cache = read();
  cache.scans.unshift(scan);
  if (cache.scans.length > 1000) cache.scans.length = 1000;
  scheduleWrite();
}

export function clearScans() {
  if (!cache) cache = read();
  const count = cache.scans.length;
  cache.scans = [];
  scheduleWrite();
  return count;
}

export function deleteScanById(id) {
  if (!cache) cache = read();
  const idx = cache.scans.findIndex(s => s._id === id);
  if (idx === -1) return null;
  const [deleted] = cache.scans.splice(idx, 1);
  scheduleWrite();
  return deleted;
}

process.on('SIGTERM', flush);
process.on('SIGINT', flush);
process.on('beforeExit', flush);
