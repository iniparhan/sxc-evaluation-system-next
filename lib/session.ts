import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

export interface SessionUser {
  id: number;
  name: string;
  email: string;
  role_id: number | null;
  role_name: string | null;
  division_id: number | null;
  sub_division_id: number | null;
}

/**
 * Get the current user session from the cookie
 * Returns null if no valid session
 */
export async function getSession(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) return null;

  // Token format is "user-{id}"
  const match = token.match(/^user-(\d+)$/);
  if (!match) return null;

  const userId = parseInt(match[1], 10);
  if (isNaN(userId)) return null;

  // Fetch user with role info
  const user = await prisma.members.findUnique({
    where: { id: userId },
    include: {
      roles: true,
    },
  });

  if (!user) return null;

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role_id: user.role_id,
    role_name: user.roles?.name || null,
    division_id: user.division_id,
    sub_division_id: user.sub_division_id,
  };
}

/**
 * Set the session cookie
 */
export async function setSession(userId: number): Promise<string> {
  const token = `user-${userId}`;
  const cookieStore = await cookies();

  cookieStore.set("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24, // 24 hours
    sameSite: "lax",
  });

  return token;
}

/**
 * Destroy the session cookie
 */
export async function destroySession(): Promise<void> {
  const cookieStore = await cookies();

  cookieStore.set("token", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
    sameSite: "lax",
  });
}

/**
 * Get active evaluation period
 */
export async function getActivePeriod() {
  const period = await prisma.evaluation_periods.findFirst({
    where: { is_active: true },
    orderBy: { created_at: "desc" },
  });

  return period;
}
