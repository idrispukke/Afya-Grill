import { dishes, type Dish } from "@/data/menu";

// Fallback local (sem IA, sem rede) usado quando o Gemini demora demais — roda em
// microssegundos no navegador, então garante que o usuário sempre veja algo relevante
// dentro da janela de espera, mesmo que a API do Google esteja lenta naquele momento.

const STOPWORDS = new Set([
  "um",
  "uma",
  "uns",
  "umas",
  "o",
  "a",
  "os",
  "as",
  "de",
  "do",
  "da",
  "dos",
  "das",
  "com",
  "sem",
  "para",
  "pra",
  "e",
  "ou",
  "que",
  "algo",
  "alguma",
  "algum",
  "quero",
  "queria",
  "gostaria",
  "por",
  "favor",
  "tem",
  "pouco",
  "muito",
  "mais",
  "menos",
  "eu",
]);

const SYNONYMS: Record<string, string[]> = {
  picante: ["picante", "apimentado", "pimenta", "spicy", "ardido"],
  leve: ["leve", "light", "levinho", "levinha"],
  vegetariano: ["vegetariano", "vegetariana", "veggie"],
  doce: ["doce", "sobremesa", "acucarado"],
  gelado: ["gelado", "geladinho", "fresco", "fria", "frio", "gelada"],
  bebida: ["bebida", "beber", "tomar"],
};

function normalize(s: string) {
  return s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
}

function expandTokens(raw: string[]): string[] {
  const out = new Set(raw);
  for (const t of raw) {
    for (const [key, synonyms] of Object.entries(SYNONYMS)) {
      if (synonyms.some((s) => normalize(s) === t)) out.add(normalize(key));
    }
  }
  return [...out];
}

function tokenize(text: string): string[] {
  const n = normalize(text);
  // "sem" é normalmente um stopword, mas "sem carne" é justamente o oposto de "carne" —
  // sem esse tratamento a busca acabaria pontuando pratos com carne mais alto, o
  // contrário do que a pessoa pediu.
  const negatesCarne = /\bsem\s+carne\b/.test(n);
  const raw = n
    .split(/[^a-z0-9]+/)
    .filter((t) => t.length > 1 && !STOPWORDS.has(t) && !(negatesCarne && t === "carne"));
  return expandTokens(raw);
}

function parseBudget(text: string): number | null {
  const m = normalize(text).match(/(?:ate|até)\s*(?:r\$)?\s*(\d+)(?:[.,](\d{1,2}))?/);
  if (!m) return null;
  const int = Number(m[1]);
  const dec = m[2] ? Number(m[2]) / 100 : 0;
  return int + dec;
}

/** Ranqueia os pratos do cardápio por relevância a uma busca em texto livre, sem IA. */
export function searchDishes(query: string, limit = 4): Dish[] {
  const normalizedQuery = normalize(query);
  const tokens = tokenize(query);
  const budget = parseBudget(query);
  // Detecta a intenção "vegetariano" no texto bruto (não só nos tokens), já que o
  // cardápio descreve isso como "100% vegetal" — uma palavra diferente de
  // "vegetariano"/"veggie" que a pessoa costuma digitar.
  const wantsVeg = /vegetarian|vegetal|vegano|\bsem\s+carne\b/.test(normalizedQuery);

  const scored = dishes.map((d) => {
    const name = normalize(d.name);
    const category = normalize(d.category);
    const tags = d.tags.map(normalize);
    const description = normalize(d.description);
    const isVeg =
      tags.some(
        (tag) => tag.includes("vegetal") || tag.includes("vegetarian") || tag.includes("veggie"),
      ) ||
      description.includes("vegetal") ||
      description.includes("sem carne");

    let score = 0;
    for (const t of tokens) {
      if (name.includes(t)) score += 3;
      if (category.includes(t)) score += 2;
      if (tags.some((tag) => tag.includes(t))) score += 2;
      if (description.includes(t)) score += 1;
    }
    if (wantsVeg) score += isVeg ? 4 : -3;
    if (budget !== null) score += d.price <= budget ? 1 : -4;
    score += d.rating / 10;

    return { dish: d, score };
  });

  const ranked = scored
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((s) => s.dish);

  const fallback = ranked.length > 0 ? ranked : [...dishes].sort((a, b) => b.rating - a.rating);
  return fallback.slice(0, limit);
}

/** Mensagem curta pra acompanhar os resultados do assistente de pedido no modo local. */
export function localOrderMessage(results: Dish[]): string {
  if (results.length === 0)
    return "Não encontrei nada certeiro pra isso — tenta descrever de outro jeito.";
  return `Baseado no que você descreveu, uma boa pedida é o ${results[0]!.name}.`;
}

const COMPLEMENTARY_CATEGORIES: Record<string, Dish["category"][]> = {
  Hambúrgueres: ["Batatas", "Refrigerantes", "Água", "Sucos", "Milkshakes"],
  Combos: ["Sobremesas", "Refrigerantes"],
};

/** Sugestões de cross-sell sem IA: pega categorias que combinam com o que já está no carrinho. */
export function crossSellSuggestions(cartDishes: Dish[], limit = 2): Dish[] {
  const inCartIds = new Set(cartDishes.map((d) => d.id));
  const wanted = new Set<Dish["category"]>();
  for (const d of cartDishes) {
    (COMPLEMENTARY_CATEGORIES[d.category] ?? ["Sobremesas", "Refrigerantes"]).forEach((c) =>
      wanted.add(c),
    );
  }

  const pool = dishes.filter((d) => !inCartIds.has(d.id) && wanted.has(d.category));
  const ranked = (pool.length > 0 ? pool : dishes.filter((d) => !inCartIds.has(d.id))).sort(
    (a, b) => b.rating - a.rating,
  );
  return ranked.slice(0, limit);
}

export function localCrossSellMessage(cartDishes: Dish[], suggestions: Dish[]): string {
  if (suggestions.length === 0) return "";
  const names = suggestions.map((s) => s.name).join(" e ");
  const first = cartDishes[0];
  return first ? `Pediu ${first.name}? Combina com ${names}.` : `Combina bem com ${names}.`;
}
