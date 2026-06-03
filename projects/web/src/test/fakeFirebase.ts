/**
 * In-memory Firebase fake for component-smoke tests.
 *
 * Test files wire this up with `vi.mock(...)` against `@/config/firebase` and the
 * `firebase/*` SDK entry points (see the `*Module` exports below). Because this
 * module is a cached singleton, the same fake state backs both the mocked SDK and
 * the control helpers a test imports directly.
 */

interface FakeUser {
  uid: string;
}

interface DbRef {
  _path: string;
  key: string | null;
}

interface DbListener {
  path: string;
  cb: (snap: { val: () => any }) => void;
}

// ── Auth state ──────────────────────────────────────────────────────────────
let currentUser: FakeUser | null = null;
let authListeners: Array<(u: FakeUser | null) => void> = [];

// ── Database state ──────────────────────────────────────────────────────────
let store: Record<string, any> = {};
let dbListeners: DbListener[] = [];
let pushCounter = 0;

const segments = (path: string) => path.split('/').filter(Boolean);

function getPath(path: string): any {
  if (!path) return store;
  let node: any = store;
  for (const seg of segments(path)) {
    if (node == null || typeof node !== 'object') return null;
    node = node[seg];
  }
  return node ?? null;
}

function setPath(path: string, value: any): void {
  const segs = segments(path);
  if (segs.length === 0) {
    store = value ?? {};
    return;
  }
  let node: any = store;
  for (let i = 0; i < segs.length - 1; i++) {
    const seg = segs[i];
    if (node[seg] == null || typeof node[seg] !== 'object') node[seg] = {};
    node = node[seg];
  }
  node[segs[segs.length - 1]] = value;
}

function removePath(path: string): void {
  const segs = segments(path);
  if (segs.length === 0) {
    store = {};
    return;
  }
  let node: any = store;
  for (let i = 0; i < segs.length - 1; i++) {
    const seg = segs[i];
    if (node[seg] == null || typeof node[seg] !== 'object') return;
    node = node[seg];
  }
  delete node[segs[segs.length - 1]];
}

function notifyDb(): void {
  for (const { path, cb } of dbListeners) {
    cb({ val: () => getPath(path) });
  }
}

function notifyAuth(): void {
  for (const cb of authListeners) {
    queueMicrotask(() => cb(currentUser));
  }
}

// ── Control helpers (imported directly by tests) ─────────────────────────────

/** Resets all fake state. Call between tests (done automatically in setup.ts). */
export function resetFakeFirebase(): void {
  currentUser = null;
  authListeners = [];
  store = {};
  dbListeners = [];
  pushCounter = 0;
  if (typeof window !== 'undefined') window.recaptchaVerifier = undefined;
}

/** Directly sets the signed-in user (bypasses the OTP flow). */
export function setFakeUser(uid: string | null): void {
  currentUser = uid ? { uid } : null;
  notifyAuth();
}

// ── Mocked module shapes ─────────────────────────────────────────────────────

export const configModule = {
  app: {},
  auth: { settings: {} },
  db: {},
  messagingPromise: Promise.resolve(null),
};

class FakeRecaptchaVerifier {
  clear(): void {}
  render(): Promise<number> {
    return Promise.resolve(0);
  }
  verify(): Promise<string> {
    return Promise.resolve('fake-token');
  }
}

export const authModule = {
  onAuthStateChanged(_auth: unknown, cb: (u: FakeUser | null) => void) {
    authListeners.push(cb);
    queueMicrotask(() => cb(currentUser));
    return () => {
      authListeners = authListeners.filter((l) => l !== cb);
    };
  },
  signInWithPhoneNumber(_auth: unknown, _phone: string, _verifier: unknown) {
    return Promise.resolve({
      confirm(_code: string) {
        setFakeUser('test-uid');
        return Promise.resolve({ user: currentUser });
      },
    });
  },
  signOut(_auth: unknown) {
    setFakeUser(null);
    return Promise.resolve();
  },
  RecaptchaVerifier: FakeRecaptchaVerifier,
};

export const databaseModule = {
  ref(_db: unknown, path = ''): DbRef {
    const segs = segments(path);
    return { _path: path, key: segs.length ? segs[segs.length - 1] : null };
  },
  onValue(
    ref: DbRef,
    cb: (snap: { val: () => any }) => void,
    _errCb?: (e: Error) => void,
  ) {
    const listener: DbListener = { path: ref._path, cb };
    dbListeners.push(listener);
    cb({ val: () => getPath(ref._path) });
    return () => {
      dbListeners = dbListeners.filter((l) => l !== listener);
    };
  },
  set(ref: DbRef, value: any) {
    if (value === null) removePath(ref._path);
    else setPath(ref._path, value);
    notifyDb();
    return Promise.resolve();
  },
  push(ref: DbRef, value?: any): DbRef {
    const key = `gen-${++pushCounter}`;
    const childPath = ref._path ? `${ref._path}/${key}` : key;
    if (value !== undefined) {
      setPath(childPath, value);
      notifyDb();
    }
    return { _path: childPath, key };
  },
  remove(ref: DbRef) {
    removePath(ref._path);
    notifyDb();
    return Promise.resolve();
  },
  update(_ref: DbRef, updates: Record<string, any>) {
    for (const [p, v] of Object.entries(updates)) {
      if (v === null) removePath(p);
      else setPath(p, v);
    }
    notifyDb();
    return Promise.resolve();
  },
};

export const messagingModule = {
  getMessaging: () => ({}),
  getToken: async () => null,
  onMessage: () => () => {},
  deleteToken: async () => true,
  isSupported: async () => false,
};
