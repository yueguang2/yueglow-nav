import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createToken } from "./crypto";
import { createSession, deleteExpiredSessions, deleteSession, getAdminById, getSession } from "./db";

export const sessionCookieName = "nav_session";

const sessionDurationMs = 1000 * 60 * 60 * 24 * 7;

export async function setSession(adminId: number) {
  deleteExpiredSessions();

  const sessionId = createToken();
  const expiresAt = new Date(Date.now() + sessionDurationMs);

  createSession(sessionId, adminId, expiresAt);

  const cookieStore = await cookies();
  cookieStore.set(sessionCookieName, sessionId, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    expires: expiresAt,
    path: "/",
  });
}

export async function clearSession() {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get(sessionCookieName)?.value;

  if (sessionId) {
    deleteSession(sessionId);
  }

  cookieStore.delete(sessionCookieName);
}

export async function getCurrentAdmin() {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get(sessionCookieName)?.value;

  if (!sessionId) {
    return undefined;
  }

  const session = getSession(sessionId);

  if (!session || new Date(session.expiresAt).getTime() <= Date.now()) {
    if (session) {
      deleteSession(sessionId);
    }

    return undefined;
  }

  return getAdminById(session.adminId);
}

export async function requireAdmin() {
  const admin = await getCurrentAdmin();

  if (!admin) {
    redirect("/admin/login");
  }

  return admin;
}
