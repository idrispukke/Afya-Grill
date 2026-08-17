export type OrderStatus = "Novo" | "Preparando" | "A caminho" | "Entregue" | "Cancelado";

export type AdminOrder = {
  id: string;
  cliente: string;
  casa: string;
  itens: string;
  total: number;
  pagamento: "Pix" | "Cartão" | "Dinheiro";
  status: OrderStatus;
  criadoEm: string;
  entregador: string;
};

export type AdminProduct = {
  id: string;
  nome: string;
  casa: string;
  categoria: "Destaques" | "Principais" | "Doces" | "Drinks";
  preco: number;
  estoque: number;
  ativo: boolean;
};

export type AdminHouse = {
  id: string;
  nome: string;
  bairro: string;
  cozinha: string;
  nota: number;
  ativo: boolean;
  comissao: number;
};

export type AdminCustomer = {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  pedidos: number;
  gasto: number;
  vip: boolean;
};

export type AdminCourier = {
  id: string;
  nome: string;
  veiculo: "Moto" | "Bike";
  zona: string;
  entregasHoje: number;
  status: "Disponível" | "Em rota" | "Offline";
};

export type AdminCoupon = {
  id: string;
  codigo: string;
  tipo: "Percentual" | "Fixo";
  valor: number;
  usos: number;
  ativo: boolean;
};

export type AdminReview = {
  id: string;
  cliente: string;
  casa: string;
  nota: number;
  comentario: string;
  respondido: boolean;
};

export type AdminStaff = {
  id: string;
  nome: string;
  email: string;
  cargo: "Administrador" | "Gerente" | "Atendente";
  ativo: boolean;
};

export type AdminPayout = {
  id: string;
  casa: string;
  periodo: string;
  bruto: number;
  taxa: number;
  status: "Pago" | "Pendente";
};

export const seedOrders: AdminOrder[] = [
  {
    id: "AFY-2041",
    cliente: "Marina Duarte",
    casa: "Brasa & Cia",
    itens: "2x Smash Ouro",
    total: 97.8,
    pagamento: "Pix",
    status: "Preparando",
    criadoEm: "20:14",
    entregador: "Rafael Lima",
  },
  {
    id: "AFY-2042",
    cliente: "Caio Bentes",
    casa: "Kaze Sushi Bar",
    itens: "1x Omakase 15 peças",
    total: 139,
    pagamento: "Cartão",
    status: "A caminho",
    criadoEm: "20:31",
    entregador: "Bruna Alves",
  },
];

export const seedProducts: AdminProduct[] = [
  {
    id: "smash-ouro",
    nome: "Smash Ouro",
    casa: "Brasa & Cia",
    categoria: "Destaques",
    preco: 48.9,
    estoque: 24,
    ativo: true,
  },
  {
    id: "lava-gold",
    nome: "Lava Gold",
    casa: "Doce Atelier",
    categoria: "Doces",
    preco: 34,
    estoque: 8,
    ativo: true,
  },
];

export const seedHouses: AdminHouse[] = [
  {
    id: "brasa",
    nome: "Brasa & Cia",
    bairro: "Centro, Duque de Caxias",
    cozinha: "Grill",
    nota: 4.9,
    ativo: true,
    comissao: 12,
  },
  {
    id: "kaze",
    nome: "Kaze Sushi Bar",
    bairro: "Jardim 25 de Agosto",
    cozinha: "Japonesa",
    nota: 5,
    ativo: true,
    comissao: 15,
  },
];

export const seedCustomers: AdminCustomer[] = [
  {
    id: "c1",
    nome: "Marina Duarte",
    email: "marina@email.com",
    telefone: "(21) 98812-4410",
    pedidos: 18,
    gasto: 1420.5,
    vip: true,
  },
  {
    id: "c2",
    nome: "Caio Bentes",
    email: "caio@email.com",
    telefone: "(21) 99604-7723",
    pedidos: 6,
    gasto: 512,
    vip: false,
  },
];

export const seedCouriers: AdminCourier[] = [
  {
    id: "e1",
    nome: "Rafael Lima",
    veiculo: "Moto",
    zona: "Caxias Centro",
    entregasHoje: 11,
    status: "Em rota",
  },
  {
    id: "e2",
    nome: "Bruna Alves",
    veiculo: "Bike",
    zona: "Vila São Luís",
    entregasHoje: 7,
    status: "Disponível",
  },
];

export const seedCoupons: AdminCoupon[] = [
  { id: "k1", codigo: "AFYA10", tipo: "Percentual", valor: 10, usos: 214, ativo: true },
  { id: "k2", codigo: "BRASA20", tipo: "Fixo", valor: 20, usos: 61, ativo: false },
];

export const seedReviews: AdminReview[] = [
  {
    id: "r1",
    cliente: "Marina Duarte",
    casa: "Brasa & Cia",
    nota: 5,
    comentario: "Chegou quente e no ponto perfeito. O brioche é surreal.",
    respondido: true,
  },
  {
    id: "r2",
    cliente: "Caio Bentes",
    casa: "Kaze Sushi Bar",
    nota: 4,
    comentario: "Omakase impecável, só demorou 10 min a mais que o previsto.",
    respondido: false,
  },
];

export const seedStaff: AdminStaff[] = [
  {
    id: "s1",
    nome: "Equipe Afya",
    email: "admin@afyagrill.com",
    cargo: "Administrador",
    ativo: true,
  },
  {
    id: "s2",
    nome: "Júlia Prado",
    email: "julia@afyagrill.com",
    cargo: "Gerente",
    ativo: true,
  },
];

export const seedPayouts: AdminPayout[] = [
  { id: "p1", casa: "Brasa & Cia", periodo: "01–15 Ago", bruto: 18420, taxa: 12, status: "Pago" },
  {
    id: "p2",
    casa: "Kaze Sushi Bar",
    periodo: "01–15 Ago",
    bruto: 22150,
    taxa: 15,
    status: "Pendente",
  },
];

export const revenueSeries = [
  { dia: "Seg", valor: 4200 },
  { dia: "Ter", valor: 5100 },
  { dia: "Qua", valor: 4780 },
  { dia: "Qui", valor: 6320 },
  { dia: "Sex", valor: 9140 },
  { dia: "Sáb", valor: 11280 },
  { dia: "Dom", valor: 8760 },
];

export const statusFlow: OrderStatus[] = [
  "Novo",
  "Preparando",
  "A caminho",
  "Entregue",
  "Cancelado",
];
