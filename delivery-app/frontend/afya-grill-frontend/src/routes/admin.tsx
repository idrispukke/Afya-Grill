import { createFileRoute, Outlet } from "@tanstack/react-router";
import { AdminShell } from "@/components/admin/AdminShell";
import { AdminLogin } from "@/components/admin/AdminLogin";
import { useAdmin } from "@/lib/admin";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Painel gerencial — Afya Grill" },
      {
        name: "description",
        content: "Painel interno da Afya Grill: pedidos, cardápio, casas, entregas e financeiro.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminLayout,
});

function AdminLayout() {
  const { ready, user } = useAdmin();

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-border border-t-primary" />
      </div>
    );
  }

  if (!user) return <AdminLogin />;

  return (
    <AdminShell>
      <Outlet />
    </AdminShell>
  );
}
