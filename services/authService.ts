// Types
export interface UserSession {
  id: number;
  name: string;
  email: string;
  role_id: number | null;
  role_name: string | null;
  division_id: number | null;
  sub_division_id: number | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: UserSession;
}

export interface ApiError {
  message: string;
  status: number;
}

interface CachedSession {
  user: UserSession | null;
  expiresAt: number;
}

const SESSION_CACHE_KEY = "sxc-user-session-cache";
const SESSION_CACHE_TTL_MS = 30_000;

function readSessionCache(): UserSession | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.sessionStorage.getItem(SESSION_CACHE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as CachedSession;
    if (!parsed || typeof parsed.expiresAt !== "number") return null;

    if (Date.now() > parsed.expiresAt) {
      window.sessionStorage.removeItem(SESSION_CACHE_KEY);
      return null;
    }

    return parsed.user;
  } catch {
    return null;
  }
}

function writeSessionCache(user: UserSession | null): void {
  if (typeof window === "undefined") return;

  const payload: CachedSession = {
    user,
    expiresAt: Date.now() + SESSION_CACHE_TTL_MS,
  };

  window.sessionStorage.setItem(SESSION_CACHE_KEY, JSON.stringify(payload));
}

function clearSessionCache(): void {
  if (typeof window === "undefined") return;
  window.sessionStorage.removeItem(SESSION_CACHE_KEY);
}

/**
 * Login user with email and password
 * Sets HTTP-only cookie and returns user session
 */
export async function login(credentials: LoginCredentials): Promise<LoginResponse> {
  const res = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(credentials),
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: "Login failed" }));
    throw { message: error.message || "Login failed", status: res.status } as ApiError;
  }

  const data: LoginResponse = await res.json();
  writeSessionCache(data.user);
  return data;
}

/**
 * Logout user and clear session cookie
 */
export async function logout(): Promise<void> {
  clearSessionCache();
  await fetch("/api/auth/logout", { method: "POST" });
}

/**
 * Get current user session
 * Returns null if not authenticated
 */
export async function getCurrentUser(options?: { forceRefresh?: boolean }): Promise<UserSession | null> {
  const shouldForceRefresh = options?.forceRefresh === true;

  if (!shouldForceRefresh) {
    const cached = readSessionCache();
    if (cached) return cached;
  }

  try {
    const res = await fetch("/api/auth/me", {
      cache: "no-store",
    });

    if (!res.ok) {
      clearSessionCache();
      return null;
    }

    const data = await res.json();
    const user = (data?.user ?? null) as UserSession | null;
    writeSessionCache(user);
    return user;
  } catch {
    return null;
  }
}
