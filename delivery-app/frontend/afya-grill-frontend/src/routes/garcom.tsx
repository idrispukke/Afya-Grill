import { createFileRoute } from "@tanstack/react-router";
import { Bell } from "lucide-react";
import { StaffLogin } from "@/components/staff/StaffLogin";
import { WaiterDashboard } from "@/components/staff/WaiterDashboard";
import { useStaffSession } from "@/lib/staff";

export const Route = createFileRoute("/garcom")({
  head: () => ({
    meta: [{ title: "Painel do Garçom — Afya Grill" }, { name: "robots", content: "noindex" }],
  }),
  component: GarcomPage,
});

function GarcomPage() {
  const { ready, user, signIn, signOut } = useStaffSession("garcom");

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-border border-t-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <StaffLogin
        role="garcom"
        icon={<Bell className="h-6 w-6" />}
        title="Painel do Garçom"
        subtitle="Acesso restrito à equipe de salão"
        signIn={signIn}
      />
    );
  }

  return <WaiterDashboard onSignOut={signOut} />;
}
