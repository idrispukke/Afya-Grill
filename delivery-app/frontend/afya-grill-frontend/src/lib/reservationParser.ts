export type ReservationParsed = {
  casa: string | null;
  data: string | null;
  hora: string | null;
  pessoas: number | null;
  nome: string | null;
  telefone: string | null;
  observacao: string | null;
};

// Extrai os campos de uma reserva a partir de texto livre, sem IA — usado como fallback
// instantâneo quando o Gemini demora demais, e cobre bem os jeitos mais comuns de
// descrever uma reserva ("mesa pra 4, sábado à noite, é aniversário").

function normalize(s: string) {
  return s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
}

function isoOf(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function startOfToday() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

const WEEKDAYS_NORM = ["domingo", "segunda", "terca", "quarta", "quinta", "sexta", "sabado"];

function parseData(text: string): string | null {
  const n = normalize(text);
  const today = startOfToday();

  if (/\bhoje\b/.test(n)) return isoOf(today);
  if (/\bamanha\b/.test(n)) {
    const d = new Date(today);
    d.setDate(d.getDate() + 1);
    return isoOf(d);
  }

  for (let i = 0; i < WEEKDAYS_NORM.length; i++) {
    if (new RegExp(`\\b${WEEKDAYS_NORM[i]}\\b`).test(n)) {
      const d = new Date(today);
      d.setDate(d.getDate() + ((i - d.getDay() + 7) % 7));
      return isoOf(d);
    }
  }

  const m = n.match(/\b(\d{1,2})[/-](\d{1,2})(?:[/-](\d{2,4}))?\b/);
  if (m) {
    const day = Number(m[1]);
    const month = Number(m[2]);
    const year = m[3]
      ? m[3].length === 2
        ? 2000 + Number(m[3])
        : Number(m[3])
      : today.getFullYear();
    let d = new Date(year, month - 1, day);
    if (!isNaN(d.getTime())) {
      if (d < today && !m[3]) d = new Date(year + 1, month - 1, day);
      return isoOf(d);
    }
  }

  return null;
}

function parseHora(text: string): string | null {
  const n = normalize(text);
  const isNight = /\bnoite\b/.test(n);

  let m = n.match(/\b([01]?\d|2[0-3]):([0-5]\d)\b/);
  if (m) return `${m[1]!.padStart(2, "0")}:${m[2]}`;

  m = n.match(/\b([01]?\d|2[0-3])\s*h(?:oras?)?\b/) ?? n.match(/\bas\s+([01]?\d|2[0-3])\b/);
  if (m) {
    let hour = Number(m[1]);
    if (isNight && hour >= 1 && hour <= 11) hour += 12;
    return `${String(hour).padStart(2, "0")}:00`;
  }

  if (/\bmeio.?dia\b/.test(n) || /\balmoco\b/.test(n)) return "12:30";
  if (isNight) return "20:00";
  return null;
}

function parsePessoas(text: string): number | null {
  const n = normalize(text);
  const m =
    n.match(/(\d{1,2})\s*(?:pessoas?|pax)\b/) ??
    n.match(/\bpra\s+(\d{1,2})\b/) ??
    n.match(/\bpara\s+(\d{1,2})\b/);
  if (!m) return null;
  const v = Number(m[1]);
  return v >= 1 && v <= 20 ? v : null;
}

function parseCasa(text: string, casas: string[]): string | null {
  const n = normalize(text);
  for (const c of casas) {
    if (n.includes(normalize(c))) return c;
    const short = normalize(c.replace(/^afya grill\s*/i, ""));
    if (short && n.includes(short)) return c;
  }
  return null;
}

function parseObservacao(text: string): string | null {
  const n = normalize(text);
  if (/aniversari/.test(n)) return "Aniversário";
  if (/cadeir.*bebe|cadeirinha/.test(n)) return "Cadeira de bebê";
  if (/alerg|restric.*alimentar|intoleran/.test(n)) return "Restrição alimentar";
  if (/janela/.test(n)) return "Mesa perto da janela";
  return null;
}

export function parseReservationLocally(text: string, casas: string[]): ReservationParsed {
  return {
    casa: parseCasa(text, casas),
    data: parseData(text),
    hora: parseHora(text),
    pessoas: parsePessoas(text),
    nome: null,
    telefone: null,
    observacao: parseObservacao(text),
  };
}
