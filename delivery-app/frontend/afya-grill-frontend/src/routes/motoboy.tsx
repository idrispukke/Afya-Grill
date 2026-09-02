import { createFileRoute } from "@tanstack/react-router";
import { Bike } from "lucide-react";
import { StaffLogin } from "@/components/staff/StaffLogin";
import { CourierDashboard } from "@/components/staff/CourierDashboard";
import { useStaffSession } from "@/lib/staff";

export const Route = createFileRoute("/motoboy")({
  head: () => ({
    meta: [{ title: "Painel do Motoboy — Afya Grill" }, { name: "robots", content: "noindex" }],
  }),
  component: MotoboyPage,
});

function MotoboyPage() {
  const { ready, user, signIn, signOut } = useStaffSession("motoboy");

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
        role="motoboy"
        icon={<Bike className="h-6 w-6" />}
        title="Painel do Motoboy"
        subtitle="Acesso restrito à equipe de entrega"
        signIn={signIn}
      />
    );
  }

  return <CourierDashboard onSignOut={signOut} />;
}
