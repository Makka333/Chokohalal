import { redirect } from "next/navigation";

export const metadata = {
  title: "Служебный вход",
  robots: {
    index: false,
    follow: false,
  },
};

export default function PrivateAdminEntryPage() {
  redirect("/admin/login");
}
