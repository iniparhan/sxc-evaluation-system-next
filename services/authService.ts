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

  return res.json();
}

/**
 * Logout user and clear session cookie
 */
export async function logout(): Promise<void> {
  await fetch("/api/auth/logout", { method: "POST" });
}

/**
 * Get current user session
 * Returns null if not authenticated
 */
export async function getCurrentUser(): Promise<UserSession | null> {
  try {
    const res = await fetch("/api/auth/me");
    if (!res.ok) return null;
    const data = await res.json();
    return data.user;
  } catch {
    return null;
  }
}
