import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { CalendarCheck2, Clock3, PartyPopper, Users } from "lucide-react";
import { toast } from "sonner";
import {
  ActionButton,
  PageHeader,
  Panel,
  Pill,
  Row,
  StatCard,
  TableShell,
} from "@/components/admin/AdminUI";
import { reservationStatusFlow, type ReservationStatus } from "@/data/admin";
import { useAdmin } from "@/lib/admin";

export const Route = createFileRoute("/admin/reservas")({
  head: () => ({
    meta: [
      { title: "Reservas — Painel Afya Grill" },
      {
        name: "description",
        content: "Agendamentos de mesa feitos pelo cardápio digital, QR Code e site.",
      },
    ],
  }),
  component: Reservas,
});

const tone: Record<ReservationStatus, "neutral" | "good" | "warn" | "bad"> = {
  Pendente: "warn",
  Confirmada: "good",
  Concluída: "neutral",
  Cancelada: "bad",
};

const TODAY = "2026-08-17";

function formatData(iso: string) {
  const [, m, d] = iso.split("-");
  return `${d}/${m}`;
}

function Reservas() {
  const { reservations, setReservationStatus } = useAdmin();
  const [filtro, setFiltro] = useState<"Todas" | ReservationStatus>("Todas");
  const [busca, setBusca] = useState("");

  const hoje = useMemo(() => reservations.filter((r) => r.data === TODAY), [reservations]);
  const pessoasHoje = hoje.reduce((a, r) => a + r.pessoas, 0);
  const confirmadas = reservations.filter((r) => r.status === "Confirmada").length;
  const pendentes = reservations.filter((r) => r.status === "Pendente").length;

  const lista = reservations
    .filter(
      (r) =>
        (filtro === "Todas" || r.status === filtro) &&
        (r.codigo + r.cliente + r.casa).toLowerCase().includes(busca.toLowerCase()),
    )
    .sort((a, b) => (a.data + a.hora < b.data + b.hora ? -1 : 1));

  return (
    <>
      <PageHeader
        title="Reservas"
        subtitle="Agendamentos feitos pelo cardápio digital, QR Code das mesas e site."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          index={0}
          label="Reservas hoje"
          value={String(hoje.length)}
          delta={`${TODAY.split("-").reverse().join("/")}`}
          icon={<CalendarCheck2 className="h-4 w-4" />}
        />
        <StatCard
          index={1}
          label="Pessoas esperadas"
          value={String(pessoasHoje)}
          delta="somente hoje"
          icon={<Users className="h-4 w-4" />}
        />
        <StatCard
          index={2}
          label="Confirmadas"
          value={String(confirmadas)}
          delta={`${reservations.length} no total`}
          icon={<PartyPopper className="h-4 w-4" />}
        />
        <StatCard
          index={3}
          label="Aguardando resposta"
          value={String(pendentes)}
          delta="responda em até 1h"
          icon={<Clock3 className="h-4 w-4" />}
        />
      </div>

      <div className="mt-4">
        <Panel>
          <div className="mb-4 flex flex-wrap items-center gap-2">
            {(["Todas", ...reservationStatusFlow] as const).map((s) => (
              <button
                key={s}
                onClick={() => setFiltro(s)}
                className={`rounded-full px-3.5 py-1.5 text-xs transition-all ${
                  filtro === s
                    ? "text-primary-foreground"
                    : "bg-secondary text-muted-foreground hover:text-foreground"
                }`}
                style={filtro === s ? { background: "var(--gradient-ember)" } : undefined}
              >
                {s}
              </button>
            ))}
            <input
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar código, cliente ou filial"
              className="ml-auto w-full rounded-xl border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary sm:w-64"
            />
          </div>

          <TableShell
            head={[
              "Código",
              "Cliente",
              "Filial",
              "Data / hora",
              "Pessoas",
              "Origem",
              "Status",
              "Ação",
            ]}
          >
            {lista.map((r) => (
              <Row key={r.id}>
                <td>
                  <p className="font-medium">{r.codigo}</p>
                  {r.mesa && <p className="text-xs text-muted-foreground">{r.mesa}</p>}
                </td>
                <td>
                  <p>{r.cliente}</p>
                  <p className="text-xs text-muted-foreground">{r.telefone}</p>
                </td>
                <td className="text-muted-foreground">{r.casa}</td>
                <td>
                  {formatData(r.data)} · {r.hora}
                </td>
                <td>{r.pessoas}</td>
                <td>
                  <Pill tone="neutral">{r.origem}</Pill>
                </td>
                <td>
                  <Pill tone={tone[r.status]}>{r.status}</Pill>
                </td>
                <td>
                  <div className="flex gap-2">
                    {r.status === "Pendente" && (
                      <ActionButton
                        tone="primary"
                        onClick={() => {
                          setReservationStatus(r.id, "Confirmada");
                          toast.success(`Reserva ${r.codigo} confirmada`);
                        }}
                      >
                        Confirmar
                      </ActionButton>
                    )}
                    {r.status !== "Cancelada" && r.status !== "Concluída" && (
                      <ActionButton
                        tone="danger"
                        onClick={() => {
                          setReservationStatus(r.id, "Cancelada");
                          toast.error(`Reserva ${r.codigo} cancelada`);
                        }}
                      >
                        Cancelar
                      </ActionButton>
                    )}
                  </div>
                </td>
              </Row>
            ))}
          </TableShell>
          {lista.length === 0 && (
            <p className="py-8 text-center text-sm text-muted-foreground">
              Nenhuma reserva neste filtro.
            </p>
          )}
        </Panel>
      </div>
    </>
  );
}
