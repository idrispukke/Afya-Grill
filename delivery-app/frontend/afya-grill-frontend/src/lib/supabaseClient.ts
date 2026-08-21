import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env["VITE_SUPABASE_URL"];
const supabaseKey = import.meta.env["VITE_SUPABASE_PUBLISHABLE_KEY"];

if (!supabaseUrl || !supabaseKey) {
  console.error(
    "Supabase não configurado: defina VITE_SUPABASE_URL e VITE_SUPABASE_PUBLISHABLE_KEY (.env local ou nas env vars do Vercel).",
  );
}

// anon/publishable key apenas — nunca a service_role key aqui, esse cliente roda no navegador.
export const supabase = createClient(supabaseUrl ?? "", supabaseKey ?? "");
