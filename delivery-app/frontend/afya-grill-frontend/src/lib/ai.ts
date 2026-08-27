import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { brl, dishes } from "@/data/menu";
import { units } from "@/data/units";

const SYSTEM_BASE =
  "Você é o assistente virtual do Afya Grill, uma hamburgueria. Responda sempre em português do Brasil, " +
  "de forma simpática e direta. Nunca invente pratos, preços, unidades ou promoções que não existam nos dados abaixo.";

function siteContext() {
  const cardapio = dishes
    .map(
      (d) =>
        `- ${d.name} (${d.category}, ${brl(d.price)}, avaliação ${d.rating}, pronto em ${d.time}): ` +
        `${d.description} [tags: ${d.tags.join(", ")}]`,
    )
    .join("\n");
  const unidades = units
    .map(
      (u) =>
        `- ${u.name} — ${u.endereco} (bairro ${u.bairro}, ${u.cidade}). Telefone: ${u.telefone}. ` +
        `Especialidade: ${u.especialidade}. Tempo médio de entrega: ${u.time}.`,
    )
    .join("\n");

  return (
    `CARDÁPIO COMPLETO (${dishes.length} itens):\n${cardapio}\n\n` +
    `UNIDADES DO AFYA GRILL:\n${unidades}\n\n` +
    "COMO O SITE FUNCIONA:\n" +
    "- /cardapio: cardápio digital. Dá pra escanear o QR Code da mesa (aí o site sabe a mesa e a unidade), " +
    'buscar pratos, ou usar o botão "O que eu peço?" descrevendo o que quer em texto livre. Na mesa também dá ' +
    "pra chamar garçom e pedir a conta pelo próprio site.\n" +
    "- /carrinho: revisar o pedido, escolher a unidade de entrega, preencher nome/telefone/endereço e pagar por " +
    "Pix, cartão de crédito ou débito. Frete é grátis para pedidos a partir de R$ 150 (abaixo disso custa R$ 12,90). " +
    'O cupom "MESA10" dá 10% de desconto.\n' +
    "- /reservas: reservar mesa em 3 passos (escolher filial, depois data/horário/nº de pessoas, depois dados " +
    "pessoais), ou descrever a reserva em uma frase livre e o formulário se preenche sozinho."
  );
}

function lightCatalog() {
  return dishes.map(({ id, name, category, price, tags, description }) => ({
    id,
    name,
    category,
    price,
    tags,
    description,
  }));
}

const ITEM_IDS_SCHEMA = {
  type: "OBJECT",
  properties: {
    message: { type: "STRING" },
    itemIds: { type: "ARRAY", items: { type: "STRING" } },
  },
  required: ["message", "itemIds"],
};

function validIds(ids: string[], max: number) {
  const known = new Set(dishes.map((d) => d.id));
  const seen = new Set<string>();
  const out: string[] = [];
  for (const id of ids) {
    if (known.has(id) && !seen.has(id)) {
      seen.add(id);
      out.push(id);
      if (out.length >= max) break;
    }
  }
  return out;
}

// ---------------------------------------------------------------------------
// 1. Chatbot geral (flutuante em todo o site)
// ---------------------------------------------------------------------------

const chatInputSchema = z.object({
  messages: z
    .array(
      z.object({
        role: z.enum(["user", "model"]),
        text: z.string().min(1).max(2000),
      }),
    )
    .min(1)
    .max(30),
});

export const aiChat = createServerFn({ method: "POST" })
  .validator((input: unknown) => chatInputSchema.parse(input))
  .handler(async ({ data }) => {
    const { generateChatText } = await import("@/server/gemini");
    const system =
      `${SYSTEM_BASE}\n\n${siteContext()}\n\n` +
      "Use essas informações reais para responder QUALQUER dúvida do cliente sobre o restaurante: pratos, preços, " +
      "ingredientes, categorias, unidades, endereços, telefones, como pedir, como pagar, frete, cupom ou como " +
      "reservar mesa. Interprete a intenção por trás da pergunta mesmo que ela venha vaga, incompleta, com erros " +
      "de digitação ou fora de ordem — sempre tente ajudar com o que foi digitado em vez de pedir para o cliente " +
      "reformular. Só recuse responder ou oriente a falar com a equipe humana quando a pergunta depender de algo " +
      "que você genuinamente não tem acesso (ex: status de um pedido específico já feito, disponibilidade de mesa " +
      "em tempo real). Pode usar até 6 frases quando o assunto exigir mais detalhe.";
    const reply = await generateChatText(data.messages, { systemInstruction: system });
    return { reply };
  });

// ---------------------------------------------------------------------------
// 2. Assistente de pedido no cardápio
// ---------------------------------------------------------------------------

const orderAssistantInputSchema = z.object({ query: z.string().min(2).max(300) });

export const aiOrderAssistant = createServerFn({ method: "POST" })
  .validator((input: unknown) => orderAssistantInputSchema.parse(input))
  .handler(async ({ data }) => {
    const { generateJson } = await import("@/server/gemini");
    const catalog = lightCatalog();
    const prompt =
      `Cardápio disponível (JSON): ${JSON.stringify(catalog)}\n\n` +
      `Pedido do cliente: "${data.query}"\n\n` +
      "Escolha, entre 1 e 4 itens do cardápio acima, os que melhor atendem ao pedido do cliente " +
      '(considere preço, categoria, ingredientes e tags). Use exclusivamente os "id" exatos do JSON acima ' +
      "em itemIds. Se o pedido mencionar um orçamento (ex: 'até R$ 60'), respeite a soma dos preços escolhidos " +
      "sempre que possível. Em message, escreva de 1 a 2 frases explicando a escolha de forma simpática.";
    const result = await generateJson<{ message: string; itemIds: string[] }>(prompt, {
      systemInstruction:
        `${SYSTEM_BASE} Você é um assistente de pedidos que recomenda pratos reais do cardápio ` +
        "com base no que o cliente descreve.",
      responseSchema: ITEM_IDS_SCHEMA,
    });
    return { message: result.message, itemIds: validIds(result.itemIds, 4) };
  });

// ---------------------------------------------------------------------------
// 3. Cross-sell inteligente no carrinho
// ---------------------------------------------------------------------------

const crossSellInputSchema = z.object({
  cartItemIds: z.array(z.string()).min(1).max(30),
});

export const aiCrossSell = createServerFn({ method: "POST" })
  .validator((input: unknown) => crossSellInputSchema.parse(input))
  .handler(async ({ data }) => {
    const { generateJson } = await import("@/server/gemini");
    const inCart = dishes.filter((d) => data.cartItemIds.includes(d.id));
    const others = dishes.filter((d) => !data.cartItemIds.includes(d.id));
    if (inCart.length === 0 || others.length === 0) {
      return { message: "", itemIds: [] as string[] };
    }
    const prompt =
      `Itens já no carrinho do cliente (JSON): ${JSON.stringify(
        inCart.map(({ id, name, category, tags }) => ({ id, name, category, tags })),
      )}\n\n` +
      `Outros itens disponíveis no cardápio para sugerir (JSON): ${JSON.stringify(
        others.map(({ id, name, category, price, tags, description }) => ({
          id,
          name,
          category,
          price,
          tags,
          description,
        })),
      )}\n\n` +
      "Sugira de 1 a 2 itens da lista de 'outros itens' que combinem bem como complemento do que já está no " +
      'carrinho (ex: bebida ou acompanhamento para um hambúrguer). Use os "id" exatos em itemIds. Em message, ' +
      "escreva uma frase curta e persuasiva mencionando os nomes reais dos itens sugeridos, no estilo " +
      '"Pediu X? Combina com Y."';
    const result = await generateJson<{ message: string; itemIds: string[] }>(prompt, {
      systemInstruction: `${SYSTEM_BASE} Você sugere complementos reais do cardápio para aumentar o pedido.`,
      responseSchema: ITEM_IDS_SCHEMA,
    });
    const ids = validIds(
      result.itemIds.filter((id) => !data.cartItemIds.includes(id)),
      2,
    );
    return { message: ids.length > 0 ? result.message : "", itemIds: ids };
  });

// ---------------------------------------------------------------------------
// 4. Assistente de reservas conversacional
// ---------------------------------------------------------------------------

const reservationInputSchema = z.object({
  text: z.string().min(3).max(400),
  casas: z.array(z.string()).min(1),
});

const RESERVATION_SCHEMA = {
  type: "OBJECT",
  properties: {
    casa: { type: "STRING", nullable: true },
    data: { type: "STRING", nullable: true },
    hora: { type: "STRING", nullable: true },
    pessoas: { type: "INTEGER", nullable: true },
    nome: { type: "STRING", nullable: true },
    telefone: { type: "STRING", nullable: true },
    observacao: { type: "STRING", nullable: true },
  },
  required: ["casa", "data", "hora", "pessoas", "nome", "telefone", "observacao"],
};

type ReservationParsed = {
  casa: string | null;
  data: string | null;
  hora: string | null;
  pessoas: number | null;
  nome: string | null;
  telefone: string | null;
  observacao: string | null;
};

function isoDateToday(): { iso: string; weekday: string } {
  const d = new Date();
  const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  const weekday = d.toLocaleDateString("pt-BR", { weekday: "long" });
  return { iso, weekday };
}

export const aiParseReservation = createServerFn({ method: "POST" })
  .validator((input: unknown) => reservationInputSchema.parse(input))
  .handler(async ({ data }) => {
    const { generateJson } = await import("@/server/gemini");
    const { iso, weekday } = isoDateToday();
    const prompt =
      `Hoje é ${weekday}, ${iso} (formato AAAA-MM-DD).\n` +
      `Filiais disponíveis: ${JSON.stringify(data.casas)}\n\n` +
      `Texto livre do cliente pedindo uma reserva: "${data.text}"\n\n` +
      "Extraia os dados da reserva. Regras: 'casa' deve ser exatamente um dos nomes da lista de filiais " +
      "(ou null se não mencionado/reconhecido); 'data' deve ser uma data futura ou igual a hoje no formato " +
      "AAAA-MM-DD (resolva termos relativos como 'sábado', 'amanhã', 'dia 20' com base na data de hoje), ou " +
      "null se não mencionado; 'hora' no formato HH:MM (24h), ou null; 'pessoas' um número inteiro, ou null; " +
      "'nome' e 'telefone' apenas se explicitamente mencionados no texto, senão null; 'observacao' um resumo " +
      "curto de pedidos especiais (aniversário, restrição alimentar, cadeira de bebê etc.), ou null.";
    const result = await generateJson<ReservationParsed>(prompt, {
      systemInstruction: `${SYSTEM_BASE} Você transforma pedidos de reserva em texto livre em dados estruturados.`,
      responseSchema: RESERVATION_SCHEMA,
    });

    const casa = result.casa && data.casas.includes(result.casa) ? result.casa : null;
    const dataValida =
      result.data && /^\d{4}-\d{2}-\d{2}$/.test(result.data) && result.data >= iso
        ? result.data
        : null;
    const horaValida = result.hora && /^\d{2}:\d{2}$/.test(result.hora) ? result.hora : null;
    const pessoasValida =
      typeof result.pessoas === "number" && result.pessoas >= 1 && result.pessoas <= 20
        ? Math.round(result.pessoas)
        : null;

    return {
      casa,
      data: dataValida,
      hora: horaValida,
      pessoas: pessoasValida,
      nome: result.nome?.trim() || null,
      telefone: result.telefone?.trim() || null,
      observacao: result.observacao?.trim() || null,
    } satisfies ReservationParsed;
  });

// ---------------------------------------------------------------------------
// 5. Busca semântica do cardápio
// ---------------------------------------------------------------------------

const semanticSearchInputSchema = z.object({ query: z.string().min(2).max(200) });

export const aiSemanticSearch = createServerFn({ method: "POST" })
  .validator((input: unknown) => semanticSearchInputSchema.parse(input))
  .handler(async ({ data }) => {
    const { generateJson } = await import("@/server/gemini");
    const catalog = lightCatalog();
    const prompt =
      `Cardápio (JSON): ${JSON.stringify(catalog)}\n\n` +
      `Busca do cliente: "${data.query}"\n\n` +
      'Retorne em itemIds os "id" dos itens do cardápio relevantes para essa busca, ordenados do mais ' +
      "relevante para o menos relevante (pode ser um único item, vários, ou nenhum se nada for relevante). " +
      "Considere sinônimos e intenção (ex: 'leve' → itens mais leves/menores; 'sem carne' → vegetarianos; " +
      "'mais pedido' → maior rating).";
    const result = await generateJson<{ message: string; itemIds: string[] }>(prompt, {
      systemInstruction: `${SYSTEM_BASE} Você rankeia itens reais do cardápio por relevância semântica à busca.`,
      responseSchema: ITEM_IDS_SCHEMA,
    });
    return { itemIds: validIds(result.itemIds, dishes.length) };
  });
