"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { applicationStatusLabels } from "@/components/StatusBadge";
import type { ApplicationStatus } from "@/types";

const statuses = Object.keys(applicationStatusLabels) as ApplicationStatus[];

export function ApplicationStatusForm({ applicationId, status }: { applicationId: string; status: ApplicationStatus }) {
  const router = useRouter();
  const [current, setCurrent] = useState<ApplicationStatus>(status);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setLoading(true);

    try {
      const response = await fetch(`/api/applications/${applicationId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: current }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? "Не удалось сохранить статус");
      }

      setMessage("Статус сохранён");
      router.refresh();
    } catch (caught) {
      setMessage(caught instanceof Error ? caught.message : "Не удалось сохранить статус");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className="grid gap-3 rounded-lg border border-[#d8ddd7] bg-white p-4">
      <label className="grid gap-2">
        <span className="text-sm font-bold">Статус заявки</span>
        <select className="field" value={current} onChange={(event) => setCurrent(event.target.value as ApplicationStatus)}>
          {statuses.map((item) => (
            <option key={item} value={item}>
              {applicationStatusLabels[item]}
            </option>
          ))}
        </select>
      </label>
      <button className="btn-primary" type="submit" disabled={loading}>
        Сохранить статус
      </button>
      {message ? <p className="text-sm text-[#66736d]">{message}</p> : null}
    </form>
  );
}
