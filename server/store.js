import fs from 'fs';
import path from 'path';

const DATA_DIR = process.env.DATA_DIR || path.join(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'store.json');
const BACKUP_FILE = DATA_FILE + '.bak';

function ensureDir() {
  try {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  } catch (e) {
    if (e.code !== 'EEXIST') throw e;
  }
}

function read() {
  for (const file of [DATA_FILE, BACKUP_FILE]) {
    try {
      if (!fs.existsSync(file)) continue;
      const raw = fs.readFileSync(file, 'utf8');
      if (!raw.trim()) continue;
      const parsed = JSON.parse(raw);
      return {
        users: Array.isArray(parsed.users) ? parsed.users : [],
        scans: Array.isArray(parsed.scans) ? parsed.scans : []
      };
    } catch (e) {
      console.error(`Store read error from ${path.basename(file)}:`, e.message);
    }
  }
  return { users: [], scans: [] };
}

let cache = null;
let writeTimer = null;
let writing = false;
let pending = false;

function scheduleWrite() {
  if (writeTimer) {
    pending = true;
    return;
  }
  writeTimer = setTimeout(() => {
    writeTimer = null;
    flush();
  }, 2000);
}

function flush() {
  if (!cache || writing) {
    if (cache) pending = true;
    return;
  }
  writing = true;
  try {
    ensureDir();
    const tmp = DATA_FILE + '.tmp';
    const json = JSON.stringify(cache);
    fs.writeFileSync(tmp, json);
    if (fs.existsSync(DATA_FILE)) {
      try { fs.copyFileSync(DATA_FILE, BACKUP_FILE); } catch {}
    }
    fs.renameSync(tmp, DATA_FILE);
  } catch (e) {
    console.error('Store write error:', e.message);
  } finally {
    writing = false;
    if (pending) {
      pending = false;
      scheduleWrite();
    }
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

process.on('SIGTERM', () => { flush(); process.exit(0); });
process.on('SIGINT', () => { flush(); process.exit(0); });

// Flush pending writes on crash to prevent data loss
process.on('uncaughtException', (err) => {
  console.error('Fatal uncaught exception, flushing store...', err?.message);
  flush();
  process.exit(1);
});
process.on('unhandledRejection', (reason) => {
  console.error('Unhandled rejection, flushing store...', reason?.message || reason);
  flush();
});
