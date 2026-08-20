import { useState } from "react";
import { toast } from "sonner";
import { ActionButton, Field, PageHeader, Panel } from "@/components/admin/AdminUI";

function Toggle({ label, hint, defaultOn }: { label: string; hint: string; defaultOn?: boolean }) {
  const [on, setOn] = useState(!!defaultOn);
  return (
    <div className="flex items-center justify-between rounded-xl bg-surface px-4 py-3">
      <div>
        <p className="text-sm font-medium">{label}</p>
        <p className="text-xs text-muted-foreground">{hint}</p>
      </div>
      <button
        onClick={() => setOn((v) => !v)}
        aria-pressed={on}
        className={`relative h-6 w-11 rounded-full transition-colors ${on ? "" : "bg-secondary"}`}
        style={on ? { background: "var(--gradient-ember)" } : undefined}
      >
        <span
          className={`absolute top-1 h-4 w-4 rounded-full bg-background transition-all ${on ? "left-6" : "left-1"}`}
        />
      </button>
    </div>
  );
}

export function ConfiguracoesSection() {
  return (
    <section id="configuracoes" className="mt-14 scroll-mt-24 border-t border-border/60 pt-14">
      <PageHeader title="Configurações" subtitle="Parâmetros gerais da operação Afya Grill." />
      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="Dados da operação">
          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              toast.success("Configurações salvas");
            }}
          >
            <Field label="Nome fantasia" defaultValue="Afya Grill" />
            <Field label="Telefone" defaultValue="(21) 3771-1030" />
            <Field label="Endereço" defaultValue="Afya Duque de Caxias — Duque de Caxias, RJ" />
            <ActionButton tone="primary" type="submit">
              Salvar alterações
            </ActionButton>
          </form>
        </Panel>

        <Panel title="Entrega e cobrança">
          <div className="space-y-3">
            <Field label="Taxa de entrega padrão (R$)" type="number" defaultValue="9.9" />
            <Field label="Pedido mínimo (R$)" type="number" defaultValue="35" />
            <Toggle
              label="Aceitar pedidos"
              hint="Desligue para pausar toda a plataforma"
              defaultOn
            />
            <Toggle
              label="Frete grátis acima de R$ 120"
              hint="Aplicado automaticamente"
              defaultOn
            />
            <Toggle label="Notificações por e-mail" hint="Resumo diário às 23h" />
          </div>
        </Panel>
      </div>
    </section>
  );
}
