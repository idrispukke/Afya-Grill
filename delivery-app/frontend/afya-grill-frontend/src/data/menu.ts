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

export type Dish = {
  id: string;
  name: string;
  house: string;
  category: "Hambúrgueres" | "Batatas" | "Bebidas";
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

  // Bebidas
  {
    id: "refrigerante-lata",
    name: "Refrigerante Lata",
    house: "Afya Grill",
    category: "Bebidas",
    price: 7.0,
    rating: 4.5,
    time: "2 min",
    tags: ["Gelado", "350ml"],
    image: refrigeranteLata,
    description: "Lata de 350ml, sempre gelada, nos sabores cola, guaraná ou limão.",
  },
  {
    id: "suco-natural-laranja",
    name: "Suco Natural de Laranja",
    house: "Afya Grill",
    category: "Bebidas",
    price: 9.9,
    rating: 4.8,
    time: "5 min",
    tags: ["Espremido na hora", "Sem açúcar adicionado"],
    image: sucoNaturalLaranja,
    description: "Suco de laranja espremido na hora, sem adição de açúcar.",
  },
  {
    id: "milkshake-chocolate",
    name: "Milkshake de Chocolate",
    house: "Afya Grill",
    category: "Bebidas",
    price: 17.9,
    rating: 4.9,
    time: "5–10 min",
    tags: ["Chocolate belga", "Chantilly", "Cereja"],
    image: milkshakeChocolate,
    description: "Milkshake cremoso de chocolate belga, coberto com chantilly e cereja.",
  },
  {
    id: "limonada",
    name: "Limonada da Casa",
    house: "Afya Grill",
    category: "Bebidas",
    price: 11.9,
    rating: 4.7,
    time: "5 min",
    tags: ["Limão siciliano", "Hortelã", "Gelada"],
    image: limonada,
    description: "Limonada gelada com limão siciliano e um toque de hortelã fresca.",
  },
  {
    id: "agua-com-gas",
    name: "Água com Gás",
    house: "Afya Grill",
    category: "Bebidas",
    price: 6.5,
    rating: 4.5,
    time: "1 min",
    tags: ["500ml", "Gelada"],
    image: aguaComGas,
    description: "Água com gás gelada, 500ml.",
  },
];

export const categories = ["Todos", "Hambúrgueres", "Batatas", "Bebidas"] as const;

export const brl = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
