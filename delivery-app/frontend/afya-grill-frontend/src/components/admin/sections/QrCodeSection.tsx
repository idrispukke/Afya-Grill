import { useMemo, useRef, useState } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { Copy, Download, Link2, ScanLine, Smartphone, Table2 } from "lucide-react";
import { toast } from "sonner";
import { ActionButton, PageHeader, Panel, StatCard } from "@/components/admin/AdminUI";
import { useAdmin } from "@/lib/admin";
import { siteOrigin, slugify } from "@/lib/utils";

function QrCard({
  label,
  sub,
  url,
  filename,
  onFocus,
}: {
  label: string;
  sub: string;
  url: string;
  filename: string;
  onFocus?: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);

  const download = () => {
    const canvas = ref.current?.querySelector("canvas");
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = filename;
    link.href = canvas.toDataURL("image/png");
    link.click();
    toast.success("QR Code baixado");
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Link copiado");
    } catch {
      toast.error("Não foi possível copiar o link");
    }
  };

  return (
    <div
      onMouseEnter={onFocus}
      onClick={onFocus}
      className="group flex cursor-pointer flex-col items-center gap-3 rounded-2xl border border-border bg-surface p-5 text-center shadow-soft transition-colors hover:border-primary/50"
    >
      <div ref={ref} className="rounded-2xl bg-white p-3 shadow-inner">
        <QRCodeCanvas value={url} size={132} level="M" fgColor="#1a1108" />
      </div>
      <div>
        <p className="text-sm font-medium">{label}</p>
        <p className="text-xs text-muted-foreground">{sub}</p>
      </div>
      <div className="flex flex-wrap justify-center gap-2">
        <ActionButton onClick={copy}>
          <Copy className="h-3.5 w-3.5" /> Copiar
        </ActionButton>
        <ActionButton tone="primary" onClick={download}>
          <Download className="h-3.5 w-3.5" /> Baixar
        </ActionButton>
      </div>
    </div>
  );
}

export function QrCodeSection() {
  const { houses, tables } = useAdmin();
  const [casaAtiva, setCasaAtiva] = useState(houses[0]?.nome ?? "");
  const [previewUrl, setPreviewUrl] = useState<string>("/cardapio");

  const origin = siteOrigin();
  const linkGeral = `${origin}/cardapio`;
  const linkReservas = `${origin}/reservas`;

  const mesasDaCasa = useMemo(
    () => tables.filter((t) => t.casa === casaAtiva),
    [tables, casaAtiva],
  );

  const totalScans = tables.reduce((a, t) => a + t.scans, 0);

  return (
    <section id="qrcode" className="mt-14 scroll-mt-24 border-t border-border/60 pt-14">
      <PageHeader
        title="Cardápio digital & QR Code"
        subtitle="Gere e baixe QR Codes do cardápio digital para o site e para cada mesa."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          index={0}
          label="Casas com cardápio ativo"
          value={houses.filter((h) => h.ativo).length}
          icon={<ScanLine className="h-4 w-4" />}
        />
        <StatCard
          index={1}
          label="Mesas com QR gerado"
          value={tables.length}
          icon={<Table2 className="h-4 w-4" />}
        />
        <StatCard
          index={2}
          label="Leituras de QR (30 dias)"
          value={totalScans}
          delta="+22% no período"
          icon={<Smartphone className="h-4 w-4" />}
        />
        <StatCard
          index={3}
          label="Link do site"
          value="/cardapio"
          delta={origin.replace(/^https?:\/\//, "")}
          icon={<Link2 className="h-4 w-4" />}
        />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_320px]">
        <div className="space-y-4">
          <Panel
            title="Link geral do cardápio"
            description="Use na bio do Instagram, no cartão de mesa ou no site."
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <QrCard
                label="Cardápio completo"
                sub="Abre a vitrine digital de todas as casas"
                url={linkGeral}
                filename="afya-grill-cardapio-qrcode.png"
                onFocus={() => setPreviewUrl("/cardapio")}
              />
              <QrCard
                label="Reservar mesa"
                sub="Abre o agendamento direto de mesa"
                url={linkReservas}
                filename="afya-grill-reservas-qrcode.png"
                onFocus={() => setPreviewUrl("/reservas")}
              />
            </div>
          </Panel>

          <Panel
            title="QR Code por mesa"
            description="Cada mesa recebe um link único: o cardápio já abre com a mesa identificada."
          >
            <div className="mb-4 flex flex-wrap gap-2">
              {houses.map((h) => (
                <button
                  key={h.id}
                  onClick={() => setCasaAtiva(h.nome)}
                  className={`rounded-full px-3.5 py-1.5 text-xs transition-all ${
                    casaAtiva === h.nome
                      ? "text-primary-foreground"
                      : "bg-secondary text-muted-foreground hover:text-foreground"
                  }`}
                  style={casaAtiva === h.nome ? { background: "var(--gradient-ember)" } : undefined}
                >
                  {h.nome}
                </button>
              ))}
            </div>

            {mesasDaCasa.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">
                Nenhuma mesa cadastrada para esta casa ainda.
              </p>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {mesasDaCasa.map((t) => {
                  const url = `${origin}/cardapio?casa=${slugify(t.casa)}&mesa=${t.numero}`;
                  return (
                    <QrCard
                      key={t.id}
                      label={`Mesa ${t.numero}`}
                      sub={`${t.area} · até ${t.capacidade} pessoas · ${t.scans} leituras`}
                      url={url}
                      filename={`afya-grill-${slugify(t.casa)}-mesa-${t.numero}.png`}
                      onFocus={() =>
                        setPreviewUrl(`/cardapio?casa=${slugify(t.casa)}&mesa=${t.numero}`)
                      }
                    />
                  );
                })}
              </div>
            )}
          </Panel>
        </div>

        <Panel
          title="Pré-visualização ao vivo"
          description="Passe o mouse em um QR Code para ver aqui."
          className="h-fit lg:sticky lg:top-24"
        >
          <div className="mx-auto w-[240px] rounded-[2.2rem] border-4 border-secondary bg-background p-2 shadow-soft">
            <div className="mb-2 flex justify-center">
              <span className="h-1.5 w-10 rounded-full bg-secondary" />
            </div>
            <div className="h-[440px] overflow-hidden rounded-[1.6rem] border border-border bg-background">
              <iframe
                key={previewUrl}
                src={previewUrl}
                title="Pré-visualização do cardápio"
                className="h-full w-full origin-top-left"
                style={{ width: "285%", height: "285%", transform: "scale(0.35)", border: "none" }}
              />
            </div>
          </div>
        </Panel>
      </div>
    </section>
  );
}
