import { dishes } from "@/data/menu";
import { units } from "@/data/units";

// Respostas locais por palavra-chave, usadas só quando o Gemini demora demais pra
// responder o chat. Cobrem as perguntas mais comuns; fora delas, orienta o cliente sem
// inventar informação.

function normalize(s: string) {
  return s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
}

function isVeg(tags: string[], description: string) {
  const n = tags.map(normalize);
  return (
    n.some((t) => t.includes("vegetal") || t.includes("vegetarian") || t.includes("veggie")) ||
    normalize(description).includes("vegetal")
  );
}

export function localChatReply(text: string): string {
  const n = normalize(text);

  if (/^(oi+|ola+|eae?|e ai|salve|bom dia|boa tarde|boa noite|hey|hi)\b/.test(n.trim())) {
    return "Oi! 👋 Posso ajudar com o cardápio, pedidos, reservas ou as unidades. O que você precisa?";
  }

  if (/obrigad|valeu|show|beleza|blz/.test(n) && n.length < 30) {
    return "Por nada! Qualquer coisa é só chamar. 🍔";
  }

  if (
    /especialidad|melhor da casa|mais pedid|recomend|sugir|sugest|melhor (prato|hamburguer)/.test(n)
  ) {
    const top = [...dishes].sort((a, b) => b.rating - a.rating)[0];
    return top
      ? `O queridinho da casa é o ${top.name} (nota ${top.rating}) — quer que eu adicione ao seu pedido?`
      : "Dá uma olhada no nosso cardápio, tem opções ótimas por lá!";
  }

  if (/vegan|vegetarian|sem carne|veggie/.test(n)) {
    const veg = dishes.find((d) => isVeg(d.tags, d.description));
    return veg
      ? `Não temos opção estritamente vegana, mas temos o ${veg.name}, um hambúrguer 100% vegetal — sem carne!`
      : "Confira o cardápio filtrando por Hambúrgueres — temos opções sem carne por lá.";
  }

  if (/gluten/.test(n)) {
    const semGluten = dishes.find((d) => d.tags.some((t) => normalize(t).includes("gluten")));
    return semGluten
      ? `Nosso selo "sem glúten" está na ${semGluten.name} — os hambúrgueres vêm no pão brioche tradicional.`
      : "Não tenho certeza de quais pratos são sem glúten agora — dá uma olhada nas tags de cada item no cardápio.";
  }

  if (/horari|funciona|abre|fecha|estacionamento/.test(n)) {
    return "Essa informação específica eu não tenho aqui — o melhor é ligar direto pra unidade mais próxima. Quer que eu te passe telefone e endereço de alguma unidade?";
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

  return "Boa pergunta! No momento não tenho uma resposta certeira pra isso — dá uma olhada no cardápio digital, ou me pergunta de novo em instantes que eu tento com mais calma.";
}
