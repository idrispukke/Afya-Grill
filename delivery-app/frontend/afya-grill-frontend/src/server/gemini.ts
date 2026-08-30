// Cliente Gemini — só é importado dentro de handlers de server functions
// (ver src/lib/ai.ts), então o código e a API key nunca chegam ao bundle
// do navegador. O plugin do TanStack Start também bloqueia, em build, uma
// importação direta deste arquivo a partir de código de cliente (pasta
// "server/" está protegida em vite.config.ts).

const GEMINI_API_BASE = "https://generativelanguage.googleapis.com/v1beta/models";
// Alias (não uma versão fixa) para não quebrar quando a Google descontinuar uma versão específica —
// já vimos "gemini-2.5-flash" ser desativado para chaves novas. Troque via GEMINI_MODEL se precisar.
const DEFAULT_MODEL = "gemini-flash-lite-latest";

function apiKey(): string {
  const key = process.env["GEMINI_API_KEY"];
  if (!key) {
    throw new Error(
      "GEMINI_API_KEY não configurada no servidor. Defina em delivery-app/frontend/afya-grill-frontend/.env.local",
    );
  }
  return key;
}

type GeminiPart = { text: string };
type GeminiContent = { role: "user" | "model"; parts: GeminiPart[] };

type GenerationConfig = {
  temperature?: number;
  responseMimeType?: string;
  responseSchema?: unknown;
  // "low" evita o raciocínio estendido do Gemini 3 antes de responder — para tarefas
  // de recuperação/formatação simples (recomendar pratos, extrair JSON, responder com
  // base no cardápio) isso corta a latência em ~5-10x sem perda de qualidade percebida.
  thinkingConfig?: { thinkingLevel: "low" | "high" };
};

// Erros transitórios do lado do Google (modelo sobrecarregado, rate limit) — vale
// tentar de novo com backoff curto em vez de já falhar para o usuário.
const RETRYABLE_STATUS = new Set([429, 500, 503]);
const RETRY_DELAYS_MS = [400, 1000];
// A própria API do Gemini às vezes fica lenta no lado da Google (observamos respostas
// 200 levando 20-30s mesmo em prompts triviais, sem nenhum erro para detectar). Sem um
// limite, o usuário fica com o spinner girando indefinidamente — depois desse tempo por
// tentativa, desistimos e tentamos de novo (ou avisamos o usuário) em vez de travar a UI.
const ATTEMPT_TIMEOUT_MS = 12_000;

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function callGemini(
  contents: GeminiContent[],
  options: {
    systemInstruction?: string | undefined;
    generationConfig?: GenerationConfig | undefined;
  } = {},
): Promise<string> {
  const model = process.env["GEMINI_MODEL"] || DEFAULT_MODEL;
  const body: Record<string, unknown> = { contents };
  if (options.systemInstruction) {
    body["systemInstruction"] = { parts: [{ text: options.systemInstruction }] };
  }
  const generationConfig: GenerationConfig = {
    thinkingConfig: { thinkingLevel: "low" },
    ...options.generationConfig,
  };
  body["generationConfig"] = generationConfig;

  let res: Response | undefined;
  let errText = "";
  let timedOut = false;
  for (let attempt = 0; attempt <= RETRY_DELAYS_MS.length; attempt++) {
    timedOut = false;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), ATTEMPT_TIMEOUT_MS);
    try {
      res = await fetch(`${GEMINI_API_BASE}/${model}:generateContent?key=${apiKey()}`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
        signal: controller.signal,
      });
    } catch (err) {
      timedOut = (err as { name?: string }).name === "AbortError";
      if (!timedOut) throw err;
    } finally {
      clearTimeout(timeout);
    }

    if (res?.ok) break;
    if (res) errText = await res.text().catch(() => "");
    const shouldRetry =
      (timedOut || (res && RETRYABLE_STATUS.has(res.status))) && attempt < RETRY_DELAYS_MS.length;
    if (!shouldRetry) break;
    if (!timedOut) await sleep(RETRY_DELAYS_MS[attempt]!);
    res = undefined;
  }

  if (timedOut) {
    throw new Error("Gemini demorou demais para responder. Tenta de novo em instantes.");
  }
  if (!res || !res.ok) {
    throw new Error(`Gemini API respondeu ${res?.status}: ${errText.slice(0, 400)}`);
  }

  const json = (await res.json()) as {
    candidates?: { content?: { parts?: { text?: string }[] }; finishReason?: string }[];
    promptFeedback?: { blockReason?: string };
  };

  const text = json.candidates?.[0]?.content?.parts?.map((p) => p.text ?? "").join("");
  if (!text) {
    const blockReason = json.promptFeedback?.blockReason;
    throw new Error(
      blockReason ? `Gemini bloqueou a resposta: ${blockReason}` : "Resposta vazia do Gemini.",
    );
  }
  return text;
}

/** Gera texto livre a partir de um único prompt. */
export async function generateText(
  prompt: string,
  options: { systemInstruction?: string; temperature?: number } = {},
): Promise<string> {
  return callGemini([{ role: "user", parts: [{ text: prompt }] }], {
    systemInstruction: options.systemInstruction,
    generationConfig: { temperature: options.temperature ?? 0.6 },
  });
}

/** Gera texto a partir de um histórico de conversa (chat). */
export async function generateChatText(
  history: { role: "user" | "model"; text: string }[],
  options: { systemInstruction?: string; temperature?: number } = {},
): Promise<string> {
  return callGemini(
    history.map((h) => ({ role: h.role, parts: [{ text: h.text }] })),
    {
      systemInstruction: options.systemInstruction,
      generationConfig: { temperature: options.temperature ?? 0.6 },
    },
  );
}

/** Gera um JSON validado por um schema simplificado (formato Gemini Schema). */
export async function generateJson<T>(
  prompt: string,
  options: { systemInstruction?: string; responseSchema: unknown; temperature?: number },
): Promise<T> {
  const text = await callGemini([{ role: "user", parts: [{ text: prompt }] }], {
    systemInstruction: options.systemInstruction,
    generationConfig: {
      temperature: options.temperature ?? 0.3,
      responseMimeType: "application/json",
      responseSchema: options.responseSchema,
    },
  });
  try {
    return JSON.parse(text) as T;
  } catch {
    throw new Error(`Gemini retornou um JSON inválido: ${text.slice(0, 200)}`);
  }
}
