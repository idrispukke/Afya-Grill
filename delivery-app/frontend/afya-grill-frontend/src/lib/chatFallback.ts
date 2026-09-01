import { dishes } from "@/data/menu";
import { units } from "@/data/units";

// Respostas locais por palavra-chave, usadas só quando o Gemini demora demais pra
// responder o chat. Cobrem as perguntas mais comuns; fora delas, orienta o cliente sem
// inventar informação.

function normalize(s: string) {
  return s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
}

export function localChatReply(text: string): string {
  const n = normalize(text);

  if (/^(oi+|ola+|eae?|e ai|salve|bom dia|boa tarde|boa noite|hey|hi)\b/.test(n.trim())) {
    return "Oi! 👋 Posso ajudar com o cardápio, pedidos, reservas ou as unidades. O que você precisa?";
  }

  if (/obrigad|valeu|show|beleza|blz/.test(n) && n.length < 30) {
    return "Por nada! Qualquer coisa é só chamar. 🍔";
  }

  if (/mais pedid|recomend|sugir|sugest|melhor (prato|hamburguer)/.test(n)) {
    const top = [...dishes].sort((a, b) => b.rating - a.rating)[0];
    return top
      ? `O queridinho da casa é o ${top.name} (nota ${top.rating}) — quer que eu adicione ao seu pedido?`
      : "Dá uma olhada no nosso cardápio, tem opções ótimas por lá!";
  }

  if (/vegetarian|sem carne|veggie/.test(n)) {
    const veg = dishes.find((d) => d.tags.some((t) => normalize(t).includes("vegetarian")));
    return veg
      ? `Temos o ${veg.name}, uma ótima opção vegetariana!`
      : "Confira o cardápio filtrando por Hambúrgueres — temos opções sem carne por lá.";
  }

  if (/frete|entrega gr|taxa de entrega/.test(n)) {
    return "O frete é grátis para pedidos a partir de R$ 150. Abaixo disso, custa R$ 12,90.";
  }

  if (/cupom|desconto/.test(n)) {
    return 'O cupom "MESA10" dá 10% de desconto no seu pedido!';
  }

  if (/reserv/.test(n)) {
    return "Pra reservar mesa é rapidinho: escolha a filial, depois data/horário/número de pessoas e seus dados — ou descreva sua reserva numa frase que a gente preenche o formulário pra você!";
  }

  if (/endereco|telefone|unidade|onde fica/.test(n)) {
    const u = units[0];
    return u
      ? `Temos várias unidades — por exemplo, ${u.name} fica em ${u.endereco}. Veja todas em "Unidades" no menu.`
      : "Veja todas as nossas unidades na página inicial, em 'Unidades'.";
  }

  if (/pagamento|pagar|\bpix\b|cartao/.test(n)) {
    return "Você pode pagar por Pix, cartão de crédito ou débito na hora de finalizar o pedido.";
  }

  return "Deixa eu te ajudar: dá uma olhada no nosso cardápio digital, ou me pergunta sobre pratos, entrega, cupom ou reservas que eu tento de novo!";
}
