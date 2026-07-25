// Local-only auth + history. No server persistence, no JWT round-trip.
// All user data, sessions, and scan history live in the browser.

const USERS_KEY = 'pg.users';
const SESSION_KEY = 'pg.session';
const HISTORY_KEY = 'pg.history';
const PREFS_KEY = 'pg.prefs';
const ANALYTICS_KEY = 'pg.analytics';

const safeParse = (s, fallback) => {
  try { return s ? JSON.parse(s) : fallback; } catch { return fallback; }
};

const readUsers = () => safeParse(localStorage.getItem(USERS_KEY), []);
const writeUsers = (users) => localStorage.setItem(USERS_KEY, JSON.stringify(users));

const readSession = () => safeParse(localStorage.getItem(SESSION_KEY), null);
const writeSession = (s) => s ? localStorage.setItem(SESSION_KEY, JSON.stringify(s)) : localStorage.removeItem(SESSION_KEY);

const readHistory = () => safeParse(localStorage.getItem(HISTORY_KEY), []);
const writeHistory = (h) => localStorage.setItem(HISTORY_KEY, JSON.stringify(h));

const readAnalytics = () => safeParse(localStorage.getItem(ANALYTICS_KEY), { totalScans: 0, counts: { legit: 0, suspicious: 0, phishing: 0 } });
const writeAnalytics = (a) => localStorage.setItem(ANALYTICS_KEY, JSON.stringify(a));

const simpleHash = async (text) => {
  const buf = new TextEncoder().encode(text);
  const hash = await crypto.subtle.digest('SHA-256', buf);
  return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('');
};

const newId = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 10);
const newToken = () => newId() + '.' + Math.random().toString(36).slice(2, 18);

export const setAuth = (token, user) => writeSession({ token, user, since: Date.now() });
export const clearAuth = () => writeSession(null);
export const getToken = () => readSession()?.token || null;
export const getUser = () => readSession()?.user || null;

export const registerLocal = async ({ name, email, password }) => {
  if (typeof name !== 'string' || typeof email !== 'string' || typeof password !== 'string') {
    throw new Error('Invalid input');
  }
  const cleanName = name.trim();
  const cleanEmail = email.trim().toLowerCase();
  if (!cleanName || !cleanEmail || !password) throw new Error('All fields required');
  if (cleanName.length > 100) throw new Error('Name too long');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) throw new Error('Invalid email format');
  if (password.length < 8) throw new Error('Password must be at least 8 characters');
  if (password.length > 200) throw new Error('Password too long');

  const users = readUsers();
  if (users.find(u => u.email === cleanEmail)) throw new Error('Email already registered');

  const user = {
    _id: newId(),
    name: cleanName,
    email: cleanEmail,
    passwordHash: await simpleHash(password),
    createdAt: new Date().toISOString()
  };
  users.push(user);
  writeUsers(users);
  const token = newToken();
  const safe = { id: user._id, name: user.name, email: user.email };
  setAuth(token, safe);
  return { token, user: safe };
};

export const loginLocal = async ({ email, password }) => {
  if (typeof email !== 'string' || typeof password !== 'string') throw new Error('Email and password required');
  const cleanEmail = email.trim().toLowerCase();
  const users = readUsers();
  const user = users.find(u => u.email === cleanEmail);
  const hash = await simpleHash(password);
  if (!user || user.passwordHash !== hash) throw new Error('Invalid credentials');
  const token = newToken();
  const safe = { id: user._id, name: user.name, email: user.email };
  setAuth(token, safe);
  return { token, user: safe };
};

export const getMe = async () => {
  const s = readSession();
  if (!s) throw new Error('Not authenticated');
  return { success: true, user: s.user };
};

export const saveScan = (record) => {
  const list = readHistory();
  list.unshift({ ...record, _id: record._id || newId(), userId: readSession()?.user?.id, created_at: record.created_at || new Date().toISOString() });
  if (list.length > 1000) list.length = 1000;
  writeHistory(list);
  bumpAnalytics(record.result);
};

export const getLocalHistory = ({ result, limit = 50, page = 1 } = {}) => {
  let list = readHistory();
  if (readSession()?.user?.id) {
    const uid = readSession().user.id;
    list = list.filter(s => s.userId === uid || !s.userId);
  }
  if (result && ['Legit', 'Suspicious', 'Phishing'].includes(result)) {
    list = list.filter(s => s.result === result);
  }
  const total = list.length;
  const paged = list.slice((page - 1) * limit, page * limit);
  return { scans: paged, pagination: { total, page, limit, pages: Math.ceil(total / limit) || 1 } };
};

export const deleteLocalScan = (id) => {
  const list = readHistory();
  const idx = list.findIndex(s => s._id === id);
  if (idx === -1) return null;
  const [removed] = list.splice(idx, 1);
  writeHistory(list);
  return removed;
};

export const clearLocalHistory = () => {
  const list = readHistory();
  const count = list.length;
  writeHistory([]);
  writeAnalytics({ totalScans: 0, counts: { legit: 0, suspicious: 0, phishing: 0 } });
  return count;
};

const bumpAnalytics = (result) => {
  const a = readAnalytics();
  a.totalScans = (a.totalScans || 0) + 1;
  if (result === 'Legit') a.counts.legit++;
  else if (result === 'Suspicious') a.counts.suspicious++;
  else if (result === 'Phishing') a.counts.phishing++;
  writeAnalytics(a);
};

export const getLocalStats = () => {
  const all = readHistory();
  const a = readAnalytics();
  const total = a.totalScans;
  const legit = a.counts.legit;
  const suspicious = a.counts.suspicious;
  const phishing = a.counts.phishing;
  const sevenDaysAgo = Date.now() - 7 * 86400000;
  const recent = all.filter(s => new Date(s.created_at).getTime() >= sevenDaysAgo).length;
  const totalDuration = all.reduce((acc, s) => acc + (Number(s.scan_duration) || 0), 0);
  const avgDuration = all.length ? +(totalDuration / all.length).toFixed(2) : 0;
  const factorCount = {};
  all.forEach(s => (s.meta_data?.risk_factors || []).forEach(f => { if (typeof f === 'string' && f.length <= 200) factorCount[f] = (factorCount[f] || 0) + 1; }));
  const topFactors = Object.entries(factorCount).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([factor, count]) => ({ factor, count }));
  return {
    totalScans: total,
    counts: { legit, suspicious, phishing },
    percentages: {
      legit: total ? +((legit / total) * 100).toFixed(2) : 0,
      suspicious: total ? +((suspicious / total) * 100).toFixed(2) : 0,
      phishing: total ? +((phishing / total) * 100).toFixed(2) : 0
    },
    recentScans: { last7Days: recent },
    avgScanDuration: avgDuration,
    topRiskFactors: topFactors
  };
};
