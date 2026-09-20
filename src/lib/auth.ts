import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { prisma } from "@/lib/db";

const COOKIE_NAME = "admin_session";
const encoder = new TextEncoder();

export type AdminSession = {
  adminId: string;
  login: string;
};

function getAuthSecret(): Uint8Array {
  const secret = process.env.AUTH_SECRET;

  if (!secret || secret.length < 32) {
    throw new Error("AUTH_SECRET must be set and at least 32 characters long");
  }

  return encoder.encode(secret);
}

export async function verifyPassword(password: string, passwordHash: string): Promise<boolean> {
  return bcrypt.compare(password, passwordHash);
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function createAdminSession(admin: AdminSession): Promise<string> {
  return new SignJWT(admin)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("8h")
    .sign(getAuthSecret());
}

export async function readAdminSession(): Promise<AdminSession | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;

  if (!token) {
    return null;
  }

  try {
    const { payload } = await jwtVerify(token, getAuthSecret());
    return {
      adminId: String(payload.adminId),
      login: String(payload.login),
    };
  } catch {
    return null;
  }
}

export async function requireAdmin(): Promise<AdminSession> {
  const session = await readAdminSession();

  if (!session) {
    throw new Error("Unauthorized");
  }

  if (session.adminId === "env-admin") {
    if (process.env.ADMIN_LOGIN && session.login === process.env.ADMIN_LOGIN) {
      return session;
    }

    throw new Error("Unauthorized");
  }

  const admin = await prisma.admin.findUnique({
    where: { id: session.adminId },
    select: { id: true, login: true, status: true },
  });

  if (!admin || admin.status !== "ACTIVE") {
    throw new Error("Unauthorized");
  }

  return { adminId: admin.id, login: admin.login };
}

export async function setAdminCookie(token: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 8,
  });
}

export async function clearAdminCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}
