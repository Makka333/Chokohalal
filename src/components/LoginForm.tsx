"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function LoginForm() {
  const router = useRouter();
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ login, password }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? "Не удалось войти");
      }

      router.push("/admin/dashboard");
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Не удалось войти");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className="panel mx-auto grid max-w-md gap-5 p-6">
      <div>
        <h1 className="text-3xl font-black text-[#0c3b2e]">Вход администратора</h1>
        <p className="mt-3 text-sm text-[#66736d]">Доступ защищён серверной cookie-сессией.</p>
      </div>
      <label className="grid gap-2">
        <span className="text-sm font-bold">Логин</span>
        <input className="field" value={login} onChange={(event) => setLogin(event.target.value)} required />
      </label>
      <label className="grid gap-2">
        <span className="text-sm font-bold">Пароль</span>
        <input className="field" type="password" value={password} onChange={(event) => setPassword(event.target.value)} required />
      </label>
      {error ? <p className="rounded-lg bg-red-50 p-3 text-sm text-[#a13d34]">{error}</p> : null}
      <button className="btn-primary" type="submit" disabled={loading}>
        {loading ? "Проверяем..." : "Войти"}
      </button>
    </form>
  );
}
