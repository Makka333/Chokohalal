import { NextResponse } from "next/server";
import { createAdminSession, setAdminCookie, verifyPassword } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { loginSchema } from "@/lib/validation";

export async function POST(request: Request) {
  try {
    const payload = loginSchema.parse(await request.json());

    if (
      process.env.ADMIN_LOGIN &&
      process.env.ADMIN_PASSWORD &&
      payload.login === process.env.ADMIN_LOGIN &&
      payload.password === process.env.ADMIN_PASSWORD
    ) {
      const token = await createAdminSession({ adminId: "env-admin", login: payload.login });
      await setAdminCookie(token);
      return NextResponse.json({ ok: true });
    }

    const admin = await prisma.admin.findUnique({ where: { login: payload.login } });

    if (!admin || admin.status !== "ACTIVE") {
      return NextResponse.json({ error: "Неверный логин или пароль" }, { status: 401 });
    }

    const valid = await verifyPassword(payload.password, admin.passwordHash);
    if (!valid) {
      return NextResponse.json({ error: "Неверный логин или пароль" }, { status: 401 });
    }

    const token = await createAdminSession({ adminId: admin.id, login: admin.login });
    await setAdminCookie(token);

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("POST /api/admin/login failed", error);
    return NextResponse.json({ error: "Не удалось войти" }, { status: 500 });
  }
}
