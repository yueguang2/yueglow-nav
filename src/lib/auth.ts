import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createToken, hashToken } from "./crypto";
import { createSession, deleteExpiredSessions, deleteOtherSessions, deleteSession, getAdminById, getSession } from "./db";

export const sessionCookieName = "nav_session";

const sessionDurationMs = 1000 * 60 * 60 * 24 * 7;

export async function setSession(adminId: number) {
  deleteExpiredSessions();

  const sessionId = createToken();
  const expiresAt = new Date(Date.now() + sessionDurationMs);

  createSession(hashToken(sessionId), adminId, expiresAt);

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
    deleteSession(hashToken(sessionId));
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

  let session = getSession(hashToken(sessionId));

  if (!session) {
    session = getSession(sessionId);

    if (session && new Date(session.expiresAt).getTime() > Date.now()) {
      deleteSession(sessionId);
      createSession(hashToken(sessionId), session.adminId, new Date(session.expiresAt));
    }
  }

  if (!session || new Date(session.expiresAt).getTime() <= Date.now()) {
    if (session) {
      deleteSession(hashToken(sessionId));
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

export async function rotateSession(adminId: number) {
  await clearSession();
  await setSession(adminId);
}

export async function clearOtherSessionsForCurrentAdmin(adminId: number) {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get(sessionCookieName)?.value;

  if (sessionId) {
    deleteOtherSessions(adminId, hashToken(sessionId));
  }
}
