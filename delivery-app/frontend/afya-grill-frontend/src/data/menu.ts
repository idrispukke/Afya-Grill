import burger from "@/assets/dish-burger.jpg";
import pasta from "@/assets/dish-pasta.jpg";
import sushi from "@/assets/dish-sushi.jpg";
import pizza from "@/assets/dish-pizza.jpg";
import dessert from "@/assets/dish-dessert.jpg";
import drink from "@/assets/dish-drink.jpg";

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
  {
    id: "smash-ouro",
    name: "Smash Ouro",
    house: "Brasa & Cia",
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
    id: "tagliatelle-trufa",
    name: "Tagliatelle Trufado",
    house: "Osteria Lunare",
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
    id: "omakase-15",
    name: "Omakase 15 peças",
    house: "Kaze Sushi Bar",
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
    id: "margherita-lenha",
    name: "Margherita de Lenha",
    house: "Forno Sette",
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
    id: "lava-gold",
    name: "Lava Gold",
    house: "Doce Atelier",
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
    id: "smoked-citrus",
    name: "Smoked Citrus",
    house: "Bar Ébano",
    category: "Drinks",
    price: 42.0,
    rating: 4.8,
    time: "10–20 min",
    tags: ["Defumado", "Cítrico", "Autoral"],
    image: drink,
    description:
      "Gin artesanal, licor de laranja queimada e defumação de macieira feita na taça no momento do serviço.",
  },
];

export const categories = ["Todos", "Destaques", "Principais", "Doces", "Drinks"] as const;

export const brl = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
