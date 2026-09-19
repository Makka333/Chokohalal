import type { ApplicationStatus } from "@/types";

const labels: Record<ApplicationStatus, string> = {
  NEW: "Новая",
  UNDER_REVIEW: "На проверке",
  APPROVED: "Одобрена",
  REJECTED: "Отклонена",
  COMPLETED: "Завершена",
};

const colors: Record<ApplicationStatus, string> = {
  NEW: "bg-blue-50 text-blue-800",
  UNDER_REVIEW: "bg-amber-50 text-amber-800",
  APPROVED: "bg-green-50 text-green-800",
  REJECTED: "bg-red-50 text-red-800",
  COMPLETED: "bg-neutral-100 text-neutral-800",
};

export function StatusBadge({ status }: { status: ApplicationStatus }) {
  return <span className={`rounded-full px-3 py-1 text-xs font-bold ${colors[status]}`}>{labels[status]}</span>;
}

export { labels as applicationStatusLabels };
