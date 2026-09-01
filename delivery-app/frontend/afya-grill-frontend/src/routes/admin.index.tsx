import { createFileRoute } from "@tanstack/react-router";
import { OverviewSection } from "@/components/admin/sections/OverviewSection";
import { PedidosSection } from "@/components/admin/sections/PedidosSection";
import { ReservasSection } from "@/components/admin/sections/ReservasSection";
import { CardapioSection } from "@/components/admin/sections/CardapioSection";
import { QrCodeSection } from "@/components/admin/sections/QrCodeSection";
import { CasasSection } from "@/components/admin/sections/CasasSection";
import { ClientesSection } from "@/components/admin/sections/ClientesSection";
import { EntregadoresSection } from "@/components/admin/sections/EntregadoresSection";
import { CuponsSection } from "@/components/admin/sections/CuponsSection";
import { AvaliacoesSection } from "@/components/admin/sections/AvaliacoesSection";
import { FinanceiroSection } from "@/components/admin/sections/FinanceiroSection";
import { EquipeSection } from "@/components/admin/sections/EquipeSection";
import { ConfiguracoesSection } from "@/components/admin/sections/ConfiguracoesSection";

export const Route = createFileRoute("/admin/")({
  head: () => ({
    meta: [
      { title: "Dashboard - Painel Afya Grill" },
      {
        name: "description",
        content:
          "Toda a operação da Afya Grill num só painel: pedidos, reservas, cardápio, QR Code, casas, clientes, entregas, financeiro e equipe.",
      },
    ],
  }),
  component: AdminDashboard,
});

function AdminDashboard() {
  return (
    <div>
      <OverviewSection />
      <PedidosSection />
      <ReservasSection />
      <CardapioSection />
      <QrCodeSection />
      <CasasSection />
      <ClientesSection />
      <EntregadoresSection />
      <CuponsSection />
      <AvaliacoesSection />
      <FinanceiroSection />
      <EquipeSection />
      <ConfiguracoesSection />
    </div>
  );
}
