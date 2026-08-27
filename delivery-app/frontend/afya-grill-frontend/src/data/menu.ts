import burger from "@/assets/dish-burger.jpg";

import cheeseburgerClassico from "@/assets/burgers/cheeseburger-classico.jpg";
import duploBacon from "@/assets/burgers/duplo-bacon.jpg";
import veggieGrelhado from "@/assets/burgers/veggie-grelhado.jpg";
import bbqOnion from "@/assets/burgers/bbq-onion.jpg";
import batataFritaClassica from "@/assets/burgers/batata-frita-classica.jpg";
import batataRusticaCheddarBacon from "@/assets/burgers/batata-rustica-cheddar-bacon.jpg";
import batataDoceFrita from "@/assets/burgers/batata-doce-frita.jpg";
import refrigeranteLata from "@/assets/burgers/refrigerante-lata.jpg";
import sucoNaturalLaranja from "@/assets/burgers/suco-natural-laranja.jpg";
import milkshakeChocolate from "@/assets/burgers/milkshake-chocolate.jpg";
import limonada from "@/assets/burgers/limonada.jpg";
import aguaComGas from "@/assets/burgers/agua-com-gas.jpg";
import frangoCrocanteSupreme from "@/assets/burgers/frango-crocante-supreme.jpg";
import petitGateau from "@/assets/burgers/petit-gateau.jpg";
import comboDuoClassico from "@/assets/burgers/combo-duo-classico.jpg";
import comboDuoBacon from "@/assets/burgers/combo-duo-bacon.jpg";
import cheesecakeFrutasVermelhas from "@/assets/burgers/cheesecake-frutas-vermelhas.jpg";
import tortaChocolateBelga from "@/assets/burgers/torta-chocolate-belga.jpg";
import tortaMorango from "@/assets/burgers/torta-morango.jpg";
import aguaSemGas from "@/assets/burgers/agua-sem-gas.jpg";
import cocaColaLata from "@/assets/burgers/coca-cola-lata.jpg";
import fantaLaranjaLata from "@/assets/burgers/fanta-laranja-lata.jpg";
import spriteLata from "@/assets/burgers/sprite-lata.jpg";
import milkshakeMorango from "@/assets/burgers/milkshake-morango.jpg";
import milkshakeDoceDeLeite from "@/assets/burgers/milkshake-doce-de-leite.jpg";

export type Dish = {
  id: string;
  name: string;
  house: string;
  category:
    | "Hambúrgueres"
    | "Batatas"
    | "Combos"
    | "Sobremesas"
    | "Água"
    | "Milkshakes"
    | "Refrigerantes"
    | "Sucos";
  price: number;
  rating: number;
  time: string;
  tags: string[];
  image: string;
  description: string;
};

export const dishes: Dish[] = [
  // Hambúrgueres
  {
    id: "smash-ouro",
    name: "Smash Ouro",
    house: "Afya Grill",
    category: "Hambúrgueres",
    price: 32.9,
    rating: 4.9,
    time: "15–20 min",
    tags: ["Angus", "Cheddar curado", "Pão brioche"],
    image: burger,
    description:
      "Dois discos de angus maturado, cheddar inglês derretido na chapa e bacon caramelizado no bourbon. Servido no brioche amanteigado da casa.",
  },
  {
    id: "cheeseburger-classico",
    name: "Cheeseburger Clássico",
    house: "Afya Grill",
    category: "Hambúrgueres",
    price: 28.9,
    rating: 4.7,
    time: "15–20 min",
    tags: ["Picles", "Cheddar", "Mostarda"],
    image: cheeseburgerClassico,
    description:
      "O clássico de sempre: blend suculento, cheddar derretido, picles e cebola em rodelas, com uma pitada de mostarda dijon.",
  },
  {
    id: "duplo-bacon",
    name: "Duplo Bacon BBQ",
    house: "Afya Grill",
    category: "Hambúrgueres",
    price: 36.9,
    rating: 4.9,
    time: "20–25 min",
    tags: ["Duplo blend", "Bacon crocante", "Molho barbecue"],
    image: duploBacon,
    description:
      "Dois blends grelhados, fatias generosas de bacon crocante e molho barbecue defumado da casa, no ponto de escorrer pelo dedo.",
  },
  {
    id: "veggie-grelhado",
    name: "Veggie Grelhado",
    house: "Afya Grill",
    category: "Hambúrgueres",
    price: 29.9,
    rating: 4.6,
    time: "15–20 min",
    tags: ["100% vegetal", "Grelhado na chapa", "Tomate fresco"],
    image: veggieGrelhado,
    description:
      "Hambúrguer vegetal grelhado na chapa, tomate fresco fatiado e mostarda artesanal, para quem quer o sabor sem a carne.",
  },
  {
    id: "bbq-onion",
    name: "BBQ Onion",
    house: "Afya Grill",
    category: "Hambúrgueres",
    price: 34.9,
    rating: 4.8,
    time: "20–25 min",
    tags: ["Cebola crispy", "Molho barbecue", "Cheddar"],
    image: bbqOnion,
    description:
      "Blend na chapa, cheddar derretido, anéis de cebola crocante e bastante molho barbecue — o queridinho de quem gosta de sujar a mão.",
  },
  {
    id: "frango-crocante-supreme",
    name: "Frango Crocante Supreme",
    house: "Afya Grill",
    category: "Hambúrgueres",
    price: 33.9,
    rating: 4.8,
    time: "20–25 min",
    tags: ["Frango empanado", "Maionese da casa", "Pão brioche"],
    image: frangoCrocanteSupreme,
    description:
      "Peito de frango empanado e frito na hora, extra crocante, com maionese da casa e alface no brioche amanteigado.",
  },

  // Batatas
  {
    id: "batata-frita-classica",
    name: "Batata Frita Clássica",
    house: "Afya Grill",
    category: "Batatas",
    price: 14.9,
    rating: 4.6,
    time: "10–15 min",
    tags: ["Crocante por fora", "Macia por dentro", "Sal na medida"],
    image: batataFritaClassica,
    description: "Batatas fritas na hora, douradas e crocantes por fora, macias por dentro.",
  },
  {
    id: "batata-rustica-cheddar-bacon",
    name: "Batata Rústica Cheddar e Bacon",
    house: "Afya Grill",
    category: "Batatas",
    price: 22.9,
    rating: 4.9,
    time: "15–20 min",
    tags: ["Molho cheddar", "Bacon crocante", "Cebolinha"],
    image: batataRusticaCheddarBacon,
    description:
      "Batata rústica coberta com molho cheddar cremoso, bacon crocante e cebolinha fresca picada na hora.",
  },
  {
    id: "batata-doce-frita",
    name: "Batata Doce Frita",
    house: "Afya Grill",
    category: "Batatas",
    price: 16.9,
    rating: 4.7,
    time: "10–15 min",
    tags: ["Levemente adocicada", "Crocante", "Sem glúten"],
    image: batataDoceFrita,
    description:
      "Palitos de batata doce fritos na hora, com aquele equilíbrio entre doce e salgado.",
  },

  // Combos — para 2 pessoas, já vêm com hambúrguer, batata, sobremesa e molho
  {
    id: "combo-duo-classico",
    name: "Combo Duo Clássico",
    house: "Afya Grill",
    category: "Combos",
    price: 58.9,
    rating: 4.9,
    time: "25–30 min",
    tags: ["2 pessoas", "2x Cheeseburger Clássico", "Serve bem no bolso"],
    image: comboDuoClassico,
    description:
      "Para 2 pessoas: 2 Cheeseburger Clássico, 1 Batata Frita Clássica grande para dividir, 2 Petit Gâteau de sobremesa e molho barbecue da casa. O combo redondo pra matar a fome sem estourar o orçamento.",
  },
  {
    id: "combo-duo-bacon",
    name: "Combo Duo Bacon",
    house: "Afya Grill",
    category: "Combos",
    price: 74.9,
    rating: 4.9,
    time: "25–30 min",
    tags: ["2 pessoas", "2x Duplo Bacon BBQ", "Serve bem pesado"],
    image: comboDuoBacon,
    description:
      "Para 2 pessoas: 2 Duplo Bacon BBQ, 1 Batata Rústica Cheddar e Bacon grande para dividir, 2 Petit Gâteau de sobremesa e molho barbecue extra. Pra quem não abre mão de bacon em dobro.",
  },

  // Sobremesas
  {
    id: "petit-gateau",
    name: "Petit Gâteau",
    house: "Afya Grill",
    category: "Sobremesas",
    price: 19.9,
    rating: 4.9,
    time: "10–15 min",
    tags: ["Casquinha crocante", "Recheio derretido", "Sorvete de creme"],
    image: petitGateau,
    description:
      "Bolinho de chocolate quente com casquinha crocante e recheio derretido, servido com uma bola de sorvete de creme e frutas vermelhas.",
  },
  {
    id: "cheesecake-frutas-vermelhas",
    name: "Cheesecake de Frutas Vermelhas",
    house: "Afya Grill",
    category: "Sobremesas",
    price: 21.9,
    rating: 4.8,
    time: "10 min",
    tags: ["Base amanteigada", "Mirtilos frescos", "Cremoso"],
    image: cheesecakeFrutasVermelhas,
    description: "Cheesecake cremoso com base amanteigada, coberto com mirtilos frescos.",
  },
  {
    id: "torta-chocolate-belga",
    name: "Torta de Chocolate Belga",
    house: "Afya Grill",
    category: "Sobremesas",
    price: 18.9,
    rating: 4.9,
    time: "10 min",
    tags: ["Camadas de chocolate", "Ganache", "Intenso"],
    image: tortaChocolateBelga,
    description:
      "Torta em camadas de chocolate belga com ganache cremoso, para quem não brinca em serviço.",
  },
  {
    id: "torta-morango",
    name: "Torta de Morango",
    house: "Afya Grill",
    category: "Sobremesas",
    price: 17.9,
    rating: 4.7,
    time: "10 min",
    tags: ["Morangos frescos", "Creme leve", "Refrescante"],
    image: tortaMorango,
    description: "Torta com base crocante, creme leve e morangos frescos brilhando por cima.",
  },

  // Água
  {
    id: "agua-com-gas",
    name: "Água com Gás",
    house: "Afya Grill",
    category: "Água",
    price: 6.5,
    rating: 4.5,
    time: "1 min",
    tags: ["500ml", "Gelada"],
    image: aguaComGas,
    description: "Água com gás gelada, 500ml.",
  },
  {
    id: "agua-sem-gas",
    name: "Água sem Gás",
    house: "Afya Grill",
    category: "Água",
    price: 5.5,
    rating: 4.5,
    time: "1 min",
    tags: ["500ml", "Gelada"],
    image: aguaSemGas,
    description: "Água mineral sem gás, 500ml, sempre gelada.",
  },

  // Milkshakes
  {
    id: "milkshake-chocolate",
    name: "Milkshake de Chocolate",
    house: "Afya Grill",
    category: "Milkshakes",
    price: 17.9,
    rating: 4.9,
    time: "5–10 min",
    tags: ["Chocolate belga", "Chantilly", "Cereja"],
    image: milkshakeChocolate,
    description: "Milkshake cremoso de chocolate belga, coberto com chantilly e cereja.",
  },
  {
    id: "milkshake-morango",
    name: "Milkshake de Morango",
    house: "Afya Grill",
    category: "Milkshakes",
    price: 16.9,
    rating: 4.7,
    time: "5–10 min",
    tags: ["Morango natural", "Cremoso", "Hortelã"],
    image: milkshakeMorango,
    description: "Milkshake cremoso de morango natural, com um toque de hortelã fresca.",
  },
  {
    id: "milkshake-doce-de-leite",
    name: "Milkshake de Doce de Leite",
    house: "Afya Grill",
    category: "Milkshakes",
    price: 17.9,
    rating: 4.8,
    time: "5–10 min",
    tags: ["Doce de leite", "Chantilly", "Calda de caramelo"],
    image: milkshakeDoceDeLeite,
    description: "Milkshake cremoso de doce de leite, coberto com chantilly e calda de caramelo.",
  },

  // Refrigerantes
  {
    id: "refrigerante-lata",
    name: "Refrigerante Lata",
    house: "Afya Grill",
    category: "Refrigerantes",
    price: 7.0,
    rating: 4.5,
    time: "2 min",
    tags: ["Gelado", "350ml"],
    image: refrigeranteLata,
    description: "Lata de 350ml, sempre gelada, nos sabores cola, guaraná ou limão.",
  },
  {
    id: "coca-cola-lata",
    name: "Coca-Cola Lata",
    house: "Afya Grill",
    category: "Refrigerantes",
    price: 7.0,
    rating: 4.8,
    time: "2 min",
    tags: ["Gelada", "350ml"],
    image: cocaColaLata,
    description: "Lata de Coca-Cola, 350ml, sempre gelada.",
  },
  {
    id: "fanta-laranja-lata",
    name: "Fanta Laranja Lata",
    house: "Afya Grill",
    category: "Refrigerantes",
    price: 7.0,
    rating: 4.6,
    time: "2 min",
    tags: ["Gelada", "350ml"],
    image: fantaLaranjaLata,
    description: "Lata de Fanta Laranja, 350ml, sempre gelada.",
  },
  {
    id: "sprite-lata",
    name: "Sprite Lata",
    house: "Afya Grill",
    category: "Refrigerantes",
    price: 7.0,
    rating: 4.6,
    time: "2 min",
    tags: ["Gelada", "350ml"],
    image: spriteLata,
    description: "Lata de Sprite, 350ml, sempre gelada.",
  },

  // Sucos
  {
    id: "suco-natural-laranja",
    name: "Suco Natural de Laranja",
    house: "Afya Grill",
    category: "Sucos",
    price: 9.9,
    rating: 4.8,
    time: "5 min",
    tags: ["Espremido na hora", "Sem açúcar adicionado"],
    image: sucoNaturalLaranja,
    description: "Suco de laranja espremido na hora, sem adição de açúcar.",
  },
  {
    id: "limonada",
    name: "Limonada da Casa",
    house: "Afya Grill",
    category: "Sucos",
    price: 11.9,
    rating: 4.7,
    time: "5 min",
    tags: ["Limão siciliano", "Hortelã", "Gelada"],
    image: limonada,
    description: "Limonada gelada com limão siciliano e um toque de hortelã fresca.",
  },
];

export const categories = [
  "Todos",
  "Hambúrgueres",
  "Batatas",
  "Combos",
  "Sobremesas",
  "Água",
  "Milkshakes",
  "Refrigerantes",
  "Sucos",
] as const;

export const brl = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
