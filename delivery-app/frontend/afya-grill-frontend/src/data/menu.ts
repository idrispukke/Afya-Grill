import burger from "@/assets/dish-burger.jpg";
import pasta from "@/assets/dish-pasta.jpg";
import sushi from "@/assets/dish-sushi.jpg";
import pizza from "@/assets/dish-pizza.jpg";
import dessert from "@/assets/dish-dessert.jpg";
import drink from "@/assets/dish-drink.jpg";

import duploCheddarBrasa from "@/assets/dishes/duplo-cheddar-brasa.jpg";
import costelaFogoDeChao from "@/assets/dishes/costela-fogo-de-chao.jpg";
import picanhaNaBrasa from "@/assets/dishes/picanha-na-brasa.jpg";
import oldFashionedBrasa from "@/assets/dishes/old-fashioned-brasa.jpg";
import risotoFunghi from "@/assets/dishes/risoto-funghi.jpg";
import burrataAffumicata from "@/assets/dishes/burrata-affumicata.jpg";
import tiramisuDellaNonna from "@/assets/dishes/tiramisu-della-nonna.jpg";
import negroniLunare from "@/assets/dishes/negroni-lunare.jpg";
import combinadoKaze20 from "@/assets/dishes/combinado-kaze-20.jpg";
import uramakiSalmaoCrocante from "@/assets/dishes/uramaki-salmao-crocante.jpg";
import temakiAtumPicante from "@/assets/dishes/temaki-atum-picante.jpg";
import sakeJunmaiGelado from "@/assets/dishes/sake-junmai-gelado.jpg";
import quattroFormaggi from "@/assets/dishes/quattro-formaggi.jpg";
import calabresaArtesanal from "@/assets/dishes/calabresa-artesanal.jpg";
import pannaCottaBaunilha from "@/assets/dishes/panna-cotta-baunilha.jpg";
import spritzSette from "@/assets/dishes/spritz-sette.jpg";
import cheesecakeFrutasVermelhas from "@/assets/dishes/cheesecake-frutas-vermelhas.jpg";
import brownieComSorvete from "@/assets/dishes/brownie-com-sorvete.jpg";
import macaronTrio from "@/assets/dishes/macaron-trio.jpg";
import cafeGeladoAfogado from "@/assets/dishes/cafe-gelado-afogado.jpg";
import muleDeGengibre from "@/assets/dishes/mule-de-gengibre.jpg";
import negroniClassico from "@/assets/dishes/negroni-classico.jpg";
import cevicheDeTilapia from "@/assets/dishes/ceviche-de-tilapia.jpg";
import espumaDeMaracuja from "@/assets/dishes/espuma-de-maracuja.jpg";

export type Dish = {
  id: string;
  name: string;
  house: string;
  category: "Destaques" | "Principais" | "Doces" | "Drinks";
  price: number;
  rating: number;
  time: string;
  tags: string[];
  image: string;
  description: string;
};

export const dishes: Dish[] = [
  // Afya Grill Duque de Caxias — Grill
  {
    id: "smash-ouro",
    name: "Smash Ouro",
    house: "Afya Grill Duque de Caxias",
    category: "Destaques",
    price: 48.9,
    rating: 4.9,
    time: "25–35 min",
    tags: ["Angus", "Cheddar curado", "Pão brioche"],
    image: burger,
    description:
      "Dois discos de angus maturado, cheddar inglês derretido na chapa e bacon caramelizado no bourbon. Servido no brioche amanteigado da casa.",
  },
  {
    id: "duplo-cheddar-brasa",
    name: "Duplo Cheddar Brasa",
    house: "Afya Grill Duque de Caxias",
    category: "Principais",
    price: 52.9,
    rating: 4.8,
    time: "20–30 min",
    tags: ["Duplo blend", "Cheddar derretido", "Cebola caramelizada"],
    image: duploCheddarBrasa,
    description:
      "Blend autoral 180g x2, camadas generosas de cheddar derretido na chapa e cebola caramelizada lentamente no próprio suco da carne.",
  },
  {
    id: "costela-fogo-de-chao",
    name: "Costela 12h no Fogo de Chão",
    house: "Afya Grill Duque de Caxias",
    category: "Principais",
    price: 68.0,
    rating: 4.9,
    time: "35–45 min",
    tags: ["12h de cocção", "Defumado lento", "Farofa crocante"],
    image: costelaFogoDeChao,
    description:
      "Costela bovina defumada por 12 horas em fogo de chão, desmanchando no garfo, servida com farofa crocante e vinagrete da casa.",
  },
  {
    id: "picanha-na-brasa",
    name: "Picanha na Brasa",
    house: "Afya Grill Duque de Caxias",
    category: "Destaques",
    price: 89.0,
    rating: 5.0,
    time: "30–40 min",
    tags: ["Angus certificado", "Ponto perfeito", "Sal grosso"],
    image: picanhaNaBrasa,
    description:
      "Corte nobre angus certificado, selado na brasa viva e finalizado no ponto exato pedido, com sal grosso e manteiga de ervas.",
  },
  {
    id: "old-fashioned-brasa",
    name: "Old Fashioned da Brasa",
    house: "Afya Grill Duque de Caxias",
    category: "Drinks",
    price: 38.0,
    rating: 4.7,
    time: "10–15 min",
    tags: ["Bourbon", "Angostura", "Laranja queimada"],
    image: oldFashionedBrasa,
    description:
      "Bourbon envelhecido, angostura artesanal e casca de laranja queimada na chama, servido sobre gelo em cubo único.",
  },

  // Afya Grill Copacabana — Italiana
  {
    id: "tagliatelle-trufa",
    name: "Tagliatelle Trufado",
    house: "Afya Grill Copacabana",
    category: "Principais",
    price: 72.0,
    rating: 4.8,
    time: "30–40 min",
    tags: ["Massa fresca", "Trufa negra", "Parmesão 24m"],
    image: pasta,
    description:
      "Massa fresca laminada na hora, manteiga noisette, lascas generosas de trufa negra e parmigiano reggiano envelhecido 24 meses.",
  },
  {
    id: "risoto-funghi",
    name: "Risoto ai Funghi",
    house: "Afya Grill Copacabana",
    category: "Principais",
    price: 64.0,
    rating: 4.8,
    time: "30–35 min",
    tags: ["Arbóreo", "Cogumelos selvagens", "Manteiga trufada"],
    image: risotoFunghi,
    description:
      "Arroz arbóreo mantecato lentamente, mix de cogumelos selvagens salteados e finalização com manteiga trufada.",
  },
  {
    id: "burrata-affumicata",
    name: "Burrata Affumicata",
    house: "Afya Grill Copacabana",
    category: "Destaques",
    price: 46.0,
    rating: 4.7,
    time: "15–20 min",
    tags: ["Burrata defumada na hora", "Tomate confit", "Pesto fresco"],
    image: burrataAffumicata,
    description:
      "Burrata defumada na hora à mesa, tomates confitados lentamente em azeite e manjericão e pesto genovês fresco.",
  },
  {
    id: "tiramisu-della-nonna",
    name: "Tiramisù della Nonna",
    house: "Afya Grill Copacabana",
    category: "Doces",
    price: 32.0,
    rating: 4.9,
    time: "10–15 min",
    tags: ["Mascarpone", "Café espresso", "Cacau amargo"],
    image: tiramisuDellaNonna,
    description:
      "Camadas de savoiardi embebidos em espresso, creme de mascarpone aerado e cacau amargo peneirado na hora.",
  },
  {
    id: "negroni-lunare",
    name: "Negroni Lunare",
    house: "Afya Grill Copacabana",
    category: "Drinks",
    price: 40.0,
    rating: 4.8,
    time: "10 min",
    tags: ["Gin italiano", "Campari", "Vermute rosso"],
    image: negroniLunare,
    description:
      "Gin italiano, Campari e vermute rosso em partes iguais, mexidos lentamente com gelo e finalizados com casca de laranja.",
  },

  // Afya Grill Botafogo — Japonesa
  {
    id: "omakase-15",
    name: "Omakase 15 peças",
    house: "Afya Grill Botafogo",
    category: "Destaques",
    price: 139.0,
    rating: 5.0,
    time: "40–50 min",
    tags: ["Peixe do dia", "Shari morno", "Chef's choice"],
    image: sushi,
    description:
      "Seleção do itamae com peixes do dia, cortes nobres e finalizações na maçarica. Uma sequência pensada em ordem de intensidade.",
  },
  {
    id: "combinado-kaze-20",
    name: "Combinado Kaze 20 peças",
    house: "Afya Grill Botafogo",
    category: "Principais",
    price: 98.0,
    rating: 4.9,
    time: "35–45 min",
    tags: ["20 peças", "Sashimi e niguiri", "Molho especial da casa"],
    image: combinadoKaze20,
    description:
      "Combinado generoso com sashimi, niguiri e uramaki selecionados, acompanhado do molho especial autoral da casa.",
  },
  {
    id: "uramaki-salmao-crocante",
    name: "Uramaki Salmão Crocante",
    house: "Afya Grill Botafogo",
    category: "Principais",
    price: 54.0,
    rating: 4.7,
    time: "25–30 min",
    tags: ["Salmão maçaricado", "Crocante de panko", "Cream cheese trufado"],
    image: uramakiSalmaoCrocante,
    description:
      "Salmão maçaricado, crocante de panko dourado e recheio de cream cheese trufado, finalizado com molho unagi.",
  },
  {
    id: "temaki-atum-picante",
    name: "Temaki Atum Picante",
    house: "Afya Grill Botafogo",
    category: "Destaques",
    price: 38.0,
    rating: 4.8,
    time: "15–20 min",
    tags: ["Atum fresco", "Molho picante da casa", "Alga tostada"],
    image: temakiAtumPicante,
    description:
      "Atum fresco cortado na hora, molho picante autoral e alga tostada crocante, enrolado no ponto para não perder a textura.",
  },
  {
    id: "sake-junmai-gelado",
    name: "Saquê Junmai Gelado",
    house: "Afya Grill Botafogo",
    category: "Drinks",
    price: 46.0,
    rating: 4.6,
    time: "5 min",
    tags: ["Importado", "Servido a 8°C", "Notas florais"],
    image: sakeJunmaiGelado,
    description: "Saquê junmai importado, servido gelado a 8°C, com notas florais e final limpo.",
  },

  // Afya Grill Ipanema — Pizzaria
  {
    id: "margherita-lenha",
    name: "Margherita de Lenha",
    house: "Afya Grill Ipanema",
    category: "Principais",
    price: 59.5,
    rating: 4.7,
    time: "20–30 min",
    tags: ["Fermentação 48h", "Fior di latte", "Manjericão"],
    image: pizza,
    description:
      "Massa de fermentação natural por 48 horas, San Marzano DOP, fior di latte e manjericão colhido no dia. 90 segundos a 480°C.",
  },
  {
    id: "quattro-formaggi",
    name: "Quattro Formaggi",
    house: "Afya Grill Ipanema",
    category: "Principais",
    price: 64.9,
    rating: 4.7,
    time: "20–30 min",
    tags: ["Gorgonzola", "Parmesão", "Provolone defumado"],
    image: quattroFormaggi,
    description:
      "Blend de quatro queijos italianos — gorgonzola, parmesão, provolone defumado e mussarela de búfala — sobre massa de longa fermentação.",
  },
  {
    id: "calabresa-artesanal",
    name: "Calabresa Artesanal",
    house: "Afya Grill Ipanema",
    category: "Principais",
    price: 57.0,
    rating: 4.6,
    time: "20–30 min",
    tags: ["Linguiça artesanal", "Cebola roxa", "Azeitonas pretas"],
    image: calabresaArtesanal,
    description:
      "Linguiça calabresa artesanal fatiada fina, cebola roxa em pétalas e azeitonas pretas, assada no forno a lenha.",
  },
  {
    id: "panna-cotta-baunilha",
    name: "Panna Cotta de Baunilha",
    house: "Afya Grill Ipanema",
    category: "Doces",
    price: 28.0,
    rating: 4.8,
    time: "10–15 min",
    tags: ["Baunilha bourbon", "Calda de frutas vermelhas", "Textura sedosa"],
    image: pannaCottaBaunilha,
    description:
      "Panna cotta de baunilha bourbon com textura sedosa, coberta por calda artesanal de frutas vermelhas frescas.",
  },
  {
    id: "spritz-sette",
    name: "Spritz Sette",
    house: "Afya Grill Ipanema",
    category: "Drinks",
    price: 36.0,
    rating: 4.7,
    time: "10 min",
    tags: ["Aperol", "Prosecco", "Laranja fresca"],
    image: spritzSette,
    description:
      "Aperol, prosecco gelado e um toque de água com gás, finalizado com rodela de laranja fresca.",
  },

  // Afya Grill Leblon — Confeitaria
  {
    id: "lava-gold",
    name: "Lava Gold",
    house: "Afya Grill Leblon",
    category: "Doces",
    price: 34.0,
    rating: 4.9,
    time: "15–25 min",
    tags: ["Chocolate 70%", "Ouro comestível", "Quente"],
    image: dessert,
    description:
      "Petit gâteau de chocolate belga 70% com centro fluido, folha de ouro comestível e crocante de caramelo salgado.",
  },
  {
    id: "cheesecake-frutas-vermelhas",
    name: "Cheesecake de Frutas Vermelhas",
    house: "Afya Grill Leblon",
    category: "Doces",
    price: 30.0,
    rating: 4.8,
    time: "10–15 min",
    tags: ["Base amanteigada", "Cream cheese", "Calda artesanal"],
    image: cheesecakeFrutasVermelhas,
    description:
      "Base amanteigada crocante, recheio cremoso de cream cheese e calda artesanal de frutas vermelhas frescas.",
  },
  {
    id: "brownie-com-sorvete",
    name: "Brownie com Sorvete",
    house: "Afya Grill Leblon",
    category: "Doces",
    price: 26.0,
    rating: 4.9,
    time: "10–15 min",
    tags: ["Chocolate 60%", "Sorvete de creme", "Calda quente"],
    image: brownieComSorvete,
    description:
      "Brownie denso de chocolate 60%, servido quente com bola de sorvete de creme e calda quente de chocolate.",
  },
  {
    id: "macaron-trio",
    name: "Macaron Trio",
    house: "Afya Grill Leblon",
    category: "Doces",
    price: 22.0,
    rating: 4.7,
    time: "5–10 min",
    tags: ["Pistache", "Framboesa", "Chocolate belga"],
    image: macaronTrio,
    description: "Trio de macarons franceses nos sabores pistache, framboesa e chocolate belga.",
  },
  {
    id: "cafe-gelado-afogado",
    name: "Café Gelado Afogado",
    house: "Afya Grill Leblon",
    category: "Drinks",
    price: 24.0,
    rating: 4.8,
    time: "5–10 min",
    tags: ["Espresso duplo", "Sorvete de baunilha", "Servido na hora"],
    image: cafeGeladoAfogado,
    description:
      "Espresso duplo servido na hora sobre uma bola de sorvete de baunilha, ao estilo affogato.",
  },

  // Afya Grill Flamengo — Coquetelaria
  {
    id: "smoked-citrus",
    name: "Smoked Citrus",
    house: "Afya Grill Flamengo",
    category: "Drinks",
    price: 42.0,
    rating: 4.8,
    time: "10–20 min",
    tags: ["Defumado", "Cítrico", "Autoral"],
    image: drink,
    description:
      "Gin artesanal, licor de laranja queimada e defumação de macieira feita na taça no momento do serviço.",
  },
  {
    id: "mule-de-gengibre",
    name: "Mule de Gengibre",
    house: "Afya Grill Flamengo",
    category: "Drinks",
    price: 36.0,
    rating: 4.7,
    time: "10 min",
    tags: ["Vodka", "Gengibre artesanal", "Limão siciliano"],
    image: muleDeGengibre,
    description:
      "Vodka premium, ginger beer artesanal e limão siciliano espremido na hora, servido em caneca de cobre.",
  },
  {
    id: "negroni-classico",
    name: "Negroni Clássico",
    house: "Afya Grill Flamengo",
    category: "Drinks",
    price: 38.0,
    rating: 4.8,
    time: "10 min",
    tags: ["Gin", "Campari", "Vermute rosso"],
    image: negroniClassico,
    description:
      "A receita clássica em partes iguais de gin, Campari e vermute rosso, mexida lentamente sobre gelo.",
  },
  {
    id: "ceviche-de-tilapia",
    name: "Ceviche de Tilápia",
    house: "Afya Grill Flamengo",
    category: "Destaques",
    price: 44.0,
    rating: 4.7,
    time: "15–20 min",
    tags: ["Leite de tigre", "Pimenta biquinho", "Cebola roxa"],
    image: cevicheDeTilapia,
    description:
      "Tilápia curada na hora em leite de tigre cítrico, pimenta biquinho e cebola roxa em finas fatias.",
  },
  {
    id: "espuma-de-maracuja",
    name: "Espuma de Maracujá",
    house: "Afya Grill Flamengo",
    category: "Doces",
    price: 26.0,
    rating: 4.6,
    time: "10 min",
    tags: ["Maracujá fresco", "Textura aerada", "Toque cítrico"],
    image: espumaDeMaracuja,
    description:
      "Espuma aerada de maracujá fresco com toque cítrico, sobre crocante de castanha caramelizada.",
  },
];

export const categories = ["Todos", "Destaques", "Principais", "Doces", "Drinks"] as const;

export const brl = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
