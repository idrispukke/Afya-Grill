export type Unit = {
  id: string;
  name: string;
  bairro: string;
  cidade: string;
  endereco: string;
  especialidade: string;
  rating: string;
  time: string;
  lat: number;
  lng: number;
};

export const units: Unit[] = [
  {
    id: "duque-de-caxias",
    name: "Afya Grill Duque de Caxias",
    bairro: "Centro",
    cidade: "Duque de Caxias",
    endereco: "Av. Presidente Vargas, 1200 — Centro, Duque de Caxias, RJ",
    especialidade: "Grill",
    rating: "4.9",
    time: "25 min",
    lat: -22.7858,
    lng: -43.3053,
  },
  {
    id: "copacabana",
    name: "Afya Grill Copacabana",
    bairro: "Copacabana",
    cidade: "Rio de Janeiro",
    endereco: "Av. Atlântica, 1702 — Copacabana, Rio de Janeiro, RJ",
    especialidade: "Italiana",
    rating: "4.8",
    time: "35 min",
    lat: -22.9711,
    lng: -43.1822,
  },
  {
    id: "botafogo",
    name: "Afya Grill Botafogo",
    bairro: "Botafogo",
    cidade: "Rio de Janeiro",
    endereco: "Rua Voluntários da Pátria, 45 — Botafogo, Rio de Janeiro, RJ",
    especialidade: "Japonesa",
    rating: "5.0",
    time: "40 min",
    lat: -22.9519,
    lng: -43.1823,
  },
  {
    id: "ipanema",
    name: "Afya Grill Ipanema",
    bairro: "Ipanema",
    cidade: "Rio de Janeiro",
    endereco: "Rua Visconde de Pirajá, 414 — Ipanema, Rio de Janeiro, RJ",
    especialidade: "Pizzaria",
    rating: "4.7",
    time: "30 min",
    lat: -22.9838,
    lng: -43.2096,
  },
  {
    id: "leblon",
    name: "Afya Grill Leblon",
    bairro: "Leblon",
    cidade: "Rio de Janeiro",
    endereco: "Av. Ataulfo de Paiva, 1240 — Leblon, Rio de Janeiro, RJ",
    especialidade: "Confeitaria",
    rating: "4.9",
    time: "20 min",
    lat: -22.9846,
    lng: -43.2246,
  },
  {
    id: "flamengo",
    name: "Afya Grill Flamengo",
    bairro: "Flamengo",
    cidade: "Rio de Janeiro",
    endereco: "Praia do Flamengo, 200 — Flamengo, Rio de Janeiro, RJ",
    especialidade: "Coquetelaria",
    rating: "4.8",
    time: "15 min",
    lat: -22.9346,
    lng: -43.1729,
  },
];
