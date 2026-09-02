import { createFileRoute } from "@tanstack/react-router";
import { ChefHat } from "lucide-react";
import { StaffLogin } from "@/components/staff/StaffLogin";
import { KitchenDashboard } from "@/components/staff/KitchenDashboard";
import { useStaffSession } from "@/lib/staff";

export const Route = createFileRoute("/cozinha")({
  head: () => ({
    meta: [{ title: "Painel da Cozinha — Afya Grill" }, { name: "robots", content: "noindex" }],
  }),
  component: CozinhaPage,
});

function CozinhaPage() {
  const { ready, user, signIn, signOut } = useStaffSession("cozinha");

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
        role="cozinha"
        icon={<ChefHat className="h-6 w-6" />}
        title="Painel da Cozinha"
        subtitle="Acesso restrito à equipe de cozinha"
        signIn={signIn}
      />
    );
  }

  return <KitchenDashboard onSignOut={signOut} />;
}
